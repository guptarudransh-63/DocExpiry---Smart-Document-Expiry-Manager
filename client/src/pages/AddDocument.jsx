import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { documentService } from '../services/document.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  FiUploadCloud,
  FiFileText,
  FiCheck,
  FiEdit2,
  FiX,
  FiArrowLeft,
  FiSave,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const DOCUMENT_TYPES = [
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVING_LICENCE', label: 'Driving Licence' },
  { value: 'VEHICLE_INSURANCE', label: 'Vehicle Insurance' },
  { value: 'PUC', label: 'PUC (Pollution Under Control)' },
  { value: 'VEHICLE_REGISTRATION', label: 'Vehicle Registration (RC)' },
  { value: 'CERTIFICATE', label: 'Certificate' },
  { value: 'RENTAL_AGREEMENT', label: 'Rental Agreement' },
  { value: 'MEMBERSHIP', label: 'Membership' },
  { value: 'WARRANTY', label: 'Warranty' },
  { value: 'PROFESSIONAL_LICENCE', label: 'Professional Licence' },
  { value: 'OTHER', label: 'Other (Custom Document)' },
];

export default function AddDocument() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [showOcrConfirmation, setShowOcrConfirmation] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    documentType: 'PASSPORT',
    documentName: '',
    documentNumber: '',
    issueDate: '',
    expiryDate: '',
    notes: '',
  });

  const [saving, setSaving] = useState(false);

  // Handle File Selection
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(selected.type)) {
      toast.error('Invalid file type. Allowed formats: JPG, PNG, WEBP, PDF');
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      toast.error('File size cannot exceed 10MB');
      return;
    }

    setFile(selected);

    // Create local preview if image
    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result);
      reader.readAsDataURL(selected);
    } else {
      setFilePreview(null);
    }
  };

  // Run OCR on the selected file
  const handleRunOcr = async () => {
    if (!file) {
      toast.error('Please select an image or document first');
      return;
    }

    setIsOcrProcessing(true);
    try {
      const res = await documentService.processOcr(file);
      setOcrResult(res.extracted);
      setShowOcrConfirmation(true);
      toast.success('OCR extraction complete! Please review the extracted data.');
    } catch (err) {
      toast.error(err.message || 'OCR extraction failed. You can still fill in details manually.');
    } finally {
      setIsOcrProcessing(false);
    }
  };

  // Confirm OCR suggestions: populate form
  const handleConfirmOcr = () => {
    if (!ocrResult) return;

    const typeObj = DOCUMENT_TYPES.find((t) => t.value === ocrResult.documentType);
    const typeLabel = typeObj ? typeObj.label : ocrResult.documentType;

    setFormData((prev) => ({
      ...prev,
      documentType: ocrResult.documentType || prev.documentType,
      documentName: ocrResult.name
        ? `${ocrResult.name}'s ${typeLabel}`
        : prev.documentName || typeLabel,
      documentNumber: ocrResult.documentNumber || prev.documentNumber,
      issueDate: ocrResult.issueDate || prev.issueDate,
      expiryDate: ocrResult.expiryDate || prev.expiryDate,
    }));

    setShowOcrConfirmation(false);
    toast.success('Extracted details applied to form fields! You can make further edits.');
  };

  // Dismiss OCR suggestions without changing form
  const handleDismissOcr = () => {
    setShowOcrConfirmation(false);
  };

  // Submit Final Document
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.documentName.trim()) {
      toast.error('Please enter a document name');
      return;
    }

    setSaving(true);
    try {
      const submitData = new FormData();
      submitData.append('documentType', formData.documentType);
      submitData.append('documentName', formData.documentName);
      if (formData.documentNumber) submitData.append('documentNumber', formData.documentNumber);
      if (formData.issueDate) submitData.append('issueDate', formData.issueDate);
      if (formData.expiryDate) submitData.append('expiryDate', formData.expiryDate);
      if (formData.notes) submitData.append('notes', formData.notes);
      if (file) submitData.append('file', file);

      await documentService.createDocument(submitData);
      toast.success('Document created and expiry tracking started!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to create document');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/documents"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900"
      >
        <FiArrowLeft className="w-4 h-4" />
        <span>Back to Documents</span>
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Add New Document</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload your document file, extract information with OCR, or enter details manually.
        </p>
      </div>

      {/* Step 1: File Upload & Optional OCR */}
      <div className="card space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span>1. Document File Upload</span>
          <span className="text-xs font-normal text-gray-400">(Optional for manual entries)</span>
        </h2>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            className="hidden"
          />
          <label htmlFor="file-upload" className="cursor-pointer block">
            <FiUploadCloud className="w-10 h-10 text-primary-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">
              {file ? file.name : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supports JPEG, PNG, WEBP, or PDF (Max 10MB)
            </p>
          </label>
        </div>

        {file && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <FiFileText className="w-4 h-4 text-primary-600" />
              <span className="font-semibold">{file.name}</span>
              <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>

            {/* OCR trigger button */}
            <button
              type="button"
              onClick={handleRunOcr}
              disabled={isOcrProcessing}
              className="btn-secondary text-xs py-2 px-4 flex items-center gap-2"
            >
              {isOcrProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  <span>Scanning text with OCR...</span>
                </>
              ) : (
                <>
                  <span>🔍 Auto-Extract with OCR</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* OCR Result Confirmation Banner (Section 9 Requirement) */}
      {showOcrConfirmation && ocrResult && (
        <div className="card bg-blue-50/70 border-2 border-blue-200 p-5 space-y-4 animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
                <span>🤖 We found the following information in your document:</span>
              </h3>
              <p className="text-xs text-blue-700 mt-0.5">
                Review the extracted information below before confirming.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDismissOcr}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white rounded-lg p-3 text-xs space-y-2 border border-blue-100">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-400">Document Type:</span>{' '}
                <span className="font-semibold text-gray-800">{ocrResult.documentType}</span>
              </div>
              <div>
                <span className="text-gray-400">Name:</span>{' '}
                <span className="font-semibold text-gray-800">{ocrResult.name || 'Not detected'}</span>
              </div>
              <div>
                <span className="text-gray-400">Document Number:</span>{' '}
                <span className="font-semibold text-gray-800">{ocrResult.documentNumber || 'Not detected'}</span>
              </div>
              <div>
                <span className="text-gray-400">Issue Date:</span>{' '}
                <span className="font-semibold text-gray-800">{ocrResult.issueDate || 'Not detected'}</span>
              </div>
              <div>
                <span className="text-gray-400">Expiry Date:</span>{' '}
                <span className="font-semibold text-blue-700 font-mono font-bold">
                  {ocrResult.expiryDate || 'Not detected'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Confidence:</span>{' '}
                <span className="font-semibold text-gray-800">{ocrResult.confidence}%</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleDismissOcr}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <FiEdit2 className="w-3.5 h-3.5" />
              <span>Dismiss & Edit Manually</span>
            </button>
            <button
              type="button"
              onClick={handleConfirmOcr}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <FiCheck className="w-3.5 h-3.5" />
              <span>Apply Extracted Details</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Document Form */}
      <form onSubmit={handleSubmit} className="card space-y-5">
        <h2 className="text-base font-bold text-gray-900">2. Document Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Document Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Document Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.documentType}
              onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
              className="input-field text-sm"
              required
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Document Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Document Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.documentName}
              onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
              placeholder="e.g. My Indian Passport"
              className="input-field"
            />
          </div>

          {/* Document Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Document Number
            </label>
            <input
              type="text"
              value={formData.documentNumber}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
              placeholder="e.g. Z1234567"
              className="input-field"
            />
          </div>

          {/* Issue Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Issue Date
            </label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Expiry Date */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Expiry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="input-field"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Reminders will automatically be scheduled 30 days, 7 days, and 1 day before this date.
            </p>
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes (e.g., renewed at RPO Delhi, policy coverage details)..."
              className="input-field"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Link to="/documents" className="btn-secondary text-sm">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Saving Document...' : 'Save Document'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
