/**
 * Dashboard Routes
 * Proxies analytics dashboard endpoints from the Analytics Service
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import proxyRequest from '../utils/proxyService';
import cacheMiddleware from '../middleware/cache';

const router = Router();

const dashboardQuerySchema = z.object({
  segment_id: z.coerce.number().optional(),
  time_range: z.enum(['7d', '30d', '90d']).optional().default('30d'),
  source: z.string().optional(),
  sentiment: z.string().optional(),
  hesitation_driver: z.string().optional(),
});

function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({ error: 'Invalid query parameters', details: result.error.issues });
      return;
    }
    req.query = result.data as never;
    next();
  };
}

/**
 * GET /api/v1/dashboard/metrics
 */
router.get(
  '/metrics',
  validateQuery(dashboardQuerySchema),
  cacheMiddleware(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await proxyRequest('analytics', {
        path: '/analytics/kpi-metrics',
        params: req.query,
      });
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/dashboard/friction-breakdown
 */
router.get(
  '/friction-breakdown',
  validateQuery(dashboardQuerySchema),
  cacheMiddleware(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await proxyRequest('analytics', {
        path: '/analytics/friction-breakdown',
        params: req.query,
      });
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/dashboard/intent-matrix
 */
router.get(
  '/intent-matrix',
  validateQuery(dashboardQuerySchema),
  cacheMiddleware(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await proxyRequest('analytics', {
        path: '/analytics/intent-matrix',
        params: req.query,
      });
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/dashboard/journey-tracker
 */
router.get(
  '/journey-tracker',
  validateQuery(dashboardQuerySchema),
  cacheMiddleware(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await proxyRequest('analytics', {
        path: '/analytics/journey-tracker',
        params: req.query,
      });
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/dashboard/opportunity-matrix
 */
router.get(
  '/opportunity-matrix',
  validateQuery(z.object({
    time_range: z.enum(['7d', '30d', '90d']).optional().default('30d'),
    source: z.string().optional(),
    sentiment: z.string().optional(),
    hesitation_driver: z.string().optional(),
  })),
  cacheMiddleware(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await proxyRequest('analytics', {
        path: '/analytics/opportunity-matrix',
        params: req.query,
      });
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/dashboard/summary
 */
router.get(
  '/summary',
  validateQuery(dashboardQuerySchema),
  cacheMiddleware(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await proxyRequest('analytics', {
        path: '/analytics/dashboard-summary',
        params: req.query,
      });
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
