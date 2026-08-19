/**
 * Health Check Routes
 */

import { Router, Request, Response } from 'express';
import axios from 'axios';
import settings from '../config/settings';
import redisClient from '../utils/redisClient';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /health
 * Basic liveness check
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: settings.appName,
    version: settings.appVersion,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/dependencies
 * Checks connectivity to Redis and downstream services
 */
router.get('/dependencies', async (req: Request, res: Response) => {
  const results: Record<string, { status: string; latencyMs?: number; error?: string }> = {};

  // Redis check
  try {
    const start = Date.now();
    await redisClient.getClient().ping();
    results.redis = { status: 'up', latencyMs: Date.now() - start };
  } catch (error) {
    results.redis = { status: 'down', error: (error as Error).message };
  }

  // Downstream services check
  const services: Record<string, string> = {
    nlpService: `${settings.nlpServiceUrl}/health`,
    analyticsService: `${settings.analyticsServiceUrl}/health`,
    dataIngestionService: `${settings.dataIngestionServiceUrl}/health`,
  };

  await Promise.all(
    Object.entries(services).map(async ([name, url]) => {
      try {
        const start = Date.now();
        await axios.get(url, { timeout: 5000 });
        results[name] = { status: 'up', latencyMs: Date.now() - start };
      } catch (error) {
        results[name] = { status: 'down', error: (error as Error).message };
        logger.warn(`Dependency check failed for ${name}`, { url });
      }
    })
  );

  const allHealthy = Object.values(results).every((r) => r.status === 'up');

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'degraded',
    dependencies: results,
    timestamp: new Date().toISOString(),
  });
});

export default router;
