const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const config = require('../config/env');
const logger = require('../utils/logger');

// Configure Cloudinary if credentials are present
const isCloudinaryConfigured =
  config.storageMode === 'cloudinary' &&
  Boolean(config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
  logger.info('Storage Service: Cloudinary configured');
} else {
  logger.info('Storage Service: Using local disk storage mode');
}

/**
 * Upload a file to configured storage provider (Cloudinary or Local).
 * @param {Express.Multer.File} file
 * @returns {Promise<{ fileUrl: string, filePublicId: string, fileType: string, fileSize: number, localPath: string }>}
 */
const uploadFile = async (file) => {
  if (!file) return null;

  const localPath = file.path;
  const fileType = file.mimetype;
  const fileSize = file.size;

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'doc-expiry-manager',
        resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
      });

      // After uploading to Cloudinary, clean up the local disk copy
      fs.unlink(file.path, (err) => {
        if (err) logger.warn(`Failed to clean up local temp file: ${file.path}`);
      });

      return {
        fileUrl: result.secure_url,
        filePublicId: result.public_id,
        fileType,
        fileSize,
        localPath: null,
      };
    } catch (error) {
      logger.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  // Local storage mode: file already stored in server/uploads/ by multer
  // Construct accessible URL path
  const fileUrl = `/uploads/${file.filename}`;
  const filePublicId = file.filename;

  return {
    fileUrl,
    filePublicId,
    fileType,
    fileSize,
    localPath,
  };
};

/**
 * Delete a file from configured storage provider.
 * @param {string} filePublicId
 * @param {string} fileUrl
 */
const deleteFile = async (filePublicId, fileUrl) => {
  if (!filePublicId && !fileUrl) return;

  if (isCloudinaryConfigured && filePublicId) {
    try {
      await cloudinary.uploader.destroy(filePublicId);
      logger.info(`Deleted file from Cloudinary: ${filePublicId}`);
    } catch (error) {
      logger.warn(`Failed to delete Cloudinary file: ${filePublicId}`, error);
    }
    return;
  }

  // Local file deletion
  try {
    const filename = filePublicId || path.basename(fileUrl);
    const filePath = path.join(__dirname, '../../uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Deleted local file: ${filePath}`);
    }
  } catch (error) {
    logger.warn(`Failed to delete local file: ${filePublicId || fileUrl}`, error);
  }
};

module.exports = {
  uploadFile,
  deleteFile,
};
