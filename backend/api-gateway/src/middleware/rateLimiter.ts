/**
 * Rate Limiting Middleware
 * Redis-backed rate limiter applied per client IP / API key
 */

import { Request, Response, NextFunction } from 'express';
import settings from '../config/settings';
import redisClient from '../utils/redisClient';
import logger from '../utils/logger';

function getClientKey(req: Request): string {
  const apiKey = req.headers['x-api-key'] as string | undefined;
  if (apiKey) {
    return `ratelimit:apikey:${apiKey}`;
  }
  return `ratelimit:ip:${req.ip}`;
}

export async function rateLimiterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const key = getClientKey(req);
  const windowSeconds = Math.ceil(settings.rateLimitWindowMs / 1000);

  try {
    const currentCount = await redisClient.incr(key);

    if (currentCount === 1) {
      await redisClient.expire(key, windowSeconds);
    }

    const ttl = await redisClient.ttl(key);
    const remaining = Math.max(settings.rateLimitMaxRequests - currentCount, 0);

    res.setHeader('X-RateLimit-Limit', settings.rateLimitMaxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', ttl.toString());

    if (currentCount > settings.rateLimitMaxRequests) {
      res.status(429).json({
        error: 'Too many requests',
        retryAfterSeconds: ttl,
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Rate limiter error, allowing request through', {
      error: (error as Error).message,
    });
    // Fail open if Redis is unavailable
    next();
  }
}

export default rateLimiterMiddleware;
