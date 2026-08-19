/**
 * JWT Authentication Middleware
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import settings from '../config/settings';
import logger from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

export function generateToken(payload: object): string {
  return jwt.sign(payload, settings.jwtSecret, {
    expiresIn: settings.jwtExpiresIn,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): any {
  return jwt.verify(token, settings.jwtSecret);
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid JWT token', { error: (error as Error).message });
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
  } catch (error) {
    logger.warn('Invalid JWT token in optional auth', { error: (error as Error).message });
  }

  next();
}
