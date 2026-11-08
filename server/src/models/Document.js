const mongoose = require('mongoose');
const { DOCUMENT_TYPES, DOCUMENT_STATUSES } = require('../config/constants');
const { calculateExpiryStatus } = require('../utils/expiryStatus');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      enum: {
        values: DOCUMENT_TYPES,
        message: '{VALUE} is not a valid document type',
      },
    },
    documentName: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
      maxlength: [100, 'Document name cannot exceed 100 characters'],
    },
    documentNumber: {
      type: String,
      trim: true,
      maxlength: [100, 'Document number cannot exceed 100 characters'],
      default: '',
    },
    issueDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    fileUrl: {
      type: String,
      default: '',
    },
    filePublicId: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: DOCUMENT_STATUSES,
      default: 'ACTIVE',
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for dynamic days remaining
documentSchema.virtual('daysRemaining').get(function () {
  const result = calculateExpiryStatus(this.expiryDate, this.isArchived);
  return result.daysRemaining;
});

// Indexes for query performance
// 1. Dashboard queries filter by user and status
documentSchema.index({ userId: 1, status: 1 });
// 2. Sorted expiry listing per user
documentSchema.index({ userId: 1, expiryDate: 1 });
// 3. Background cron job scans approaching expiries across all active docs
documentSchema.index({ expiryDate: 1, status: 1 });
// 4. Filtering by document type per user
documentSchema.index({ userId: 1, documentType: 1 });
// 5. Text search indexing on documentName, documentNumber
documentSchema.index({ documentName: 'text', documentNumber: 'text' });

// Pre-save hook: Enforce server-calculated status based on expiryDate and isArchived
documentSchema.pre('save', function (next) {
  const computed = calculateExpiryStatus(this.expiryDate, this.isArchived);
  this.status = computed.status;
  next();
});

module.exports = mongoose.model('Document', documentSchema);
