const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler.middleware');
const ApiResponse = require('./utils/ApiResponse');
const logger = require('./utils/logger');

const app = express();

// --------------- Security Middleware ---------------

// Set secure HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.nodeEnv === 'production'
      ? process.env.CLIENT_URL
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// --------------- Body Parsing ---------------

// Parse JSON bodies (limit to 10kb to prevent abuse)
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// --------------- Logging ---------------

// HTTP request logging (skip in test)
if (config.nodeEnv !== 'test') {
  app.use(
    morgan('dev', {
      stream: { write: (message) => logger.http(message.trim()) },
    })
  );
}

// --------------- Static Files (for local storage mode) ---------------

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const authRoutes = require('./routes/auth.routes');
const documentRoutes = require('./routes/document.routes');
const notificationRoutes = require('./routes/notification.routes');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');

// Apply global rate limiting to all /api routes in production / development (skip in test)
if (config.nodeEnv !== 'test') {
  app.use('/api', apiLimiter);
}

// --------------- Health Check ---------------

app.get('/api/health', (req, res) => {
  ApiResponse.success(res, 200, 'Server is running', {
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// --------------- API Routes ---------------

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);

// --------------- 404 Handler ---------------

app.use((req, res) => {
  ApiResponse.error(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
});

// --------------- Global Error Handler ---------------

app.use(errorHandler);

module.exports = app;
