/**
 * Winston Logger Configuration
 */

import winston from 'winston';
import settings from '../config/settings';

const logger = winston.createLogger({
  level: settings.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: settings.appName },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export default logger;
