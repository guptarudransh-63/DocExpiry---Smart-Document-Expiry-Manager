const cron = require('node-cron');
const { checkDocumentExpiries } = require('./expiryChecker.job');
const logger = require('../utils/logger');

/**
 * Initialize all scheduled background jobs.
 */
const initScheduler = () => {
  logger.info('Initializing background job scheduler...');

  // Run document expiry check every 6 hours (0 */6 * * *)
  // In development, also runs once on startup after 5 seconds to catch up
  const task = cron.schedule('0 */6 * * *', async () => {
    logger.info('Cron trigger: Running document expiry checker...');
    await checkDocumentExpiries();
  });

  // Optional: Run an initial check 5 seconds after startup
  if (process.env.NODE_ENV !== 'test') {
    setTimeout(async () => {
      try {
        logger.info('Startup catch-up: Checking document expiries...');
        await checkDocumentExpiries();
      } catch (err) {
        logger.error('Startup expiry check error:', err);
      }
    }, 5000);
  }

  logger.info('Scheduler initialized successfully (runs every 6 hours)');
  return task;
};

module.exports = {
  initScheduler,
};
