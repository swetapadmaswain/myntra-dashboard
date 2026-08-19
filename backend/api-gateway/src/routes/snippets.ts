/**
 * Snippets Routes
 * Handles listing and searching of conversation snippets via NLP/Analytics services
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import proxyRequest from '../utils/proxyService';
import cacheMiddleware from '../middleware/cache';

const router = Router();

const listQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  hesitation_driver: z.string().optional(),
  sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
});

const searchBodySchema = z.object({
  query: z.string().min(1),
  filters: z
    .object({
      source: z.string().optional(),
      sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
      hesitation_driver: z.string().optional(),
    })
    .optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
});

/**
 * GET /api/v1/snippets
 * Lists snippets with pagination and filtering
 */
router.get('/', cacheMiddleware(120), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid query parameters', details: parsed.error.issues });
      return;
    }

    const { page, limit, hesitation_driver, sentiment } = parsed.data;

    const data = await proxyRequest('ingestion', {
      path: '/snippets',
      params: {
        page,
        limit,
        hesitation_driver,
        sentiment,
      },
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/snippets/search
 * Full-text search over snippets with filters
 */
router.post('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = searchBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body', details: parsed.error.issues });
      return;
    }

    const data = await proxyRequest('ingestion', {
      method: 'POST',
      path: '/snippets/search',
      data: parsed.data,
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
