import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { documentService } from '../services/document.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiArrowLeft, FiSave, FiUploadCloud, FiFileText, FiX } from 'react-icons/fi';
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

export default function EditDocument() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [existingFile, setExistingFile] = useState(null);
  const [newFile, setNewFile] = useState(null);

  const [formData, setFormData] = useState({
    documentType: 'PASSPORT',
    documentName: '',
    documentNumber: '',
    issueDate: '',
    expiryDate: '',
    notes: '',
  });

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const doc = await documentService.getDocumentById(id);
        setFormData({
          documentType: doc.documentType,
          documentName: doc.documentName,
          documentNumber: doc.documentNumber || '',
          issueDate: doc.issueDate ? doc.issueDate.split('T')[0] : '',
          expiryDate: doc.expiryDate ? doc.expiryDate.split('T')[0] : '',
          notes: doc.notes || '',
        });
        if (doc.fileUrl) {
          setExistingFile({
            url: doc.fileUrl,
            type: doc.fileType,
            size: doc.fileSize,
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.documentName.trim()) {
      toast.error('Document name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const submitData = new FormData();
      submitData.append('documentType', formData.documentType);
      submitData.append('documentName', formData.documentName);
      submitData.append('documentNumber', formData.documentNumber || '');
      submitData.append('issueDate', formData.issueDate || '');
      submitData.append('expiryDate', formData.expiryDate || '');
      submitData.append('notes', formData.notes || '');
      if (newFile) submitData.append('file', newFile);

      await documentService.updateDocument(id, submitData);
      toast.success('Document updated successfully');
      navigate(`/documents/${id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update document');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading document..." />;
  }

  if (error) {
    return (
      <div className="card text-center py-12 max-w-xl mx-auto">
        <p className="text-red-600 font-semibold mb-4">{error}</p>
        <Link to="/documents" className="btn-primary">
          Back to Documents
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to={`/documents/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900"
      >
        <FiArrowLeft className="w-4 h-4" />
        <span>Cancel & Back</span>
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Edit Document</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update document information, renewal dates, or replace the uploaded file.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
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
              Updating this recalculates status and schedules reminder alerts.
            </p>
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Optional File Replacement */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-gray-700">
              Attached Document File
            </label>

            {existingFile && !newFile && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                <div className="flex items-center gap-2 text-gray-700">
                  <FiFileText className="w-4 h-4 text-primary-600" />
                  <span>Current document file attached</span>
                  {existingFile.size > 0 && (
                    <span className="text-gray-400">
                      ({(existingFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  )}
                </div>
                <a
                  href={existingFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-800 font-semibold underline"
                >
                  View Current
                </a>
              </div>
            )}

            <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-primary-400">
              <input
                type="file"
                id="edit-file-upload"
                onChange={(e) => setNewFile(e.target.files[0] || null)}
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                className="hidden"
              />
              <label htmlFor="edit-file-upload" className="cursor-pointer">
                <FiUploadCloud className="w-6 h-6 text-primary-500 mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-700">
                  {newFile ? newFile.name : existingFile ? 'Click to upload a replacement file' : 'Click to upload a file'}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">JPEG, PNG, WEBP, or PDF (Max 10MB)</p>
              </label>
            </div>

            {newFile && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800">
                <span>New replacement: <strong>{newFile.name}</strong></span>
                <button
                  type="button"
                  onClick={() => setNewFile(null)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remove replacement file"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Link to={`/documents/${id}`} className="btn-secondary text-sm">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
