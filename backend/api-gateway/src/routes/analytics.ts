/**
 * Analytics Routes
 * Segment and trend analytics proxied to the Analytics Service
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import proxyRequest from '../utils/proxyService';
import cacheMiddleware from '../middleware/cache';

const router = Router();

const trendsQuerySchema = z.object({
  friction_type: z.string().optional(),
  intent_type: z.string().optional(),
  segment_id: z.coerce.number().optional(),
  days: z.coerce.number().min(1).max(365).optional().default(7),
});

/**
 * GET /api/v1/analytics/segments
 * Returns available user segments
 */
router.get('/segments', cacheMiddleware(600), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await proxyRequest('analytics', {
      path: '/analytics/segments',
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/analytics/trends
 * Returns historical trend data for friction or intent types
 */
router.get('/trends', cacheMiddleware(300), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = trendsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid query parameters', details: parsed.error.issues });
      return;
    }

    const { friction_type, segment_id, days } = parsed.data;

    if (friction_type) {
      const data = await proxyRequest('analytics', {
        path: `/analytics/friction-breakdown/trend/${friction_type}`,
        params: { segment_id, days },
      });
      res.json(data);
      return;
    }

    res.status(400).json({ error: 'friction_type or intent_type query parameter is required' });
  } catch (error) {
    next(error);
  }
});

export default router;
