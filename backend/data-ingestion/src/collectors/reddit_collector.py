"""
Reddit Collector
Collects data from Reddit API
"""

import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from .base_collector import BaseCollector
from ..processors.text_normalizer import TextNormalizer
from ..processors.pii_masker import PIIMasker
from ..processors.entity_extractor import EntityExtractor


class RedditCollector(BaseCollector):
    """Reddit data collector using public JSON API (no credentials needed)"""
    
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
    
    async def collect(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Collect posts from configured subreddits using public JSON API
        
        Args:
            limit: Maximum number of posts to collect per subreddit
            
        Returns:
            List of collected posts
        """
        all_posts = []
        
        for subreddit_name in self.SUBREDDITS:
            try:
                self.logger.info(f"Collecting from r/{subreddit_name}")
                
                async with httpx.AsyncClient(
                    timeout=30.0,
                    headers={
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'application/json, text/html',
                        'Accept-Language': 'en-US,en;q=0.9',
                    }
                ) as client:
                    resp = await client.get(
                        f"https://old.reddit.com/r/{subreddit_name}/new.json?limit={limit}",
                        follow_redirects=True
                    )
                    if resp.status_code != 200:
                        self.logger.error(f"Reddit returned {resp.status_code} for r/{subreddit_name}")
                        continue
                    data = resp.json()
                
                for child in data.get('data', {}).get('children', []):
                    post = child.get('data', {})
                    if not post:
                        continue
                    
                    normalized_post = self.normalize_item({
                        'id': post.get('id', ''),
                        'title': post.get('title', ''),
                        'text': post.get('selftext', ''),
                        'author': post.get('author', 'anonymous') if isinstance(post.get('author'), str) else 'anonymous',
                        'subreddit': subreddit_name,
                        'upvotes': post.get('score', 0),
                        'comments': post.get('num_comments', 0),
                        'created_utc': post.get('created_utc', datetime.now().timestamp()),
                        'url': post.get('url', ''),
                        'permalink': f"https://reddit.com{post.get('permalink', '')}"
                    })
                    
                    if self.validate_item(normalized_post):
                        all_posts.append(normalized_post)
                
            except Exception as e:
                self.logger.error(f"Error collecting from r/{subreddit_name}: {e}")
                continue
        
        self.log_collection_summary(all_posts)
        return all_posts
    
    async def collect_comments(self, post_id: str, subreddit: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Collect comments for a specific post using public JSON API
        
        Args:
            post_id: Reddit post ID
            subreddit: Subreddit name
            limit: Maximum number of comments to collect
            
        Returns:
            List of collected comments
        """
        try:
            async with httpx.AsyncClient(
                timeout=30.0,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/html',
                    'Accept-Language': 'en-US,en;q=0.9',
                }
            ) as client:
                resp = await client.get(
                    f"https://old.reddit.com/r/{subreddit}/comments/{post_id}.json?limit={limit}",
                    follow_redirects=True
                )
                if resp.status_code != 200:
                    return []
                data = resp.json()
            
            comments = []
            if len(data) > 1:
                for child in data[1].get('data', {}).get('children', [])[:limit]:
                    comment = child.get('data', {})
                    if not comment.get('body'):
                        continue
                    
                    normalized_comment = self.normalize_item({
                        'id': comment.get('id', ''),
                        'title': '',
                        'text': comment.get('body', ''),
                        'author': comment.get('author', 'anonymous') if isinstance(comment.get('author'), str) else 'anonymous',
                        'subreddit': subreddit,
                        'upvotes': comment.get('score', 0),
                        'comments': 0,
                        'created_utc': comment.get('created_utc', datetime.now().timestamp()),
                        'url': f"https://reddit.com{comment.get('permalink', '')}",
                        'permalink': f"https://reddit.com{comment.get('permalink', '')}",
                        'parent_id': comment.get('parent_id')
                    })
                    
                    if self.validate_item(normalized_comment):
                        comments.append(normalized_comment)
            
            self.logger.info(f"Collected {len(comments)} comments for post {post_id}")
            return comments
            
        except Exception as e:
            self.logger.error(f"Error collecting comments for post {post_id}: {e}")
            return []
    
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
            'timestamp': datetime.fromtimestamp(raw_item['created_utc']),
            'author': self.pii_masker.mask_username(raw_item['author']),
            'source_url': raw_item['permalink'],
            'upvotes': raw_item['upvotes'],
            'replies': raw_item['comments'],
            'processed': False,
            'createdAt': datetime.now(),
            'updatedAt': datetime.now()
        }
    
