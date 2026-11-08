import React from 'react';
import { NavLink } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import {
  FiGrid,
  FiFolder,
  FiPlusCircle,
  FiBell,
  FiSettings,
  FiX,
} from 'react-icons/fi';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
  { name: 'My Documents', path: '/documents', icon: FiFolder },
  { name: 'Add Document', path: '/documents/add', icon: FiPlusCircle },
  { name: 'Notifications', path: '/notifications', icon: FiBell, hasBadge: true },
  { name: 'Settings', path: '/settings', icon: FiSettings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { unreadCount } = useNotifications();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📄</span>
            <span className="text-xl font-bold tracking-tight text-primary-700">DocExpiry</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 px-3 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
                {item.hasBadge && unreadCount > 0 && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom banner */}
        <div className="p-4 m-3 rounded-xl bg-gradient-to-br from-primary-50 to-blue-100 border border-primary-100 text-xs text-primary-900">
          <p className="font-semibold mb-1">💡 Smart Expiry Protection</p>
          <p className="text-primary-700">
            Automated alerts scheduled at 30, 7, and 1 days before document expiry.
          </p>
        </div>
      </aside>
    </>
  );
}
