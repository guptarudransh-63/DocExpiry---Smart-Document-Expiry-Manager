import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiShield,
  FiClock,
  FiBell,
  FiFileText,
  FiCheckCircle,
  FiArrowRight,
} from 'react-icons/fi';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/50 via-white to-gray-50 text-gray-900">
      {/* Navigation Header */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">📄</span>
          <span className="text-2xl font-black tracking-tight text-primary-700">DocExpiry</span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold uppercase tracking-wider mb-6">
          <FiShield className="w-4 h-4" /> Production-Grade Document Expiry Management
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Never let an important document <br />
          <span className="text-primary-600">expire unnoticed again</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Store Passports, Driving Licences, Vehicle Insurances, PUC, Certifications, and Warranties
          securely. Extract details instantly with OCR and receive automated alerts before deadlines.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="btn-primary text-base px-8 py-3.5 flex items-center gap-2 shadow-lg shadow-primary-500/20"
          >
            <span>{isAuthenticated ? 'Open Dashboard' : 'Create Free Account'}</span>
            <FiArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to={isAuthenticated ? '/documents/add' : '/login'}
            className="btn-secondary text-base px-8 py-3.5"
          >
            {isAuthenticated ? 'Upload Document' : 'Sign In'}
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Engineered for Reliability & Security</h2>
          <p className="text-gray-500 mt-2">Everything you need to maintain your critical personal records.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
              <FiBell className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Automated 30/7/1-Day Alerts</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Background scheduled workers continuously verify expiries and deliver in-app and email
              reminders with duplicate prevention logic.
            </p>
          </div>

          <div className="card hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
              <FiFileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered OCR Extraction</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Upload scans or photos to extract document numbers, names, issue dates, and expiry dates with
              a full preview & confirmation workflow.
            </p>
          </div>

          <div className="card hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
              <FiShield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Strict IDOR & Data Isolation</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Every document is tied to cryptographic JWT claims. Strict server-side ownership checks ensure
              zero cross-user data leakage.
            </p>
          </div>
        </div>
      </section>

      {/* Supported Document Types Showcase */}
      <section className="bg-white border-t border-b border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900">Supported Document Types</h3>
            <p className="text-gray-500 mt-1">Pre-configured templates plus support for any custom document.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {[
              'Passport',
              'Driving Licence',
              'Vehicle Insurance',
              'PUC Certificate',
              'Vehicle Registration (RC)',
              'Rental Agreement',
              'Professional Licences',
              'Product Warranties',
              'Memberships',
              'Certificates',
              'Custom Documents',
            ].map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700"
              >
                <FiCheckCircle className="text-primary-600 w-4 h-4" />
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400 gap-4">
        <div className="flex items-center gap-2 font-semibold text-gray-600">
          <span>📄</span>
          <span>DocExpiry Manager</span>
        </div>
        <p>© 2026 DocExpiry Manager. Production-Quality Full-Stack Architecture.</p>
      </footer>
    </div>
  );
}
