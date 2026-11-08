const { calculateExpiryStatus } = require('../src/utils/expiryStatus');
const { checkDocumentExpiries } = require('../src/jobs/expiryChecker.job');
const User = require('../src/models/User');
const Document = require('../src/models/Document');
const Notification = require('../src/models/Notification');
const Reminder = require('../src/models/Reminder');
require('./setup');

describe('Expiry Status Engine & Reminder Deduplication', () => {
  describe('calculateExpiryStatus utility', () => {
    it('should return ACTIVE for documents expiring in more than 30 days', () => {
      const future = new Date();
      future.setDate(future.getDate() + 45);

      const res = calculateExpiryStatus(future, false);
      expect(res.status).toBe('ACTIVE');
      expect(res.daysRemaining).toBeGreaterThan(30);
    });

    it('should return EXPIRING_SOON for documents expiring within 30 days', () => {
      const soon = new Date();
      soon.setDate(soon.getDate() + 15);

      const res = calculateExpiryStatus(soon, false);
      expect(res.status).toBe('EXPIRING_SOON');
      expect(res.daysRemaining).toBeLessThanOrEqual(30);
      expect(res.daysRemaining).toBeGreaterThanOrEqual(0);
    });

    it('should return EXPIRED for documents past expiry date', () => {
      const past = new Date();
      past.setDate(past.getDate() - 5);

      const res = calculateExpiryStatus(past, false);
      expect(res.status).toBe('EXPIRED');
      expect(res.daysRemaining).toBeLessThan(0);
    });

    it('should return ARCHIVED when isArchived is true regardless of date', () => {
      const future = new Date();
      future.setDate(future.getDate() + 100);

      const res = calculateExpiryStatus(future, true);
      expect(res.status).toBe('ARCHIVED');
      expect(res.daysRemaining).toBeNull();
    });
  });

  describe('Duplicate Reminder Prevention in Cron Job', () => {
    let user;
    let document;

    beforeEach(async () => {
      user = await User.create({
        name: 'Test Reminder User',
        email: 'remindertest@example.com',
        password: 'Password123!',
        notificationPrefs: {
          emailEnabled: false, // Don't trigger actual email during this unit test
          reminder7Day: true,
        },
      });

      // Create a document expiring in 5 days (qualifies for REMINDER_7_DAY)
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 5);

      document = await Document.create({
        userId: user._id,
        documentType: 'VEHICLE_INSURANCE',
        documentName: 'Car Insurance Policy',
        expiryDate: expiry,
      });
    });

    it('should send reminder once and PREVENT duplicate reminders on subsequent runs', async () => {
      // 1st run of cron job
      await checkDocumentExpiries();

      // Check notification created
      const notifs1 = await Notification.find({ userId: user._id });
      expect(notifs1.length).toBe(1);
      expect(notifs1[0].type).toBe('REMINDER_7_DAY');

      // Check reminder record created with status SENT
      const reminders1 = await Reminder.find({ documentId: document._id });
      expect(reminders1.length).toBe(1);
      expect(reminders1[0].status).toBe('SENT');

      // 2nd run of cron job (simulating regular 6-hour cron trigger)
      await checkDocumentExpiries();

      // Crucial assertion: Total notifications and reminders must STILL be 1! (NO DUPLICATE)
      const notifs2 = await Notification.find({ userId: user._id });
      expect(notifs2.length).toBe(1);

      const reminders2 = await Reminder.find({ documentId: document._id });
      expect(reminders2.length).toBe(1);
    });
  });
});
