"""
Text Normalizer
Cleans and normalizes text data from various sources
"""

import re
import html


class TextNormalizer:
    """Text normalization utilities"""
    
    # Common contractions to expand
    CONTRACTIONS = {
        "won't": "will not",
        "can't": "cannot",
        "n't": " not",
        "'re": " are",
        "'ve": " have",
        "'ll": " will",
        "'d": " would",
        "'m": " am"
    }
    
    @staticmethod
    def normalize(text: str) -> str:
        """
        Normalize text by applying various cleaning steps
        
        Args:
            text: Raw text to normalize
            
        Returns:
            Normalized text
        """
        if not text:
            return ""
        
        # Decode HTML entities
        text = html.unescape(text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove URLs
        text = re.sub(r'http\S+|www\.\S+', '', text)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s\.,!?;:]', '', text)
        
        # Strip leading/trailing whitespace
        text = text.strip()
        
        return text
    
    @staticmethod
    def expand_contractions(text: str) -> str:
        """
        Expand common contractions
        
        Args:
            text: Text with contractions
            
        Returns:
            Text with expanded contractions
        """
        for contraction, expansion in TextNormalizer.CONTRACTIONS.items():
            text = text.replace(contraction, expansion)
        return text
    
    @staticmethod
    def lowercase(text: str) -> str:
        """
        Convert text to lowercase
        
        Args:
            text: Text to convert
            
        Returns:
            Lowercase text
        """
        return text.lower()
    
    @staticmethod
    def remove_emojis(text: str) -> str:
        """
        Remove emojis from text
        
        Args:
            text: Text with emojis
            
        Returns:
            Text without emojis
        """
        emoji_pattern = re.compile(
            "["
            "\U0001F600-\U0001F64F"  # emoticons
            "\U0001F300-\U0001F5FF"  # symbols & pictographs
            "\U0001F680-\U0001F6FF"  # transport & map symbols
            "\U0001F1E0-\U0001F1FF"  # flags
            "\U00002702-\U000027B0"
            "\U000024C2-\U0001F251"
            "]+",
            flags=re.UNICODE
        )
        return emoji_pattern.sub('', text)
    
    @staticmethod
    def truncate(text: str, max_length: int = 1000) -> str:
        """
        Truncate text to maximum length
        
        Args:
            text: Text to truncate
            max_length: Maximum length
            
        Returns:
            Truncated text
        """
        if len(text) <= max_length:
            return text
        return text[:max_length-3] + "..."
