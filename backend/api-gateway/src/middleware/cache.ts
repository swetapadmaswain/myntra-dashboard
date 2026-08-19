/**
 * Caching Middleware
 * Caches GET responses in Redis based on full URL
 */

import { Request, Response, NextFunction } from 'express';
import settings from '../config/settings';
import redisClient from '../utils/redisClient';
import logger from '../utils/logger';

export function cacheMiddleware(ttlSeconds: number = settings.cacheTtlSeconds) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    const cacheKey = `cache:gateway:${req.originalUrl}`;

    try {
      const cached = await redisClient.get(cacheKey);

      if (cached) {
        logger.debug('Cache hit', { key: cacheKey });
        res.setHeader('X-Cache', 'HIT');
        res.json(JSON.parse(cached));
        return;
      }

      res.setHeader('X-Cache', 'MISS');

      const originalJson = res.json.bind(res);
      res.json = ((body: unknown) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient
            .set(cacheKey, JSON.stringify(body), ttlSeconds)
            .catch((err: Error) =>
              logger.error('Failed to set cache', { error: err.message })
            );
        }
        return originalJson(body);
      }) as typeof res.json;

      next();
    } catch (error) {
      logger.error('Cache middleware error, bypassing cache', {
        error: (error as Error).message,
      });
      next();
    }
  };
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  const client = redisClient.getClient();
  const keys = await client.keys(pattern);
  if (keys.length > 0) {
    await client.del(keys);
  }
}

export default cacheMiddleware;
