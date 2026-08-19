/**
 * Redis Client
 * Shared Redis client for caching, rate limiting, and session management
 */

import { createClient, RedisClientType } from 'redis';
import settings from '../config/settings';
import logger from './logger';

class RedisClientWrapper {
  private client: RedisClientType;
  private isConnected = false;

  constructor() {
    this.client = createClient({
      socket: {
        host: settings.redisHost,
        port: settings.redisPort,
      },
      password: settings.redisPassword,
    });

    this.client.on('error', (err: Error) => {
      logger.error('Redis client error', { error: err.message });
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis client connected');
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.setEx(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  getClient(): RedisClientType {
    return this.client;
  }
}

export const redisClient = new RedisClientWrapper();
export default redisClient;
