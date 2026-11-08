const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    logger.info(`Connecting to MongoDB at ${config.mongoUri}...`);
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    logger.error(
      `Please ensure MongoDB is running. You can start it on macOS using:\n` +
      `  brew services start mongodb-community\n` +
      `  # OR in a separate terminal:\n` +
      `  mongod --config /opt/homebrew/etc/mongod.conf\n` +
      `  # OR set a cloud MongoDB Atlas URI in server/.env (MONGO_URI)`
    );
    process.exit(1);
  }
};

module.exports = connectDB;
