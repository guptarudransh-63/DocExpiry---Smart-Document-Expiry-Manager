const express = require('express');
const { body, param, query } = require('express-validator');
const documentController = require('../controllers/document.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const { DOCUMENT_TYPES } = require('../config/constants');

const router = express.Router();

// All document routes require authentication
router.use(protect);

// Document validation rules
const documentCreateValidation = [
  body('documentType')
    .notEmpty()
    .withMessage('Document type is required')
    .isIn(DOCUMENT_TYPES)
    .withMessage(`Invalid document type. Allowed: ${DOCUMENT_TYPES.join(', ')}`),
  body('documentName')
    .trim()
    .notEmpty()
    .withMessage('Document name is required')
    .isLength({ max: 100 })
    .withMessage('Document name cannot exceed 100 characters'),
  body('documentNumber')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Document number cannot exceed 100 characters'),
  body('issueDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Issue date must be a valid date format (YYYY-MM-DD)'),
  body('expiryDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Expiry date must be a valid date format (YYYY-MM-DD)'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

const documentUpdateValidation = [
  param('id').isMongoId().withMessage('Invalid document ID'),
  body('documentType')
    .optional()
    .isIn(DOCUMENT_TYPES)
    .withMessage(`Invalid document type. Allowed: ${DOCUMENT_TYPES.join(', ')}`),
  body('documentName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Document name cannot be empty')
    .isLength({ max: 100 }),
  body('documentNumber')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('issueDate')
    .optional({ checkFalsy: true })
    .isISO8601(),
  body('expiryDate')
    .optional({ checkFalsy: true })
    .isISO8601(),
  body('notes')
    .optional()
    .isLength({ max: 1000 }),
];

const idParamValidation = [
  param('id').isMongoId().withMessage('Invalid document ID'),
];

// Stats endpoint (placed before :id route to avoid collision)
router.get('/stats', documentController.getStats);

// OCR extraction endpoint (processes image and returns suggestions)
router.post('/ocr', upload.single('file'), documentController.processOcr);

// Document CRUD endpoints
router
  .route('/')
  .get(documentController.getDocuments)
  .post(upload.single('file'), validate(documentCreateValidation), documentController.createDocument);

router
  .route('/:id')
  .get(validate(idParamValidation), documentController.getDocumentById)
  .put(upload.single('file'), validate(documentUpdateValidation), documentController.updateDocument)
  .delete(validate(idParamValidation), documentController.deleteDocument);

// Archive and Restore endpoints
router.patch('/:id/archive', validate(idParamValidation), documentController.archiveDocument);
router.patch('/:id/restore', validate(idParamValidation), documentController.restoreDocument);

module.exports = router;
