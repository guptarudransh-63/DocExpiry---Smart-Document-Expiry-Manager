import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../services/notification.service';
import { useNotifications } from '../context/NotificationContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  FiBell,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiCheck,
  FiCalendar,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Notifications() {
  const { markAsRead, markAllAsRead } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications({
        unreadOnly: unreadOnly ? 'true' : 'false',
        limit: 50,
      });
      setNotifications(data.notifications || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [unreadOnly]);

  const handleMarkOne = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      toast.success('Marked as read');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'EXPIRED':
        return <FiXCircle className="w-5 h-5 text-red-500" />;
      case 'REMINDER_1_DAY':
        return <FiAlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'REMINDER_7_DAY':
        return <FiAlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <FiCheckCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Automated alerts, milestone reminders, and expiry notices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setUnreadOnly((prev) => !prev)}
            className={`btn-secondary text-xs py-2 px-3 ${
              unreadOnly ? 'bg-primary-50 border-primary-300 text-primary-700' : ''
            }`}
          >
            {unreadOnly ? 'Showing Unread' : 'Show Unread Only'}
          </button>

          <button
            type="button"
            onClick={handleMarkAll}
            className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <FiCheck className="w-3.5 h-3.5" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching notifications..." />
      ) : notifications.length === 0 ? (
        <div className="card text-center py-16">
          <div className="h-16 w-16 mx-auto rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-4">
            <FiBell className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No notifications</h3>
          <p className="text-sm text-gray-500 mt-1">
            {unreadOnly
              ? 'You have caught up with all your unread notifications.'
              : 'You do not have any notifications yet.'}
          </p>
        </div>
      ) : (
        <div className="card divide-y divide-gray-100 p-0 overflow-hidden">
          {notifications.map((item) => (
            <div
              key={item._id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                !item.isRead ? 'bg-primary-50/40' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className="mt-0.5">{getIconForType(item.type)}</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary-600" title="Unread" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.message}</p>
                  <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-1">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                    {item.documentId && (
                      <Link
                        to={`/documents/${item.documentId._id || item.documentId}`}
                        className="font-semibold text-primary-600 hover:text-primary-800"
                      >
                        View Document →
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {!item.isRead && (
                <button
                  type="button"
                  onClick={() => handleMarkOne(item._id)}
                  className="btn-secondary text-[11px] py-1 px-2.5 shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
