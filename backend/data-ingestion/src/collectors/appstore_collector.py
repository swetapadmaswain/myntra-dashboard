"""
App Store Collector
Collects reviews from iOS App Store and Google Play Store
"""

import feedparser
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from google_play_scraper import app, reviews as play_store_reviews, Sort
from .base_collector import BaseCollector
from ..processors.text_normalizer import TextNormalizer
from ..processors.pii_masker import PIIMasker
from ..processors.entity_extractor import EntityExtractor


class AppStoreCollector(BaseCollector):
    """App Store review collector for iOS and Android"""
    
    # App identifiers
    IOS_APP_ID = "907394059"  # Myntra iOS App Store ID
    ANDROID_PACKAGE_ID = "com.myntra.android"  # Myntra Android package
    
    def __init__(self):
        """Initialize App Store collector"""
        super().__init__("App Store Collector", "appstore")
        self.normalizer = TextNormalizer()
        self.pii_masker = PIIMasker()
        self.entity_extractor = EntityExtractor()
    
    async def collect(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Collect reviews from both iOS and Android stores
        
        Args:
            limit: Maximum number of reviews to collect per store
            
        Returns:
            List of collected reviews
        """
        all_reviews = []
        
        # Collect iOS reviews
        ios_reviews = await self.collect_ios_reviews(limit)
        all_reviews.extend(ios_reviews)
        
        # Collect Android reviews
        android_reviews = await self.collect_android_reviews(limit)
        all_reviews.extend(android_reviews)
        
        self.log_collection_summary(all_reviews)
        return all_reviews
    
    async def collect_ios_reviews(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Collect reviews from iOS App Store using RSS feed
        
        Args:
            limit: Maximum number of reviews to collect
            
        Returns:
            List of iOS reviews
        """
        try:
            self.logger.info(f"Collecting iOS reviews from App Store")
            
            # RSS feed URL for iOS app reviews
            rss_url = f"https://itunes.apple.com/in/rss/customerreviews/id={self.IOS_APP_ID}/page=1/sortby=mostrecent/xml"
            
            feed = feedparser.parse(rss_url, agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            reviews = []
            
            for entry in feed.entries[:limit]:
                content = ''
                if getattr(entry, 'content', None) and len(entry.content) > 0:
                    content = entry.content[0].value

                updated = getattr(entry, 'updated_parsed', None) or getattr(entry, 'published_parsed', None)
                if updated:
                    updated = datetime(*updated[:6])
                else:
                    updated = getattr(entry, 'updated', None) or getattr(entry, 'published', None) or datetime.now()

                normalized_review = self.normalize_item({
                    'id': getattr(entry, 'id', ''),
                    'title': getattr(entry, 'title', ''),
                    'text': content,
                    'author': getattr(entry, 'author', None) or 'anonymous',
                    'rating': getattr(entry, 'im_rating', None) or getattr(entry, 'im:rating', None),
                    'version': getattr(entry, 'im_version', None) or getattr(entry, 'im:version', None),
                    'store': 'ios',
                    'updated': updated
                })
                
                if self.validate_item(normalized_review):
                    reviews.append(normalized_review)
            
            self.logger.info(f"Collected {len(reviews)} iOS reviews")
            return reviews
            
        except Exception as e:
            self.logger.error(f"Error collecting iOS reviews: {e}")
            return []
    
    async def collect_android_reviews(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Collect reviews from Google Play Store
        
        Args:
            limit: Maximum number of reviews to collect
            
        Returns:
            List of Android reviews
        """
        try:
            self.logger.info(f"Collecting Android reviews from Google Play Store")
            
            # Fetch reviews from Google Play Store
            result, continuation_token = play_store_reviews(
                self.ANDROID_PACKAGE_ID,
                lang='en',
                country='in',
                sort=Sort.NEWEST,
                count=limit
            )
            
            reviews = []
            
            for review in result:
                normalized_review = self.normalize_item({
                    'id': review['reviewId'],
                    'title': '',
                    'text': review['content'],
                    'author': review['userName'],
                    'rating': review['score'],
                    'version': review.get('reviewCreatedVersion'),
                    'store': 'android',
                    'updated': review['at']
                })
                
                if self.validate_item(normalized_review):
                    reviews.append(normalized_review)
            
            self.logger.info(f"Collected {len(reviews)} Android reviews")
            return reviews
            
        except Exception as e:
            self.logger.error(f"Error collecting Android reviews: {e}")
            return []
    
    def normalize_item(self, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize App Store review to standard format
        
        Args:
            raw_item: Raw review data from App Store
            
        Returns:
            Normalized data item
        """
        # Combine title and text
        full_text = f"{raw_item['title']}. {raw_item['text']}" if raw_item['title'] else raw_item['text']
        
        # Normalize text
        normalized_text = self.normalizer.normalize(full_text)
        
        # Mask PII
        masked_text = self.pii_masker.mask_all(normalized_text)
        
        # Extract entities
        entities = self.entity_extractor.extract_all(masked_text)
        
        # Parse timestamp
        timestamp = raw_item.get('updated', datetime.now())
        if isinstance(timestamp, str):
            try:
                timestamp = datetime.fromisoformat(timestamp)
            except:
                timestamp = datetime.now()
        
        return {
            'text': masked_text,
            'source': 'appstore',
            'sentiment': None,  # Will be set by NLP service
            'hesitation_driver': None,  # Will be set by NLP service
            'entities': entities,
            'metadata': {
                'store': raw_item.get('store', 'unknown'),
                'rating': raw_item.get('rating'),
                'version': raw_item.get('version'),
                'app_id': raw_item['id']
            },
            'timestamp': timestamp.isoformat() if hasattr(timestamp, 'isoformat') else str(timestamp),
            'author': self.pii_masker.mask_username(raw_item['author']),
            'source_url': '',
            'upvotes': 0,
            'replies': 0,
            'processed': False,
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
