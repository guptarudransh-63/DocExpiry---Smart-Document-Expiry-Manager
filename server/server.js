const app = require('./src/app');
const config = require('./src/config/env');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');
const { initScheduler } = require('./src/jobs/scheduler');
const seedDemoUser = require('./src/utils/seedDemo');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

// Connect to MongoDB and start server
const startServer = async () => {
  await connectDB();
  await seedDemoUser();

  const server = app.listen(config.port, () => {
    logger.info(
      `Server running in ${config.nodeEnv} mode on port ${config.port}`
    );
    // Start background job scheduler
    initScheduler();
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', err);
    server.close(() => {
      process.exit(1);
    });
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      logger.info('Process terminated.');
    });
  });
};

startServer();
