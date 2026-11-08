const notificationService = require('../services/notification.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Get user notifications
 * GET /api/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const { notifications, unreadCount, pagination } = await notificationService.getNotifications(
      req.user._id,
      req.query
    );
    return ApiResponse.success(res, 200, 'Notifications retrieved successfully', {
      notifications,
      unreadCount,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark single notification as read
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.user._id, req.params.id);
    return ApiResponse.success(res, 200, 'Notification marked as read', { notification });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user._id);
    return ApiResponse.success(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Get count of unread notifications
 * GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const result = await notificationService.getUnreadCount(req.user._id);
    return ApiResponse.success(res, 200, 'Unread count retrieved', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
