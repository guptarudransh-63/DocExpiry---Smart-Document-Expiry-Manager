const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register({ name, email, password });
    return ApiResponse.success(res, 201, 'User registered successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return ApiResponse.success(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    // JWT is stateless on client side; we provide standard logout response
    return ApiResponse.success(res, 200, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Get currently authenticated user profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user._id);
    return ApiResponse.success(res, 200, 'User profile retrieved', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user preferences
 * PUT /api/auth/preferences
 */
const updatePreferences = async (req, res, next) => {
  try {
    const user = await authService.updatePreferences(req.user._id, req.body);
    return ApiResponse.success(res, 200, 'Preferences updated successfully', {
      notificationPrefs: user.notificationPrefs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updatePreferences,
};
