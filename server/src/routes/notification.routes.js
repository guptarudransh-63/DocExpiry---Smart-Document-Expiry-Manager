const express = require('express');
const { param } = require('express-validator');
const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

router.use(protect);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);

router.patch(
  '/:id/read',
  validate([param('id').isMongoId().withMessage('Invalid notification ID')]),
  notificationController.markAsRead
);

module.exports = router;
