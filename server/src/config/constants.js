// Document types available in the system
const DOCUMENT_TYPES = [
  'PASSPORT',
  'DRIVING_LICENCE',
  'VEHICLE_INSURANCE',
  'PUC',
  'VEHICLE_REGISTRATION',
  'CERTIFICATE',
  'RENTAL_AGREEMENT',
  'MEMBERSHIP',
  'WARRANTY',
  'PROFESSIONAL_LICENCE',
  'OTHER',
];

// Human-readable labels for document types
const DOCUMENT_TYPE_LABELS = {
  PASSPORT: 'Passport',
  DRIVING_LICENCE: 'Driving Licence',
  VEHICLE_INSURANCE: 'Vehicle Insurance',
  PUC: 'PUC (Pollution Under Control)',
  VEHICLE_REGISTRATION: 'Vehicle Registration',
  CERTIFICATE: 'Certificate',
  RENTAL_AGREEMENT: 'Rental Agreement',
  MEMBERSHIP: 'Membership',
  WARRANTY: 'Warranty',
  PROFESSIONAL_LICENCE: 'Professional Licence',
  OTHER: 'Other',
};

// Document statuses
const DOCUMENT_STATUSES = ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'ARCHIVED'];

// Reminder types
const REMINDER_TYPES = ['REMINDER_30_DAY', 'REMINDER_7_DAY', 'REMINDER_1_DAY', 'EXPIRED'];

// Reminder thresholds in days
const REMINDER_THRESHOLDS = {
  REMINDER_30_DAY: 30,
  REMINDER_7_DAY: 7,
  REMINDER_1_DAY: 1,
  EXPIRED: 0,
};

// Maps reminder types to user preference keys
const REMINDER_PREF_MAP = {
  REMINDER_30_DAY: 'reminder30Day',
  REMINDER_7_DAY: 'reminder7Day',
  REMINDER_1_DAY: 'reminder1Day',
  EXPIRED: 'expiryNotification',
};

// Expiry thresholds
const EXPIRY_THRESHOLDS = {
  EXPIRING_SOON_DAYS: 30, // Days before expiry to mark as 'EXPIRING_SOON'
};

// Allowed file types for upload
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

module.exports = Object.freeze({
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  DOCUMENT_STATUSES,
  REMINDER_TYPES,
  REMINDER_THRESHOLDS,
  REMINDER_PREF_MAP,
  EXPIRY_THRESHOLDS,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
});
