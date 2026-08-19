/**
 * API Gateway - Main Entry Point
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import settings from './config/settings';
import swaggerSpec from './config/swagger';
import logger from './utils/logger';
import redisClient from './utils/redisClient';

import rateLimiterMiddleware from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import healthRoutes from './routes/health';
import dashboardRoutes from './routes/dashboard';
import snippetsRoutes from './routes/snippets';
import analyticsRoutes from './routes/analytics';

const app: Express = express();

// Security & performance middleware
app.use(helmet());
app.use(
  cors({
    origin: settings.corsOrigins.includes('*') ? '*' : settings.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  })
);
app.use(compression());
app.use(express.json());
app.use(
  morgan('combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
  })
);

// Rate limiting (applied globally)
app.use(rateLimiterMiddleware);

// Health checks (unauthenticated, no rate limit bypass needed)
app.use('/health', healthRoutes);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API v1 routes
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/snippets', snippetsRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: settings.appName,
    version: settings.appVersion,
    status: 'running',
    docs: '/api-docs',
    timestamp: new Date().toISOString(),
  });
});

// 404 and error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

async function start(): Promise<void> {
  try {
    await redisClient.connect();
    logger.info('Connected to Redis');

    app.listen(settings.port, () => {
      logger.info(`${settings.appName} listening on port ${settings.port}`, {
        env: settings.nodeEnv,
      });
    });
  } catch (error) {
    logger.error('Failed to start API Gateway', { error: (error as Error).message });
    process.exit(1);
  }
}

start();

export default app;
