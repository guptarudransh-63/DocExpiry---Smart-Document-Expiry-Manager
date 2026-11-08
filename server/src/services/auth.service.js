const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * Generate signed JWT for a given user id.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

/**
 * Register a new user.
 */
const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw ApiError.conflict('An account with this email address already exists');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
  });

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      notificationPrefs: user.notificationPrefs,
      createdAt: user.createdAt,
    },
    token,
  };
};

/**
 * Login an existing user.
 */
const login = async ({ email, password }) => {
  // Explicitly select password field which is hidden by default
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      notificationPrefs: user.notificationPrefs,
      createdAt: user.createdAt,
    },
    token,
  };
};

/**
 * Get current user profile.
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

/**
 * Update user notification preferences.
 */
const updatePreferences = async (userId, preferences) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.notificationPrefs = {
    ...user.notificationPrefs.toObject(),
    ...preferences,
  };

  await user.save();
  return user;
};

module.exports = {
  generateToken,
  register,
  login,
  getCurrentUser,
  updatePreferences,
};
