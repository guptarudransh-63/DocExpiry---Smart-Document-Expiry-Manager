import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiBell, FiShield, FiSave, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updatePreferences } = useAuth();

  const [prefs, setPrefs] = useState({
    emailEnabled: user?.notificationPrefs?.emailEnabled ?? true,
    reminder30Day: user?.notificationPrefs?.reminder30Day ?? true,
    reminder7Day: user?.notificationPrefs?.reminder7Day ?? true,
    reminder1Day: user?.notificationPrefs?.reminder1Day ?? true,
    expiryNotification: user?.notificationPrefs?.expiryNotification ?? true,
  });

  const [saving, setSaving] = useState(false);

  const handleToggle = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePreferences(prefs);
    } catch (err) {
      toast.error(err.message || 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Settings & Alerts</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account profile and configure automated notification channels.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="card space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <FiUser className="text-primary-600" />
          <span>Profile Information</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-400">Full Name</label>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">{user?.name}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400">Email Address</label>
            <p className="text-sm font-semibold text-gray-800 mt-0.5">{user?.email}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400">Account Created</label>
            <p className="text-sm text-gray-600 mt-0.5">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400">Security Level</label>
            <p className="text-sm font-semibold text-green-600 mt-0.5 flex items-center gap-1">
              <FiShield /> Protected by JWT + Bcrypt
            </p>
          </div>
        </div>
      </div>

      {/* Notification Preferences Form (Section 14 Requirement) */}
      <form onSubmit={handleSave} className="card space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FiBell className="text-primary-600" />
            <span>Reminder Preferences</span>
          </h2>
          <span className="text-xs text-gray-400">Automated Background Engine</span>
        </div>

        <div className="space-y-4">
          {/* Email Notifications Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div>
              <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <FiMail className="text-primary-500" />
                <span>Email Notifications</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Send expiry reminder emails to {user?.email}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.emailEnabled}
                onChange={() => handleToggle('emailEnabled')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* 30-Day Reminder */}
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div>
              <p className="text-sm font-semibold text-gray-800">30-Day Reminder</p>
              <p className="text-xs text-gray-500 mt-0.5">
                First early notice one month before document expiry
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.reminder30Day}
                onChange={() => handleToggle('reminder30Day')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* 7-Day Reminder */}
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div>
              <p className="text-sm font-semibold text-gray-800">7-Day Reminder</p>
              <p className="text-xs text-gray-500 mt-0.5">
                High priority alert one week before document expiry
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.reminder7Day}
                onChange={() => handleToggle('reminder7Day')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* 1-Day Reminder */}
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div>
              <p className="text-sm font-semibold text-gray-800">1-Day Urgent Reminder</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Urgent alert 24 hours before document expiration
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.reminder1Day}
                onChange={() => handleToggle('reminder1Day')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Expiry Notification */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-gray-800">Expiry Notification</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Alert triggered the moment document status transitions to Expired
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.expiryNotification}
                onChange={() => handleToggle('expiryNotification')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
