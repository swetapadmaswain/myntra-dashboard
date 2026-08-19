"""
Redis Client
Cache client for Redis operations
"""

import redis
import json
from typing import Any, Optional
import logging

from ..config.settings import settings

logger = logging.getLogger(__name__)


class RedisClient:
    """Redis cache client"""
    
    def __init__(self):
        """Initialize Redis client"""
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self) -> None:
        """Initialize Redis client"""
        try:
            self.client = redis.Redis(
                host=settings.redis_host,
                port=settings.redis_port,
                db=settings.redis_db,
                password=settings.redis_password,
                decode_responses=True
            )
            # Test connection
            self.client.ping()
            logger.info("Redis client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Redis client: {e}")
            raise
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get a value from Redis
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None
        """
        try:
            value = self.client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Error getting value from Redis: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """
        Set a value in Redis
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds
            
        Returns:
            True if successful, False otherwise
        """
        try:
            serialized_value = json.dumps(value)
            if ttl:
                return self.client.setex(key, ttl, serialized_value)
            return self.client.set(key, serialized_value)
        except Exception as e:
            logger.error(f"Error setting value in Redis: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """
        Delete a value from Redis
        
        Args:
            key: Cache key
            
        Returns:
            True if successful, False otherwise
        """
        try:
            return self.client.delete(key) > 0
        except Exception as e:
            logger.error(f"Error deleting value from Redis: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """
        Check if a key exists in Redis
        
        Args:
            key: Cache key
            
        Returns:
            True if key exists, False otherwise
        """
        try:
            return self.client.exists(key) > 0
        except Exception as e:
            logger.error(f"Error checking key existence in Redis: {e}")
            return False
    
    def increment(self, key: str, amount: int = 1) -> int:
        """
        Increment a value in Redis
        
        Args:
            key: Cache key
            amount: Amount to increment
            
        Returns:
            New value
        """
        try:
            return self.client.incrby(key, amount)
        except Exception as e:
            logger.error(f"Error incrementing value in Redis: {e}")
            return 0
    
    def get_ttl(self, key: str) -> int:
        """
        Get time to live for a key
        
        Args:
            key: Cache key
            
        Returns:
            TTL in seconds
        """
        try:
            return self.client.ttl(key)
        except Exception as e:
            logger.error(f"Error getting TTL from Redis: {e}")
            return -1
    
    def flush_pattern(self, pattern: str) -> int:
        """
        Delete all keys matching a pattern
        
        Args:
            pattern: Key pattern
            
        Returns:
            Number of keys deleted
        """
        try:
            keys = self.client.keys(pattern)
            if keys:
                return self.client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Error flushing pattern in Redis: {e}")
            return 0
    
    def close(self) -> None:
        """Close Redis connection"""
        if self.client:
            self.client.close()
            logger.info("Redis connection closed")


# Global Redis client instance
redis_client = RedisClient()
