const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('../utils/logger');
const { DOCUMENT_TYPE_LABELS } = require('../config/constants');

let transporter = null;

/**
 * Initialize nodemailer transporter.
 */
const initTransporter = async () => {
  if (transporter) return transporter;

  try {
    // If user provided email password, use configured SMTP
    if (config.email.password) {
      transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465,
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });
      logger.info(`Email Service: Configured SMTP (${config.email.host})`);
    } else {
      // Development mode fallback: Create test account with Ethereal
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      logger.info(`Email Service: Created Ethereal test email account: ${testAccount.user}`);
    }
  } catch (error) {
    logger.error('Email Service initialization error:', error.message);
  }

  return transporter;
};

/**
 * Send an expiry reminder email to the document owner.
 */
const sendReminderEmail = async ({
  to,
  userName,
  documentName,
  documentType,
  expiryDate,
  daysRemaining,
  reminderType,
}) => {
  try {
    const activeTransporter = await initTransporter();
    if (!activeTransporter) {
      logger.warn('Email Service: Transporter not available, skipping email send.');
      return false;
    }

    const typeLabel = DOCUMENT_TYPE_LABELS[documentType] || documentType;
    const formattedExpiry = expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A';

    let subject = '';
    let headline = '';
    let badgeColor = '#2563eb';

    if (reminderType === 'EXPIRED') {
      subject = `[Action Required] Your document "${documentName}" has EXPIRED`;
      headline = 'Your document has expired!';
      badgeColor = '#dc2626';
    } else if (reminderType === 'REMINDER_1_DAY') {
      subject = `[URGENT] Your document "${documentName}" expires tomorrow!`;
      headline = 'Urgent: Document expires tomorrow!';
      badgeColor = '#ea580c';
    } else if (reminderType === 'REMINDER_7_DAY') {
      subject = `Reminder: Your document "${documentName}" expires in 7 days`;
      headline = 'Document expiring in 7 days';
      badgeColor = '#d97706';
    } else {
      subject = `Notice: Your document "${documentName}" expires in 30 days`;
      headline = 'Document expiring in 30 days';
      badgeColor = '#3b82f6';
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; rounded: 8px;">
        <div style="background-color: ${badgeColor}; color: white; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px;">${headline}</h2>
        </div>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>This is an automated reminder regarding your stored document in <strong>DocExpiry Manager</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 0; color: #4b5563; border-bottom: 1px solid #f3f4f6;">Document Name:</td>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f3f4f6;">${documentName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4b5563; border-bottom: 1px solid #f3f4f6;">Type:</td>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f3f4f6;">${typeLabel}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4b5563; border-bottom: 1px solid #f3f4f6;">Expiry Date:</td>
            <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f3f4f6;">${formattedExpiry}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #4b5563;">Days Remaining:</td>
            <td style="padding: 8px 0; font-weight: bold; color: ${badgeColor};">${daysRemaining !== null ? daysRemaining : 'Expired'}</td>
          </tr>
        </table>

        <p>Please take necessary actions to renew or update your document.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">DocExpiry Manager — Automated Document Expiry Reminders</p>
      </div>
    `;

    const info = await activeTransporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
    });

    logger.info(`Reminder email sent to ${to}: ${info.messageId}`);

    // If using Ethereal, log preview URL so it can be verified during testing
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      logger.info(`Ethereal Email Preview: ${previewUrl}`);
    }

    return true;
  } catch (error) {
    logger.error(`Failed to send reminder email to ${to}:`, error.message);
    return false;
  }
};

module.exports = {
  sendReminderEmail,
};
