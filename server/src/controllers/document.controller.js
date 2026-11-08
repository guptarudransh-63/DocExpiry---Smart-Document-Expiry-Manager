const documentService = require('../services/document.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Create a new document
 * POST /api/documents
 */
const createDocument = async (req, res, next) => {
  try {
    const document = await documentService.createDocument(req.user._id, req.body, req.file);
    return ApiResponse.success(res, 201, 'Document created successfully', { document });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all documents for user
 * GET /api/documents
 */
const getDocuments = async (req, res, next) => {
  try {
    const { documents, pagination } = await documentService.getDocuments(req.user._id, req.query);
    return ApiResponse.paginated(res, 'Documents retrieved successfully', documents, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single document by ID
 * GET /api/documents/:id
 */
const getDocumentById = async (req, res, next) => {
  try {
    const document = await documentService.getDocumentById(req.user._id, req.params.id);
    return ApiResponse.success(res, 200, 'Document retrieved successfully', { document });
  } catch (error) {
    next(error);
  }
};

/**
 * Update document by ID
 * PUT /api/documents/:id
 */
const updateDocument = async (req, res, next) => {
  try {
    const document = await documentService.updateDocument(
      req.user._id,
      req.params.id,
      req.body,
      req.file
    );
    return ApiResponse.success(res, 200, 'Document updated successfully', { document });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete document by ID
 * DELETE /api/documents/:id
 */
const deleteDocument = async (req, res, next) => {
  try {
    const result = await documentService.deleteDocument(req.user._id, req.params.id);
    return ApiResponse.success(res, 200, result.message);
  } catch (error) {
    next(error);
  }
};

/**
 * Archive document
 * PATCH /api/documents/:id/archive
 */
const archiveDocument = async (req, res, next) => {
  try {
    const document = await documentService.archiveDocument(req.user._id, req.params.id);
    return ApiResponse.success(res, 200, 'Document archived successfully', { document });
  } catch (error) {
    next(error);
  }
};

/**
 * Restore archived document
 * PATCH /api/documents/:id/restore
 */
const restoreDocument = async (req, res, next) => {
  try {
    const document = await documentService.restoreDocument(req.user._id, req.params.id);
    return ApiResponse.success(res, 200, 'Document restored successfully', { document });
  } catch (error) {
    next(error);
  }
};

/**
 * Get document dashboard statistics
 * GET /api/documents/stats
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await documentService.getDocumentStats(req.user._id);
    return ApiResponse.success(res, 200, 'Dashboard statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

const ocrService = require('../services/ocr.service');
const ApiError = require('../utils/ApiError');

/**
 * Process document file through OCR to extract details
 * POST /api/documents/ocr
 */
const processOcr = async (req, res, next) => {
  try {
    if (!req.file) {
      throw ApiError.badRequest('Please upload an image file to perform OCR');
    }

    const extractedData = await ocrService.extractDocumentData(req.file.path);

    return ApiResponse.success(res, 200, 'OCR extraction successful', {
      extracted: extractedData,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  archiveDocument,
  restoreDocument,
  getStats,
  processOcr,
};
