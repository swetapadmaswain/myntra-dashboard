/**
 * Configuration settings for API Gateway
 * Loads environment variables with sensible defaults
 */

import dotenv from 'dotenv';

dotenv.config();

export const settings = {
  // Application
  appName: 'API Gateway',
  appVersion: '1.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',

  // Server
  port: parseInt(process.env.PORT || '3000', 10),

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',

  // Redis
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  redisPassword: process.env.REDIS_PASSWORD || undefined,

  // Downstream services
  nlpServiceUrl: process.env.NLP_SERVICE_URL || 'http://localhost:8000',
  analyticsServiceUrl: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8001',
  dataIngestionServiceUrl: process.env.DATA_INGESTION_SERVICE_URL || 'http://localhost:8002',

  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10),

  // Caching
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '300', 10),

  // CORS
  corsOrigins: (process.env.CORS_ORIGINS || '*').split(','),

  // Proxy timeouts
  proxyTimeoutMs: parseInt(process.env.PROXY_TIMEOUT_MS || '10000', 10),
  proxyMaxRetries: parseInt(process.env.PROXY_MAX_RETRIES || '2', 10),

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

export default settings;
