"""
API Keys Configuration
Stores external API keys for data sources
"""

from typing import Optional
from .settings import settings


class APIKeys:
    """External API keys management"""
    
    @staticmethod
    def get_reddit_credentials() -> tuple[Optional[str], Optional[str]]:
        """Get Reddit API credentials"""
        return settings.reddit_client_id, settings.reddit_client_secret
    
    @staticmethod
    def get_youtube_api_key() -> Optional[str]:
        """Get YouTube API key"""
        return settings.youtube_api_key
    
    @staticmethod
    def validate_reddit_credentials() -> bool:
        """Validate Reddit credentials are present"""
        return bool(settings.reddit_client_id and settings.reddit_client_secret)
    
    @staticmethod
    def validate_youtube_credentials() -> bool:
        """Validate YouTube credentials are present"""
        return bool(settings.youtube_api_key)
