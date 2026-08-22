"""
YouTube Collector
Collects data from YouTube Data API v3
"""

from googleapiclient.discovery import build
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from .base_collector import BaseCollector
from ..processors.text_normalizer import TextNormalizer
from ..processors.pii_masker import PIIMasker
from ..processors.entity_extractor import EntityExtractor
from ..config.api_keys import APIKeys


class YouTubeCollector(BaseCollector):
    """YouTube data collector using YouTube Data API v3"""
    
    # Search queries for fashion-related content
    SEARCH_QUERIES = [
        'myntra haul',
        'myntra try on',
        'myntra review',
        'fashion haul india',
        'indian fashion review',
        'myntra unboxing'
    ]
    
    def __init__(self):
        """Initialize YouTube collector"""
        super().__init__("YouTube Collector", "youtube")
        self.normalizer = TextNormalizer()
        self.pii_masker = PIIMasker()
        self.entity_extractor = EntityExtractor()
        self.youtube = None
        self.api_key = None
        self._initialize_client()
    
    def _initialize_client(self) -> None:
        """Initialize YouTube API client"""
        self.api_key = APIKeys.get_youtube_api_key()
        
        if not self.api_key:
            self.logger.warning("YouTube API key not configured")
            return
        
        try:
            self.youtube = build('youtube', 'v3', developerKey=self.api_key)
            self.logger.info("YouTube client initialized successfully")
        except Exception as e:
            self.logger.error(f"Failed to initialize YouTube client: {e}")
    
    async def collect(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Collect videos and comments from YouTube
        
        Args:
            limit: Maximum number of videos to collect per query
            
        Returns:
            List of collected video data and comments
        """
        if not self.youtube:
            self.logger.error("YouTube client not initialized")
            return []
        
        all_data = []
        
        for query in self.SEARCH_QUERIES:
            try:
                self.logger.info(f"Searching for: {query}")
                
                # Search for videos
                search_response = self.youtube.search().list(
                    q=query,
                    part='id,snippet',
                    maxResults=limit,
                    order='relevance',
                    type='video',
                    publishedAfter=(datetime.now() - timedelta(days=30)).isoformat() + 'Z'
                ).execute()
                
                video_ids = [item['id']['videoId'] for item in search_response['items']]
                
                # Get video details
                videos_response = self.youtube.videos().list(
                    part='snippet,statistics',
                    id=','.join(video_ids)
                ).execute()
                
                for video in videos_response['items']:
                    # Collect video data
                    video_data = self.normalize_item({
                        'id': video['id'],
                        'title': video['snippet']['title'],
                        'description': video['snippet'].get('description', ''),
                        'author': video['snippet']['channelTitle'],
                        'channel': video['snippet']['channelTitle'],
                        'channel_id': video['snippet']['channelId'],
                        'published_at': video['snippet']['publishedAt'],
                        'view_count': video['statistics'].get('viewCount', 0),
                        'like_count': video['statistics'].get('likeCount', 0),
                        'comment_count': video['statistics'].get('commentCount', 0),
                        'type': 'video'
                    })
                    
                    if self.validate_item(video_data):
                        all_data.append(video_data)
                    
                    # Collect comments for this video
                    comments = await self.collect_comments(video['id'], limit=20)
                    all_data.extend(comments)
                
                # Update rate limit info (YouTube has daily quota)
                self.rate_limit_remaining = 10000  # Default daily quota
                self.rate_limit_reset = datetime.now() + timedelta(days=1)
                
            except Exception as e:
                self.logger.error(f"Error collecting for query '{query}': {e}")
                continue
        
        self.log_collection_summary(all_data)
        return all_data
    
    async def collect_comments(self, video_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Collect comments for a specific video
        
        Args:
            video_id: YouTube video ID
            limit: Maximum number of comments to collect
            
        Returns:
            List of collected comments
        """
        if not self.youtube:
            self.logger.error("YouTube client not initialized")
            return []
        
        try:
            comments_response = self.youtube.commentThreads().list(
                part='snippet',
                videoId=video_id,
                maxResults=limit,
                order='relevance'
            ).execute()
            
            comments = []
            
            for item in comments_response['items']:
                comment = item['snippet']['topLevelComment']['snippet']
                
                normalized_comment = self.normalize_item({
                    'id': item['id'],
                    'title': '',
                    'text': comment['textDisplay'],
                    'author': comment['authorDisplayName'],
                    'channel': '',
                    'channel_id': '',
                    'published_at': comment['publishedAt'],
                    'view_count': 0,
                    'like_count': comment['likeCount'],
                    'comment_count': 0,
                    'type': 'comment',
                    'video_id': video_id,
                    'parent_id': item.get('snippet', {}).get('parentId')
                })
                
                if self.validate_item(normalized_comment):
                    comments.append(normalized_comment)
            
            self.logger.info(f"Collected {len(comments)} comments for video {video_id}")
            return comments
            
        except Exception as e:
            self.logger.error(f"Error collecting comments for video {video_id}: {e}")
            return []
    
    def normalize_item(self, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize YouTube data to standard format
        
        Args:
            raw_item: Raw YouTube data
            
        Returns:
            Normalized data item
        """
        # Combine title and description for videos
        if raw_item['type'] == 'video':
            full_text = f"{raw_item['title']}. {raw_item['description']}" if raw_item['description'] else raw_item['title']
        else:
            full_text = raw_item['text']
        
        # Normalize text
        normalized_text = self.normalizer.normalize(full_text)
        
        # Mask PII
        masked_text = self.pii_masker.mask_all(normalized_text)
        
        # Extract entities
        entities = self.entity_extractor.extract_all(masked_text)
        
        # Use current time as the dashboard timestamp; keep real published_at in metadata
        timestamp = datetime.now()
        
        return {
            'text': masked_text,
            'source': 'youtube',
            'sentiment': None,  # Will be set by NLP service
            'hesitation_driver': None,  # Will be set by NLP service
            'entities': entities,
            'metadata': {
                'type': raw_item['type'],
                'channel': raw_item.get('channel', ''),
                'channel_id': raw_item.get('channel_id', ''),
                'video_id': raw_item.get('video_id', raw_item['id']),
                'view_count': raw_item.get('view_count', 0),
                'like_count': raw_item.get('like_count', 0),
                'comment_count': raw_item.get('comment_count', 0),
                'published_at': raw_item.get('published_at')
            },
            'timestamp': timestamp,
            'author': self.pii_masker.mask_username(raw_item['author']),
            'source_url': f"https://youtube.com/watch?v={raw_item['id']}" if raw_item['type'] == 'video' else '',
            'upvotes': raw_item.get('like_count', 0),
            'replies': raw_item.get('comment_count', 0),
            'processed': False,
            'createdAt': datetime.now(),
            'updatedAt': datetime.now()
        }
