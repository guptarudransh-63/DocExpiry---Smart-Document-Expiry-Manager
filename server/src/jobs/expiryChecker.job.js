const Document = require('../models/Document');
const User = require('../models/User');
const Reminder = require('../models/Reminder');
const notificationService = require('../services/notification.service');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');
const { calculateExpiryStatus } = require('../utils/expiryStatus');
const { REMINDER_PREF_MAP } = require('../config/constants');

/**
 * Evaluates which reminder type is applicable based on days remaining.
 * @param {number} daysRemaining
 * @returns {string|null} Reminder type or null
 */
const getApplicableReminderType = (daysRemaining) => {
  if (daysRemaining < 0) {
    return 'EXPIRED';
  } else if (daysRemaining <= 1) {
    return 'REMINDER_1_DAY';
  } else if (daysRemaining <= 7) {
    return 'REMINDER_7_DAY';
  } else if (daysRemaining <= 30) {
    return 'REMINDER_30_DAY';
  }
  return null;
};

/**
 * Checks all active documents approaching expiry and triggers notifications without duplicates.
 */
const checkDocumentExpiries = async () => {
  logger.info('--- Starting scheduled document expiry check ---');

  try {
    // Find all non-archived documents that have an expiryDate
    const documents = await Document.find({
      isArchived: false,
      expiryDate: { $ne: null },
    }).populate('userId', 'name email notificationPrefs');

    let processedCount = 0;
    let remindersSentCount = 0;

    for (const doc of documents) {
      if (!doc.userId) continue;

      const user = doc.userId;
      const { status: currentStatus, daysRemaining } = calculateExpiryStatus(doc.expiryDate, doc.isArchived);

      // Keep document status in DB updated if it changed
      if (doc.status !== currentStatus) {
        doc.status = currentStatus;
        await doc.save();
      }

      const reminderType = getApplicableReminderType(daysRemaining);
      if (!reminderType) {
        // Document has more than 30 days remaining
        continue;
      }

      processedCount++;

      // Check user preferences for this reminder type
      const prefKey = REMINDER_PREF_MAP[reminderType];
      if (user.notificationPrefs && user.notificationPrefs[prefKey] === false) {
        logger.debug(`User ${user.email} disabled ${reminderType}, skipping.`);
        continue;
      }

      // Check if this reminder was ALREADY sent or recorded
      // Compound unique index ({ documentId: 1, reminderType: 1 }) guarantees deduplication
      const existingReminder = await Reminder.findOne({
        documentId: doc._id,
        reminderType,
      });

      if (existingReminder && existingReminder.status === 'SENT') {
        // Already successfully sent, skip!
        continue;
      }

      logger.info(`Sending ${reminderType} for "${doc.documentName}" to user ${user.email}`);

      // Prepare in-app notification message
      let title = '';
      let message = '';

      if (reminderType === 'EXPIRED') {
        title = `Document Expired: ${doc.documentName}`;
        message = `Your document "${doc.documentName}" expired on ${new Date(doc.expiryDate).toLocaleDateString()}. Please take renewal action.`;
      } else if (reminderType === 'REMINDER_1_DAY') {
        const timeText = daysRemaining === 0 ? 'today' : 'tomorrow';
        title = `URGENT Expiry Alert: ${doc.documentName}`;
        message = `Your document "${doc.documentName}" expires ${timeText} (${new Date(doc.expiryDate).toLocaleDateString()}). Please take immediate renewal action.`;
      } else if (reminderType === 'REMINDER_7_DAY') {
        title = `Expiry Reminder (7 Days): ${doc.documentName}`;
        message = `Your document "${doc.documentName}" expires in ${daysRemaining} days (${new Date(doc.expiryDate).toLocaleDateString()}).`;
      } else {
        title = `Expiry Reminder (30 Days): ${doc.documentName}`;
        message = `Your document "${doc.documentName}" will expire in ${daysRemaining} days on ${new Date(doc.expiryDate).toLocaleDateString()}.`;
      }

      // 1. Create in-app notification
      await notificationService.createNotification({
        userId: user._id,
        documentId: doc._id,
        type: reminderType,
        title,
        message,
      });

      // 2. Send email if email notifications are enabled
      if (user.notificationPrefs && user.notificationPrefs.emailEnabled !== false) {
        await emailService.sendReminderEmail({
          to: user.email,
          userName: user.name,
          documentName: doc.documentName,
          documentType: doc.documentType,
          expiryDate: doc.expiryDate,
          daysRemaining,
          reminderType,
        });
      }

      // 3. Record reminder in database to prevent duplicates
      await Reminder.findOneAndUpdate(
        { documentId: doc._id, reminderType },
        {
          userId: user._id,
          scheduledFor: new Date(),
          sentAt: new Date(),
          status: 'SENT',
        },
        { upsert: true, new: true }
      );

      remindersSentCount++;
    }

    logger.info(
      `--- Expiry check complete: Checked ${documents.length} docs, evaluated ${processedCount}, sent ${remindersSentCount} reminders ---`
    );
  } catch (error) {
    logger.error('Error during scheduled expiry check:', error);
  }
};

module.exports = {
  checkDocumentExpiries,
  getApplicableReminderType,
};
