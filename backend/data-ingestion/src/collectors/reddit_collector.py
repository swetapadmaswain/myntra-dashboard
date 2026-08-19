"""
Reddit Collector
Collects data from Reddit API
"""

import praw
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from .base_collector import BaseCollector
from ..processors.text_normalizer import TextNormalizer
from ..processors.pii_masker import PIIMasker
from ..processors.entity_extractor import EntityExtractor
from ..config.api_keys import APIKeys


class RedditCollector(BaseCollector):
    """Reddit data collector using PRAW"""
    
    SUBREDDITS = [
        'IndianFashionAddicts',
        'myntra',
        'fashionreps',
        'DesiFashion',
        'IndianFashion'
    ]
    
    def __init__(self):
        """Initialize Reddit collector"""
        super().__init__("Reddit Collector", "reddit")
        self.normalizer = TextNormalizer()
        self.pii_masker = PIIMasker()
        self.entity_extractor = EntityExtractor()
        self.reddit = None
        self._initialize_client()
    
    def _initialize_client(self) -> None:
        """Initialize Reddit API client"""
        client_id, client_secret = APIKeys.get_reddit_credentials()
        
        if not client_id or not client_secret:
            self.logger.warning("Reddit credentials not configured")
            return
        
        try:
            self.reddit = praw.Reddit(
                client_id=client_id,
                client_secret=client_secret,
                user_agent=f'MyntraDashboard/1.0 (by /u/myntra_dashboard)',
                read_only=True
            )
            self.logger.info("Reddit client initialized successfully")
        except Exception as e:
            self.logger.error(f"Failed to initialize Reddit client: {e}")
    
    async def collect(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Collect posts from configured subreddits
        
        Args:
            limit: Maximum number of posts to collect per subreddit
            
        Returns:
            List of collected posts
        """
        if not self.reddit:
            self.logger.error("Reddit client not initialized")
            return []
        
        all_posts = []
        
        for subreddit_name in self.SUBREDDITS:
            try:
                self.logger.info(f"Collecting from r/{subreddit_name}")
                subreddit = self.reddit.subreddit(subreddit_name)
                
                # Collect new posts
                for post in subreddit.new(limit=limit):
                    normalized_post = self.normalize_item({
                        'id': post.id,
                        'title': post.title,
                        'text': post.selftext,
                        'author': str(post.author) if post.author else '[deleted]',
                        'subreddit': subreddit_name,
                        'upvotes': post.score,
                        'comments': post.num_comments,
                        'created_utc': post.created_utc,
                        'url': post.url,
                        'permalink': f"https://reddit.com{post.permalink}"
                    })
                    
                    if self.validate_item(normalized_post):
                        all_posts.append(normalized_post)
                
                # Update rate limit info
                self.rate_limit_remaining = self.reddit.auth.limits['remaining']
                self.rate_limit_reset = datetime.fromtimestamp(
                    self.reddit.auth.limits['reset_timestamp']
                )
                
            except Exception as e:
                self.logger.error(f"Error collecting from r/{subreddit_name}: {e}")
                continue
        
        self.log_collection_summary(all_posts)
        return all_posts
    
    def normalize_item(self, raw_item: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize Reddit post to standard format
        
        Args:
            raw_item: Raw Reddit post data
            
        Returns:
            Normalized data item
        """
        # Combine title and text
        full_text = f"{raw_item['title']}. {raw_item['text']}" if raw_item['text'] else raw_item['title']
        
        # Normalize text
        normalized_text = self.normalizer.normalize(full_text)
        
        # Mask PII
        masked_text = self.pii_masker.mask_all(normalized_text)
        
        # Extract entities
        entities = self.entity_extractor.extract_all(masked_text)
        
        return {
            'text': masked_text,
            'source': 'reddit',
            'sentiment': None,  # Will be set by NLP service
            'hesitation_driver': None,  # Will be set by NLP service
            'entities': entities,
            'metadata': {
                'subreddit': raw_item['subreddit'],
                'upvotes': raw_item['upvotes'],
                'comments': raw_item['comments'],
                'reddit_id': raw_item['id'],
                'url': raw_item['url'],
                'permalink': raw_item['permalink']
            },
            'timestamp': datetime.fromtimestamp(raw_item['created_utc']).isoformat(),
            'author': self.pii_masker.mask_username(raw_item['author']),
            'source_url': raw_item['permalink'],
            'upvotes': raw_item['upvotes'],
            'replies': raw_item['comments'],
            'processed': False,
            'createdAt': datetime.now().isoformat(),
            'updatedAt': datetime.now().isoformat()
        }
    
    async def collect_comments(self, post_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Collect comments for a specific post
        
        Args:
            post_id: Reddit post ID
            limit: Maximum number of comments to collect
            
        Returns:
            List of collected comments
        """
        if not self.reddit:
            self.logger.error("Reddit client not initialized")
            return []
        
        try:
            submission = self.reddit.submission(id=post_id)
            submission.comments.replace_more(limit=0)
            
            comments = []
            for comment in submission.comments.list()[:limit]:
                if hasattr(comment, 'body'):
                    normalized_comment = self.normalize_item({
                        'id': comment.id,
                        'title': '',
                        'text': comment.body,
                        'author': str(comment.author) if comment.author else '[deleted]',
                        'subreddit': str(submission.subreddit),
                        'upvotes': comment.score,
                        'comments': 0,
                        'created_utc': comment.created_utc,
                        'url': f"https://reddit.com{comment.permalink}",
                        'permalink': f"https://reddit.com{comment.permalink}",
                        'parent_id': comment.parent_id
                    })
                    
                    if self.validate_item(normalized_comment):
                        comments.append(normalized_comment)
            
            self.logger.info(f"Collected {len(comments)} comments for post {post_id}")
            return comments
            
        except Exception as e:
            self.logger.error(f"Error collecting comments for post {post_id}: {e}")
            return []
