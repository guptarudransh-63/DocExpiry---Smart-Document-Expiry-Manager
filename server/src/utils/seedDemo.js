const User = require('../models/User');
const Document = require('../models/Document');
const Notification = require('../models/Notification');
const logger = require('./logger');

const seedDemoUser = async () => {
  try {
    let user = await User.findOne({ email: 'demo@docexpiry.com' });
    if (!user) {
      user = await User.create({
        name: 'Demo User',
        email: 'demo@docexpiry.com',
        password: 'Password123!',
      });
      logger.info('Demo user created: demo@docexpiry.com / Password123!');
    }

    const docCount = await Document.countDocuments({ userId: user._id });
    if (docCount === 0) {
      const now = new Date();

      const addDays = (d, days) => {
        const copy = new Date(d);
        copy.setDate(copy.getDate() + days);
        return copy;
      };

      const dummyDocs = [
        {
          userId: user._id,
          documentType: 'PASSPORT',
          documentName: 'International Passport',
          documentNumber: 'Z1234567',
          issueDate: addDays(now, -1825), // 5 years ago
          expiryDate: addDays(now, 1825), // in 5 years
          notes: 'Standard 10-year tourist passport.',
        },
        {
          userId: user._id,
          documentType: 'DRIVING_LICENCE',
          documentName: "Driver's Licence",
          documentNumber: 'DL-98213-4412',
          issueDate: addDays(now, -730),
          expiryDate: addDays(now, 730), // in 2 years
          notes: 'Motor Vehicle Department commercial licence.',
        },
        {
          userId: user._id,
          documentType: 'WARRANTY',
          documentName: 'MacBook Pro Warranty',
          documentNumber: 'APL-WAR-8812',
          issueDate: addDays(now, -180),
          expiryDate: addDays(now, 185), // in ~6 months
          notes: 'AppleCare+ extended coverage.',
        },
        {
          userId: user._id,
          documentType: 'VEHICLE_INSURANCE',
          documentName: 'Comprehensive Car Insurance',
          documentNumber: 'POL-AUTO-2024-99',
          issueDate: addDays(now, -350),
          expiryDate: addDays(now, 15), // expiring in 15 days
          notes: 'Includes zero-depreciation and roadside assistance.',
        },
        {
          userId: user._id,
          documentType: 'PUC',
          documentName: 'Vehicle Emission Test (PUC)',
          documentNumber: 'PUC-881204',
          issueDate: addDays(now, -176),
          expiryDate: addDays(now, 4), // expiring in 4 days
          notes: 'Mandatory 6-month pollution certificate.',
        },
        {
          userId: user._id,
          documentType: 'MEMBERSHIP',
          documentName: 'Fitness Club Annual Pass',
          documentNumber: 'FIT-CLUB-1092',
          issueDate: addDays(now, -345),
          expiryDate: addDays(now, 20), // expiring in 20 days
          notes: 'Gold tier gym membership with pool access.',
        },
        {
          userId: user._id,
          documentType: 'RENTAL_AGREEMENT',
          documentName: 'Apartment Lease Agreement',
          documentNumber: 'LEASE-BLR-402',
          issueDate: addDays(now, -380),
          expiryDate: addDays(now, -15), // expired 15 days ago
          notes: 'Flat 402 residential rental agreement. Needs renewal.',
        },
        {
          userId: user._id,
          documentType: 'CERTIFICATE',
          documentName: 'AWS Solutions Architect Cert',
          documentNumber: 'AWS-CERT-009812',
          issueDate: addDays(now, -1140),
          expiryDate: addDays(now, -45), // expired 45 days ago
          notes: 'Recertification exam required.',
        },
      ];

      const createdDocs = await Document.create(dummyDocs);
      logger.info(`Seeded ${createdDocs.length} dummy documents for demo user.`);

      // Seed a few sample notifications for expiring/expired documents
      const expiringCar = createdDocs.find((d) => d.documentType === 'VEHICLE_INSURANCE');
      const expiringPuc = createdDocs.find((d) => d.documentType === 'PUC');
      const expiredLease = createdDocs.find((d) => d.documentType === 'RENTAL_AGREEMENT');

      const notifications = [];

      if (expiringCar) {
        notifications.push({
          userId: user._id,
          documentId: expiringCar._id,
          type: 'REMINDER_30_DAY',
          title: 'Document Expiring Soon',
          message: 'Your Comprehensive Car Insurance expires in 15 days.',
          isRead: false,
        });
      }

      if (expiringPuc) {
        notifications.push({
          userId: user._id,
          documentId: expiringPuc._id,
          type: 'REMINDER_7_DAY',
          title: 'Urgent: Expiry in 4 Days',
          message: 'Your Vehicle Emission Test (PUC) will expire in 4 days.',
          isRead: false,
        });
      }

      if (expiredLease) {
        notifications.push({
          userId: user._id,
          documentId: expiredLease._id,
          type: 'EXPIRED',
          title: 'Document Expired',
          message: 'Your Apartment Lease Agreement expired 15 days ago.',
          isRead: true,
        });
      }

      if (notifications.length > 0) {
        await Notification.create(notifications);
        logger.info(`Seeded ${notifications.length} sample notifications.`);
      }
    }
  } catch (err) {
    logger.warn('Could not seed demo data:', err.message);
  }
};

module.exports = seedDemoUser;
