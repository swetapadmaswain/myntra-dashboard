"""
Deduplicator
Detects and removes duplicate content across sources
"""

import hashlib
from typing import List, Dict, Any, Set
from datetime import datetime


class Deduplicator:
    """Duplicate detection and removal utilities"""
    
    def __init__(self):
        """Initialize deduplicator with seen content cache"""
        self.seen_hashes: Set[str] = set()
        self.seen_urls: Set[str] = set()
    
    def generate_hash(self, text: str) -> str:
        """
        Generate hash for text content
        
        Args:
            text: Text to hash
            
        Returns:
            SHA256 hash of the text
        """
        return hashlib.sha256(text.encode('utf-8')).hexdigest()
    
    def is_duplicate_by_hash(self, item: Dict[str, Any]) -> bool:
        """
        Check if item is duplicate based on content hash
        
        Args:
            item: Data item to check
            
        Returns:
            True if duplicate, False otherwise
        """
        text_hash = self.generate_hash(item['text'])
        return text_hash in self.seen_hashes
    
    def is_duplicate_by_url(self, item: Dict[str, Any]) -> bool:
        """
        Check if item is duplicate based on source URL
        
        Args:
            item: Data item to check
            
        Returns:
            True if duplicate, False otherwise
        """
        source_url = item.get('source_url', '')
        return source_url in self.seen_urls
    
    def is_duplicate(self, item: Dict[str, Any]) -> bool:
        """
        Check if item is duplicate by any method
        
        Args:
            item: Data item to check
            
        Returns:
            True if duplicate, False otherwise
        """
        return self.is_duplicate_by_hash(item) or self.is_duplicate_by_url(item)
    
    def mark_as_seen(self, item: Dict[str, Any]) -> None:
        """
        Mark item as seen to prevent future duplicates
        
        Args:
            item: Data item to mark
        """
        text_hash = self.generate_hash(item['text'])
        self.seen_hashes.add(text_hash)
        
        source_url = item.get('source_url', '')
        if source_url:
            self.seen_urls.add(source_url)
    
    def deduplicate_batch(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Remove duplicates from a batch of items
        
        Args:
            items: List of data items
            
        Returns:
            List of unique items
        """
        unique_items = []
        duplicates_count = 0
        
        for item in items:
            if not self.is_duplicate(item):
                unique_items.append(item)
                self.mark_as_seen(item)
            else:
                duplicates_count += 1
        
        return unique_items
    
    def get_stats(self) -> Dict[str, int]:
        """
        Get deduplication statistics
        
        Returns:
            Dictionary with statistics
        """
        return {
            'seen_hashes': len(self.seen_hashes),
            'seen_urls': len(self.seen_urls)
        }
    
    def reset(self) -> None:
        """Reset the deduplicator cache"""
        self.seen_hashes.clear()
        self.seen_urls.clear()
