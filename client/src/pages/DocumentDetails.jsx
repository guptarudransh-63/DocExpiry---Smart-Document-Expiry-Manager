import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { documentService } from '../services/document.service';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmModal from '../components/common/ConfirmModal';
import {
  FiArrowLeft,
  FiEdit,
  FiArchive,
  FiRefreshCw,
  FiTrash2,
  FiDownload,
  FiExternalLink,
  FiCalendar,
  FiFileText,
  FiClock,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function DocumentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const doc = await documentService.getDocumentById(id);
        setDocument(doc);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [id]);

  const handleArchiveToggle = async () => {
    try {
      if (document.isArchived) {
        const updated = await documentService.restoreDocument(document._id);
        setDocument(updated);
        toast.success('Document restored');
      } else {
        const updated = await documentService.archiveDocument(document._id);
        setDocument(updated);
        toast.success('Document archived');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await documentService.deleteDocument(document._id);
      toast.success('Document deleted');
      navigate('/documents');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading document details..." />;
  }

  if (error || !document) {
    return (
      <div className="card text-center py-12 max-w-xl mx-auto">
        <p className="text-red-600 font-semibold mb-4">{error || 'Document not found'}</p>
        <Link to="/documents" className="btn-primary">
          Back to Documents
        </Link>
      </div>
    );
  }

  const isImage = document.fileType?.startsWith('image/');
  const isPdf = document.fileType === 'application/pdf';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/documents"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Documents</span>
        </Link>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to={`/documents/${document._id}/edit`}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <FiEdit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>

          <button
            type="button"
            onClick={handleArchiveToggle}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            {document.isArchived ? (
              <>
                <FiRefreshCw className="w-3.5 h-3.5" />
                <span>Restore</span>
              </>
            ) : (
              <>
                <FiArchive className="w-3.5 h-3.5" />
                <span>Archive</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="btn-danger text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge status={document.status} daysRemaining={document.daysRemaining} />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {document.documentType.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {document.documentName}
            </h1>
            {document.documentNumber && (
              <p className="text-sm font-mono text-gray-600 mt-1">
                Document No: <span className="font-bold text-gray-900">{document.documentNumber}</span>
              </p>
            )}
          </div>
        </div>

        {/* Date Milestones Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
          <div>
            <p className="text-xs text-gray-500 font-medium">Issue Date</p>
            <p className="text-sm font-bold text-gray-800 mt-1 flex items-center gap-1.5">
              <FiCalendar className="text-gray-400" />
              {document.issueDate ? new Date(document.issueDate).toLocaleDateString() : 'Not recorded'}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 font-medium">Expiry Date</p>
            <p className="text-sm font-bold text-primary-700 mt-1 flex items-center gap-1.5">
              <FiClock className="text-primary-500" />
              {document.expiryDate ? new Date(document.expiryDate).toLocaleDateString() : 'No expiry'}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 font-medium">Timeline Status</p>
            <p className="text-sm font-bold text-gray-800 mt-1">
              {document.daysRemaining !== null
                ? document.daysRemaining >= 0
                  ? `${document.daysRemaining} days remaining`
                  : `Expired ${Math.abs(document.daysRemaining)} days ago`
                : 'No tracking'}
            </p>
          </div>
        </div>

        {/* Notes */}
        {document.notes && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Notes & Information
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border border-gray-100">
              {document.notes}
            </p>
          </div>
        )}

        {/* Attached Document File Section */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Attached File
          </h3>

          {document.fileUrl ? (
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-white">
                <div className="flex items-center gap-2">
                  <FiFileText className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-semibold text-gray-800">
                    {document.fileType || 'Document Attachment'}
                  </span>
                  {document.fileSize > 0 && (
                    <span className="text-xs text-gray-400">
                      ({(document.fileSize / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  )}
                </div>

                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <FiExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full File</span>
                </a>
              </div>

              {/* Preview if image */}
              {isImage && (
                <div className="p-4 flex justify-center bg-gray-100 max-h-[500px] overflow-hidden">
                  <img
                    src={document.fileUrl}
                    alt={document.documentName}
                    className="max-h-[450px] object-contain rounded-lg shadow-sm"
                  />
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No file attached to this document.</p>
          )}
        </div>

        {/* Meta Info */}
        <div className="pt-4 border-t border-gray-100 flex flex-wrap justify-between text-xs text-gray-400">
          <span>Created: {new Date(document.createdAt).toLocaleString()}</span>
          <span>Last Updated: {new Date(document.updatedAt).toLocaleString()}</span>
        </div>
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Document"
        message={`Are you sure you want to permanently delete "${document.documentName}"? All file attachments and scheduled reminder records will be removed.`}
        danger
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
