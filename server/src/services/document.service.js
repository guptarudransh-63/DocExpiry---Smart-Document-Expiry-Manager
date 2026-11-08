const Document = require('../models/Document');
const Notification = require('../models/Notification');
const Reminder = require('../models/Reminder');
const storageService = require('./storage.service');
const ApiError = require('../utils/ApiError');
const { calculateExpiryStatus } = require('../utils/expiryStatus');

/**
 * Create a new document for the authenticated user.
 */
const createDocument = async (userId, data, file) => {
  let fileInfo = {
    fileUrl: '',
    filePublicId: '',
    fileType: '',
    fileSize: 0,
  };

  if (file) {
    const uploaded = await storageService.uploadFile(file);
    fileInfo = {
      fileUrl: uploaded.fileUrl,
      filePublicId: uploaded.filePublicId,
      fileType: uploaded.fileType,
      fileSize: uploaded.fileSize,
    };
  }

  const document = new Document({
    userId,
    documentType: data.documentType,
    documentName: data.documentName,
    documentNumber: data.documentNumber || '',
    issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
    expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
    notes: data.notes || '',
    ...fileInfo,
  });

  await document.save();
  return document;
};

/**
 * Get all documents for an authenticated user with searching, filtering, and pagination.
 */
const getDocuments = async (userId, query = {}) => {
  const {
    q,
    status,
    documentType,
    sortBy = 'expiryDate',
    sortOrder = 'asc',
    page = 1,
    limit = 10,
    includeArchived = 'false',
  } = query;

  const filter = { userId };

  // Status and Archive filter
  if (status && status !== 'ALL') {
    if (status === 'ARCHIVED') {
      filter.isArchived = true;
    } else {
      filter.status = status;
      filter.isArchived = false;
    }
  } else if (includeArchived !== 'true') {
    filter.isArchived = false;
  }

  // Document Type filter
  if (documentType && documentType !== 'ALL') {
    filter.documentType = documentType;
  }

  // Search filter
  if (q && q.trim()) {
    const searchRegex = new RegExp(q.trim(), 'i');
    filter.$or = [
      { documentName: searchRegex },
      { documentNumber: searchRegex },
      { notes: searchRegex },
    ];
  }

  // Sorting
  const sortOptions = {};
  const order = sortOrder === 'desc' ? -1 : 1;

  if (sortBy === 'expiryDate') {
    // Put documents without expiry dates at the end
    sortOptions.expiryDate = order;
  } else if (sortBy === 'documentName') {
    sortOptions.documentName = order;
  } else if (sortBy === 'createdAt') {
    sortOptions.createdAt = order;
  } else if (sortBy === 'updatedAt') {
    sortOptions.updatedAt = order;
  } else {
    sortOptions.createdAt = -1;
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [documents, total] = await Promise.all([
    Document.find(filter).sort(sortOptions).skip(skip).limit(limitNum),
    Document.countDocuments(filter),
  ]);

  return {
    documents,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Get a single document by ID with strict IDOR ownership check.
 */
const getDocumentById = async (userId, documentId) => {
  const document = await Document.findById(documentId);

  if (!document) {
    throw ApiError.notFound('Document not found');
  }

  // Strict ownership check (IDOR prevention)
  if (document.userId.toString() !== userId.toString()) {
    throw ApiError.forbidden('You do not have permission to access this document');
  }

  return document;
};

/**
 * Update document info and optionally replace the file.
 */
const updateDocument = async (userId, documentId, updateData, newFile) => {
  const document = await getDocumentById(userId, documentId);

  // If a new file is provided, delete the old file and upload the new one
  if (newFile) {
    if (document.filePublicId || document.fileUrl) {
      await storageService.deleteFile(document.filePublicId, document.fileUrl);
    }

    const uploaded = await storageService.uploadFile(newFile);
    document.fileUrl = uploaded.fileUrl;
    document.filePublicId = uploaded.filePublicId;
    document.fileType = uploaded.fileType;
    document.fileSize = uploaded.fileSize;
  }

  // Update provided fields
  if (updateData.documentType !== undefined) document.documentType = updateData.documentType;
  if (updateData.documentName !== undefined) document.documentName = updateData.documentName;
  if (updateData.documentNumber !== undefined) document.documentNumber = updateData.documentNumber;
  if (updateData.issueDate !== undefined) {
    document.issueDate = updateData.issueDate ? new Date(updateData.issueDate) : null;
  }
  if (updateData.expiryDate !== undefined) {
    document.expiryDate = updateData.expiryDate ? new Date(updateData.expiryDate) : null;
  }
  if (updateData.notes !== undefined) document.notes = updateData.notes;

  await document.save();
  return document;
};

/**
 * Delete a document, its stored file, and associated reminders/notifications.
 */
const deleteDocument = async (userId, documentId) => {
  const document = await getDocumentById(userId, documentId);

  // Delete attached file
  if (document.filePublicId || document.fileUrl) {
    await storageService.deleteFile(document.filePublicId, document.fileUrl);
  }

  // Delete document
  await Document.findByIdAndDelete(documentId);

  // Clean up reminders and notifications
  await Promise.all([
    Reminder.deleteMany({ documentId }),
    Notification.deleteMany({ documentId }),
  ]);

  return { message: 'Document and associated data deleted successfully' };
};

/**
 * Archive a document.
 */
const archiveDocument = async (userId, documentId) => {
  const document = await getDocumentById(userId, documentId);

  document.isArchived = true;
  document.status = 'ARCHIVED';
  await document.save();

  return document;
};

/**
 * Restore an archived document.
 */
const restoreDocument = async (userId, documentId) => {
  const document = await getDocumentById(userId, documentId);

  document.isArchived = false;
  // Saving will trigger pre-save hook to re-evaluate status based on expiryDate
  await document.save();

  return document;
};

/**
 * Dashboard stats: counts by status, upcoming expiries, and recent documents.
 */
const getDocumentStats = async (userId) => {
  // Aggregate stats
  const [total, active, expiringSoon, expired, archived] = await Promise.all([
    Document.countDocuments({ userId, isArchived: false }),
    Document.countDocuments({ userId, status: 'ACTIVE', isArchived: false }),
    Document.countDocuments({ userId, status: 'EXPIRING_SOON', isArchived: false }),
    Document.countDocuments({ userId, status: 'EXPIRED', isArchived: false }),
    Document.countDocuments({ userId, isArchived: true }),
  ]);

  // Upcoming expiries: non-archived docs with expiryDate, sorted nearest first
  const upcomingExpiries = await Document.find({
    userId,
    isArchived: false,
    expiryDate: { $ne: null },
  })
    .sort({ expiryDate: 1 })
    .limit(5);

  // Recent documents: sorted by updatedAt desc
  const recentDocuments = await Document.find({
    userId,
    isArchived: false,
  })
    .sort({ updatedAt: -1 })
    .limit(5);

  return {
    counts: {
      total,
      active,
      expiringSoon,
      expired,
      archived,
    },
    upcomingExpiries,
    recentDocuments,
  };
};

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  archiveDocument,
  restoreDocument,
  getDocumentStats,
};
