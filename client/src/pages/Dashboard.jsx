import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { documentService } from '../services/document.service';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  FiFileText,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiPlus,
  FiArrowRight,
  FiCalendar,
} from 'react-icons/fi';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const data = await documentService.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <div className="card text-center p-8">
        <p className="text-red-600 mb-4 font-semibold">{error}</p>
        <button onClick={fetchStats} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  const { counts = {}, upcomingExpiries = [], recentDocuments = [] } = stats || {};

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of your document status and upcoming expiry milestones.
          </p>
        </div>
        <Link
          to="/documents/add"
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" />
          <span>Upload Document</span>
        </Link>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Documents */}
        <div className="card border-l-4 border-l-primary-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Total Documents
              </p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{counts.total || 0}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <FiFileText className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">{counts.archived || 0} archived</p>
        </div>

        {/* Active Documents */}
        <div className="card border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active</p>
              <h3 className="text-3xl font-bold text-green-700 mt-1">{counts.active || 0}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Valid &gt; 30 days</p>
        </div>

        {/* Expiring Soon */}
        <div className="card border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Expiring Soon
              </p>
              <h3 className="text-3xl font-bold text-amber-600 mt-1">{counts.expiringSoon || 0}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Requires attention</p>
        </div>

        {/* Expired */}
        <div className="card border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Expired</p>
              <h3 className="text-3xl font-bold text-red-600 mt-1">{counts.expired || 0}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <FiXCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Renewal overdue</p>
        </div>
      </div>

      {/* Grid: Upcoming Expiries & Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Expiries */}
        <div className="card">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Upcoming Expiries</h2>
              <p className="text-xs text-gray-500">Sorted by nearest expiration date</p>
            </div>
            <Link
              to="/documents?sortBy=expiryDate&sortOrder=asc"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <span>View All</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-gray-100">
            {upcomingExpiries.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">
                No upcoming document expiries found.
              </p>
            ) : (
              upcomingExpiries.map((doc) => (
                <div key={doc._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/documents/${doc._id}`}
                      className="font-semibold text-sm text-gray-900 hover:text-primary-600 truncate block"
                    >
                      {doc.documentName}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <FiCalendar className="w-3.5 h-3.5" />
                      <span>{doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A'}</span>
                      <span className="text-gray-300">•</span>
                      <span>{doc.documentType.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <Badge status={doc.status} daysRemaining={doc.daysRemaining} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recently Added / Updated Documents */}
        <div className="card">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recent Documents</h2>
              <p className="text-xs text-gray-500">Recently created or modified items</p>
            </div>
            <Link
              to="/documents"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <span>View All</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-gray-100">
            {recentDocuments.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">
                No documents uploaded yet.{' '}
                <Link to="/documents/add" className="text-primary-600 font-medium">
                  Add your first document!
                </Link>
              </p>
            ) : (
              recentDocuments.map((doc) => (
                <div key={doc._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/documents/${doc._id}`}
                      className="font-semibold text-sm text-gray-900 hover:text-primary-600 truncate block"
                    >
                      {doc.documentName}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {doc.documentNumber ? `No: ${doc.documentNumber} • ` : ''}
                      Updated {new Date(doc.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge status={doc.status} daysRemaining={doc.daysRemaining} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
