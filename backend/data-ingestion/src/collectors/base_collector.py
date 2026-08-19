"""
Base Collector Interface
Abstract base class for all data collectors
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging


class BaseCollector(ABC):
    """Abstract base class for data collectors"""
    
    def __init__(self, name: str, source: str):
        """
        Initialize base collector
        
        Args:
            name: Name of the collector
            source: Source identifier (reddit, appstore, youtube)
        """
        self.name = name
        self.source = source
        self.logger = logging.getLogger(f"collector.{source}")
        self.rate_limit_remaining = 0
        self.rate_limit_reset = None
    
    @abstractmethod
    async def collect(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Collect data from the source
        
        Args:
            limit: Maximum number of items to collect
            
        Returns:
            List of collected data items
        """
        pass
    
    @abstractmethod
    def normalize_item(self, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize raw item to standard format
        
        Args:
            raw_item: Raw data item from source
            
        Returns:
            Normalized data item
        """
        pass
    
    def validate_item(self, item: Dict[str, Any]) -> bool:
        """
        Validate normalized item
        
        Args:
            item: Normalized data item
            
        Returns:
            True if valid, False otherwise
        """
        required_fields = ['text', 'source', 'timestamp', 'author']
        return all(field in item for field in required_fields)
    
    def get_rate_limit_status(self) -> Dict[str, Any]:
        """
        Get current rate limit status
        
        Returns:
            Dictionary with rate limit information
        """
        return {
            'source': self.source,
            'remaining': self.rate_limit_remaining,
            'reset': self.rate_limit_reset.isoformat() if self.rate_limit_reset else None
        }
    
    async def collect_with_retry(self, limit: int = 100, max_retries: int = 3) -> List[Dict[str, Any]]:
        """
        Collect data with retry logic
        
        Args:
            limit: Maximum number of items to collect
            max_retries: Maximum number of retry attempts
            
        Returns:
            List of collected data items
        """
        from tenacity import retry, stop_after_attempt, wait_exponential
        
        @retry(
            stop=stop_after_attempt(max_retries),
            wait=wait_exponential(multiplier=1, min=2, max=10),
            reraise=True
        )
        async def _collect():
            return await self.collect(limit)
        
        try:
            return await _collect()
        except Exception as e:
            self.logger.error(f"Failed to collect data after {max_retries} retries: {e}")
            raise
    
    def log_collection_summary(self, items: List[Dict[str, Any]]) -> None:
        """
        Log collection summary
        
        Args:
            items: Collected data items
        """
        self.logger.info(
            f"Collection summary for {self.name}: "
            f"collected={len(items)}, "
            f"source={self.source}, "
            f"timestamp={datetime.now().isoformat()}"
        )
