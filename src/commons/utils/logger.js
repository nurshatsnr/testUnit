import path from 'path';
import pino from 'pino';

// Custom levels including 'production' if needed
const customLevels = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
  production: 70 // Include 'production' if it's a specific requirement
};

export const logger = pino({
  customLevels: customLevels, // Add custom levels
  useOnlyCustomLevels: true, // Use only custom levels
  level:  'info', // Set default level to 'info'
  prettyPrint: process.env.NODE_ENV !== 'production' || process.env.LOG_PRETTY_PRINT === 'true',
});

export let log = logger.child({ filename: path.basename(__filename) });

// Example usage
log.info('Application starting...');
if (process.env.NODE_ENV === 'production') {
  log.production('This is a production log message.');
}
