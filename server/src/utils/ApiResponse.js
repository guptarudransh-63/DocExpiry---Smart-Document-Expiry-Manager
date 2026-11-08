/**
 * Standardized API response wrapper.
 * All API responses follow the same structure for consistency.
 */
class ApiResponse {
  /**
   * Send a success response.
   * @param {import('express').Response} res - Express response object
   * @param {number} statusCode - HTTP status code (200, 201, etc.)
   * @param {string} message - Human-readable message
   * @param {*} data - Response payload
   */
  static success(res, statusCode = 200, message = 'Success', data = null) {
    const response = {
      success: true,
      message,
    };
    if (data !== null && data !== undefined) {
      response.data = data;
    }
    return res.status(statusCode).json(response);
  }

  /**
   * Send an error response.
   * @param {import('express').Response} res - Express response object
   * @param {number} statusCode - HTTP status code (400, 401, 404, 500, etc.)
   * @param {string} message - Human-readable error message
   * @param {Array} errors - Optional array of field-level errors
   */
  static error(res, statusCode = 500, message = 'Something went wrong', errors = []) {
    const response = {
      success: false,
      message,
    };
    if (errors.length > 0) {
      response.errors = errors;
    }
    return res.status(statusCode).json(response);
  }

  /**
   * Send a paginated success response.
   * @param {import('express').Response} res - Express response object
   * @param {string} message - Human-readable message
   * @param {*} data - Array of items
   * @param {object} pagination - { page, limit, total, totalPages }
   */
  static paginated(res, message = 'Success', data = [], pagination = {}) {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  }
}

module.exports = ApiResponse;
