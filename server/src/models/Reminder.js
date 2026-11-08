const mongoose = require('mongoose');
const { REMINDER_TYPES } = require('../config/constants');

const reminderSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Document ID is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    reminderType: {
      type: String,
      required: [true, 'Reminder type is required'],
      enum: REMINDER_TYPES,
    },
    scheduledFor: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    sentAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SENT', 'FAILED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: Guarantees at-most-once delivery per reminder type per document!
reminderSchema.index({ documentId: 1, reminderType: 1 }, { unique: true });

module.exports = mongoose.model('Reminder', reminderSchema);
