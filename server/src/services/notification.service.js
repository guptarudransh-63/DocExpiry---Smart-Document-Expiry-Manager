const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

/**
 * Create a new notification for a user.
 */
const createNotification = async ({ userId, documentId, type, title, message }) => {
  return Notification.create({
    userId,
    documentId,
    type,
    title,
    message,
  });
};

/**
 * Get all notifications for authenticated user with pagination and unread counts.
 */
const getNotifications = async (userId, query = {}) => {
  const { page = 1, limit = 20, unreadOnly = 'false' } = query;

  const filter = { userId };
  if (unreadOnly === 'true') {
    filter.isRead = false;
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate('documentId', 'documentName documentType expiryDate status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId, isRead: false }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

/**
 * Mark a single notification as read (with user ownership check).
 */
const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  if (notification.userId.toString() !== userId.toString()) {
    throw ApiError.forbidden('You do not have permission to modify this notification');
  }

  notification.isRead = true;
  await notification.save();

  return notification;
};

/**
 * Mark all notifications for a user as read.
 */
const markAllAsRead = async (userId) => {
  await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
  return { message: 'All notifications marked as read' };
};

/**
 * Get count of unread notifications.
 */
const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({ userId, isRead: false });
  return { unreadCount: count };
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
