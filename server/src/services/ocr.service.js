const { createWorker } = require('tesseract.js');
const logger = require('../utils/logger');
const { DOCUMENT_TYPES } = require('../config/constants');

/**
 * Standard date extraction regexes for common formats:
 * - DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
 * - YYYY-MM-DD, YYYY/MM/DD
 * - DD Mon YYYY (e.g. 12 Apr 2026)
 * - Mon DD, YYYY (e.g. Apr 12, 2026)
 */
const getDatePatterns = () => [
  /\b(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})\b/g,
  /\b(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})\b/g,
  /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})\b/gi,
  /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})\b/gi,
];

/**
 * Normalize extracted date string to ISO format (YYYY-MM-DD).
 * Handles DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, and month-name dates.
 */
const parseExtractedDate = (dateStr) => {
  if (!dateStr) return null;
  const cleaned = dateStr.trim();

  // Pattern 1: YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const ymd = cleaned.match(/^(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})$/);
  if (ymd) {
    const y = parseInt(ymd[1], 10);
    const m = parseInt(ymd[2], 10);
    const d = parseInt(ymd[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  // Pattern 2: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmy = cleaned.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
  if (dmy) {
    const d = parseInt(dmy[1], 10);
    const m = parseInt(dmy[2], 10);
    const y = parseInt(dmy[3], 10);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  // Pattern 3: DD Mon YYYY (e.g. 15 Aug 2026, 15 August 2026)
  const monthMap = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  };

  const dMy = cleaned.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/);
  if (dMy) {
    const d = parseInt(dMy[1], 10);
    const mKey = dMy[2].slice(0, 3).toLowerCase();
    const y = parseInt(dMy[3], 10);
    if (monthMap[mKey] && d >= 1 && d <= 31) {
      return `${y}-${String(monthMap[mKey]).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  // Pattern 4: Mon DD, YYYY (e.g. August 15, 2026)
  const mDy = cleaned.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})$/);
  if (mDy) {
    const mKey = mDy[1].slice(0, 3).toLowerCase();
    const d = parseInt(mDy[2], 10);
    const y = parseInt(mDy[3], 10);
    if (monthMap[mKey] && d >= 1 && d <= 31) {
      return `${y}-${String(monthMap[mKey]).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  // Fallback to Date parser
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return null;
};

/**
 * Detect document type from recognized text keywords.
 */
const detectDocumentType = (text) => {
  const lower = text.toLowerCase();

  if (/passport|republic of india|travel document/i.test(lower)) {
    return 'PASSPORT';
  }
  if (/driving licen[cs]e|driver licen[cs]e|dl no|transport department/i.test(lower)) {
    return 'DRIVING_LICENCE';
  }
  if (/insurance|policy|insured|premium|vehicle insurance/i.test(lower)) {
    return 'VEHICLE_INSURANCE';
  }
  if (/pollution under control|puc|emission test/i.test(lower)) {
    return 'PUC';
  }
  if (/registration certificate|rc|form 23|chassis no|engine no/i.test(lower)) {
    return 'VEHICLE_REGISTRATION';
  }
  if (/rental agreement|lease agreement|tenancy agreement|landlord|tenant/i.test(lower)) {
    return 'RENTAL_AGREEMENT';
  }
  if (/certificate|completion|degree|diploma/i.test(lower)) {
    return 'CERTIFICATE';
  }
  if (/membership|club|subscription/i.test(lower)) {
    return 'MEMBERSHIP';
  }
  if (/warranty|guarantee|invoice/i.test(lower)) {
    return 'WARRANTY';
  }
  if (/medical council|bar council|professional licen[cs]e|board certification/i.test(lower)) {
    return 'PROFESSIONAL_LICENCE';
  }

  return 'OTHER';
};

/**
 * Extract document number using common document identifier regexes.
 */
const detectDocumentNumber = (text) => {
  const lines = text.split('\n');

  for (const line of lines) {
    // Check for explicit "No:" or "Number:" labels
    const match = line.match(
      /(?:doc(?:ument)?|licen[cs]e|policy|passport|certificate|reg(?:istration)?|rc|id|no\.?|num(?:ber)?)\s*[:#-]?\s*([A-Z0-9\/-]{5,25})/i
    );
    if (match && match[1]) {
      const candidate = match[1].trim();
      // Avoid matches that are just words or dates
      if (/[0-9]/.test(candidate) && candidate.length >= 5) {
        return candidate;
      }
    }
  }

  // Fallback: search for standalone alphanumeric code that looks like a document number
  const genericMatch = text.match(/\b([A-Z][0-9]{7,12}|[A-Z]{2}[0-9]{2}[A-Z0-9]{7,11})\b/);
  if (genericMatch) {
    return genericMatch[1];
  }

  return '';
};

/**
 * Extract person or holder name from document.
 */
const detectName = (text) => {
  const lines = text.split('\n');

  for (const line of lines) {
    const match = line.match(/(?:name|holder|insured|driver)\s*[:#-]?\s*([A-Za-z\s.]{3,40})/i);
    if (match && match[1]) {
      const candidate = match[1].trim();
      // Ensure candidate looks like a name and not a generic title
      if (!/republic|government|ministry|department|licen/i.test(candidate)) {
        return candidate;
      }
    }
  }

  return '';
};

/**
 * Extract issue date and expiry date from text.
 */
const detectDates = (text) => {
  const lines = text.split('\n');
  let issueDate = null;
  let expiryDate = null;

  for (const line of lines) {
    // Check for expiry date indicators
    if (/(?:expir(?:y|es|ation)|valid\s*(?:thru|to|upto|until)|due\s*date)\s*[:#-]?\s*([0-9A-Za-z\/\.\s-]{8,20})/i.test(line)) {
      const match = line.match(/(?:expir(?:y|es|ation)|valid\s*(?:thru|to|upto|until)|due\s*date)\s*[:#-]?\s*([0-9A-Za-z\/\.\s-]{8,20})/i);
      if (match && match[1]) {
        const candidate = parseExtractedDate(match[1]);
        if (candidate) expiryDate = candidate;
      }
    }

    // Check for issue date indicators
    if (/(?:issue(?:d)?|date\s*of\s*issue|doi)\s*[:#-]?\s*([0-9A-Za-z\/\.\s-]{8,20})/i.test(line)) {
      const match = line.match(/(?:issue(?:d)?|date\s*of\s*issue|doi)\s*[:#-]?\s*([0-9A-Za-z\/\.\s-]{8,20})/i);
      if (match && match[1]) {
        const candidate = parseExtractedDate(match[1]);
        if (candidate) issueDate = candidate;
      }
    }
  }

  // Fallback: If no explicit expiry found, find all dates; the future/later date is likely expiry
  if (!expiryDate || !issueDate) {
    const allDates = [];
    const patterns = getDatePatterns();
    for (const pattern of patterns) {
      let m;
      while ((m = pattern.exec(text)) !== null) {
        const parsed = parseExtractedDate(m[0]);
        if (parsed && !allDates.includes(parsed)) {
          allDates.push(parsed);
        }
      }
    }

    allDates.sort();

    if (allDates.length >= 2) {
      if (!issueDate) issueDate = allDates[0];
      if (!expiryDate) expiryDate = allDates[allDates.length - 1];
    } else if (allDates.length === 1 && !expiryDate) {
      expiryDate = allDates[0];
    }
  }

  return { issueDate, expiryDate };
};

/**
 * Process document file through OCR and extract structured candidates.
 * @param {string} filePath - Absolute path to local file
 * @returns {Promise<{ documentType: string, name: string, documentNumber: string, issueDate: string|null, expiryDate: string|null, rawText: string, confidence: number }>}
 */
const extractDocumentData = async (filePath) => {
  logger.info(`Starting OCR processing for file: ${filePath}`);

  let worker = null;
  try {
    worker = await createWorker('eng');
    const result = await worker.recognize(filePath);
    const rawText = result.data.text || '';
    const confidence = result.data.confidence || 0;

    await worker.terminate();

    const documentType = detectDocumentType(rawText);
    const documentNumber = detectDocumentNumber(rawText);
    const name = detectName(rawText);
    const { issueDate, expiryDate } = detectDates(rawText);

    logger.info(`OCR extraction completed with confidence ${confidence}%: detected ${documentType}`);

    return {
      documentType,
      documentNumber,
      name,
      issueDate,
      expiryDate,
      rawText: rawText.slice(0, 500), // Preview of recognized text
      confidence: Math.round(confidence),
    };
  } catch (error) {
    if (worker) {
      try {
        await worker.terminate();
      } catch (termErr) {
        // ignore
      }
    }
    logger.error('OCR processing error:', error);
    throw error;
  }
};

module.exports = {
  extractDocumentData,
  detectDocumentType,
  detectDocumentNumber,
  detectName,
  detectDates,
};
