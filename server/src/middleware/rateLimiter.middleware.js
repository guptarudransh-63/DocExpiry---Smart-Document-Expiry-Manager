const rateLimit = require('express-rate-limit');
const ApiResponse = require('../utils/ApiResponse');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    ApiResponse.error(res, 429, 'Too many requests from this IP, please try again after 15 minutes');
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    ApiResponse.error(res, 429, 'Too many login attempts, please try again after 15 minutes');
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
