import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { documentService } from '../services/document.service';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmModal from '../components/common/ConfirmModal';
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiFileText,
  FiArchive,
  FiRefreshCw,
  FiTrash2,
  FiEye,
  FiEdit,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const DOCUMENT_TYPES = [
  'ALL',
  'PASSPORT',
  'DRIVING_LICENCE',
  'VEHICLE_INSURANCE',
  'PUC',
  'VEHICLE_REGISTRATION',
  'CERTIFICATE',
  'RENTAL_AGREEMENT',
  'MEMBERSHIP',
  'WARRANTY',
  'PROFESSIONAL_LICENCE',
  'OTHER',
];

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'ARCHIVED'];

export default function Documents() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters state from URL or defaults
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('documentType') || 'ALL');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'expiryDate');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'asc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Sync state when URL search params change
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const status = searchParams.get('status') || 'ALL';
    const docType = searchParams.get('documentType') || 'ALL';
    const sb = searchParams.get('sortBy') || 'expiryDate';
    const so = searchParams.get('sortOrder') || 'asc';
    const p = parseInt(searchParams.get('page') || '1', 10);

    setSearchInput(q);
    setSearch(q);
    setStatusFilter(status);
    setTypeFilter(docType);
    setSortBy(sb);
    setSortOrder(so);
    setPage(p);
  }, [searchParams]);

  // Modal states for delete & archive
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: null,
    documentId: null,
    documentName: '',
  });

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const query = {
        page,
        limit: 9,
        q: search,
        status: statusFilter,
        documentType: typeFilter,
        sortBy,
        sortOrder,
      };

      const res = await documentService.getDocuments(query);
      setDocuments(res.data || []);
      setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      toast.error(err.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  // Archive / Restore Handler
  const handleArchiveToggle = async (doc) => {
    try {
      if (doc.isArchived) {
        await documentService.restoreDocument(doc._id);
        toast.success(`"${doc.documentName}" restored successfully`);
      } else {
        await documentService.archiveDocument(doc._id);
        toast.success(`"${doc.documentName}" archived`);
      }
      fetchDocuments();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    try {
      await documentService.deleteDocument(confirmModal.documentId);
      toast.success('Document deleted successfully');
      setConfirmModal({ isOpen: false, action: null, documentId: null, documentName: '' });
      fetchDocuments();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">My Documents</h1>
          <p className="text-sm text-gray-500 mt-1">
            Search, filter, manage, and track all your personal documents.
          </p>
        </div>
        <Link to="/documents/add" className="btn-primary inline-flex items-center gap-2">
          <FiPlus className="w-4 h-4" />
          <span>Add New Document</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <FiSearch className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (e.target.value === '' && search !== '') {
                  setSearch('');
                  setPage(1);
                }
              }}
              placeholder="Search by name, document number, or notes..."
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary text-sm px-5">
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="input-field text-sm"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Document Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Document Type</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="input-field text-sm"
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Sort By</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
                setPage(1);
              }}
              className="input-field text-sm"
            >
              <option value="expiryDate-asc">Expiry Date (Soonest first)</option>
              <option value="expiryDate-desc">Expiry Date (Furthest first)</option>
              <option value="createdAt-desc">Recently Added</option>
              <option value="updatedAt-desc">Recently Updated</option>
              <option value="documentName-asc">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching your documents..." />
      ) : documents.length === 0 ? (
        <div className="card text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-4">
            <FiFileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No documents found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== 'ALL' || typeFilter !== 'ALL'
              ? 'Try modifying your search query or filter options.'
              : 'Start by uploading your first document to protect against unexpected expiries.'}
          </p>
          <Link to="/documents/add" className="btn-primary inline-flex items-center gap-2 mt-6">
            <FiPlus className="w-4 h-4" />
            <span>Upload Document</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="card flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Badge status={doc.status} daysRemaining={doc.daysRemaining} />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {doc.documentType.replace(/_/g, ' ')}
                  </span>
                </div>

                <Link
                  to={`/documents/${doc._id}`}
                  className="font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1"
                >
                  {doc.documentName}
                </Link>

                {doc.documentNumber && (
                  <p className="text-xs text-gray-500 font-mono mt-1">
                    No: <span className="font-semibold text-gray-700">{doc.documentNumber}</span>
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-gray-100 space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expiry Date:</span>
                    <span className="font-semibold text-gray-800">
                      {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'None'}
                    </span>
                  </div>
                  {doc.issueDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Issue Date:</span>
                      <span>{new Date(doc.issueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                <Link
                  to={`/documents/${doc._id}`}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1"
                >
                  <FiEye className="w-3.5 h-3.5" />
                  <span>View</span>
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/documents/${doc._id}/edit`}
                    className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                    title="Edit"
                  >
                    <FiEdit className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleArchiveToggle(doc)}
                    className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                    title={doc.isArchived ? 'Restore' : 'Archive'}
                  >
                    {doc.isArchived ? (
                      <FiRefreshCw className="w-4 h-4" />
                    ) : (
                      <FiArchive className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        action: 'delete',
                        documentId: doc._id,
                        documentName: doc.documentName,
                      })
                    }
                    className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                    title="Delete"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500">
            Showing page <span className="font-bold">{pagination.page}</span> of{' '}
            <span className="font-bold">{pagination.totalPages}</span> ({pagination.total} documents)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
            >
              <FiChevronLeft /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-40"
            >
              Next <FiChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Document"
        message={`Are you sure you want to permanently delete "${confirmModal.documentName}" and its uploaded file? This action cannot be undone.`}
        danger
        confirmText="Delete Permanently"
        onConfirm={handleDeleteConfirm}
        onCancel={() =>
          setConfirmModal({ isOpen: false, action: null, documentId: null, documentName: '' })
        }
      />
    </div>
  );
}
