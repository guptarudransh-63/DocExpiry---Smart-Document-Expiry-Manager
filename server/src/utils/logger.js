const path = require('path');
const fs = require('fs');

const LEVELS = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };

const COLORS = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m',  // Yellow
  info: '\x1b[32m',  // Green
  http: '\x1b[35m',  // Magenta
  debug: '\x1b[36m', // Cyan
  reset: '\x1b[0m',
};

const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').slice(0, 19);
};

const isProd = process.env.NODE_ENV === 'production';
const currentLevel = isProd ? 2 : 4; // info in prod, debug in dev

const formatMessage = (level, message, meta) => {
  const ts = getTimestamp();
  const color = COLORS[level] || '';
  const reset = COLORS.reset;
  const levelTag = `${color}[${level.toUpperCase()}]${reset}`;

  let metaStr = '';
  if (meta instanceof Error) {
    metaStr = `\n${meta.stack || meta.message}`;
  } else if (meta && typeof meta === 'object') {
    try {
      metaStr = ` ${JSON.stringify(meta)}`;
    } catch {
      metaStr = ` ${meta}`;
    }
  } else if (meta !== undefined) {
    metaStr = ` ${meta}`;
  }

  return `${ts} ${levelTag}: ${message}${metaStr}`;
};

const logToFile = (level, message, meta) => {
  if (!isProd) return;
  try {
    const logsDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const logLine = `${getTimestamp()} [${level.toUpperCase()}]: ${message} ${meta ? (meta.stack || JSON.stringify(meta)) : ''}\n`;
    fs.appendFileSync(path.join(logsDir, 'combined.log'), logLine);
    if (level === 'error') {
      fs.appendFileSync(path.join(logsDir, 'error.log'), logLine);
    }
  } catch {
    // ignore file write errors
  }
};

const logger = {
  error: (msg, meta) => {
    if (LEVELS.error <= currentLevel) {
      console.error(formatMessage('error', msg, meta));
      logToFile('error', msg, meta);
    }
  },
  warn: (msg, meta) => {
    if (LEVELS.warn <= currentLevel) {
      console.warn(formatMessage('warn', msg, meta));
      logToFile('warn', msg, meta);
    }
  },
  info: (msg, meta) => {
    if (LEVELS.info <= currentLevel) {
      console.log(formatMessage('info', msg, meta));
      logToFile('info', msg, meta);
    }
  },
  http: (msg, meta) => {
    if (LEVELS.http <= currentLevel) {
      console.log(formatMessage('http', msg, meta));
      logToFile('http', msg, meta);
    }
  },
  debug: (msg, meta) => {
    if (LEVELS.debug <= currentLevel) {
      console.log(formatMessage('debug', msg, meta));
      logToFile('debug', msg, meta);
    }
  },
};

module.exports = logger;
