"""
Entity Extractor
Extracts brands, categories, and other entities from text
"""

import re
from typing import List, Dict, Any


class EntityExtractor:
    """Entity extraction utilities"""
    
    # Fashion-related entity patterns
    BRANDS = [
        'myntra', 'nike', 'adidas', 'puma', 'reebok', 'under armour',
        'h&m', 'zara', 'h&m', 'levis', 'wrangler', 'pepe jeans',
        'jack & jones', 'only', 'vero moda', 'w', 'global desi',
        'roadster', 'hrx', 'nike', 'campus', 'skechers'
    ]
    
    CATEGORIES = [
        'dress', 'shirt', 't-shirt', 'top', 'jeans', 'pants', 'trousers',
        'skirt', 'jacket', 'coat', 'blazer', 'sweater', 'hoodie',
        'shoes', 'sneakers', 'boots', 'sandals', 'heels', 'flats',
        'kurta', 'saree', 'salwar', 'lehenga', 'ethnic', 'traditional',
        'bag', 'purse', 'wallet', 'watch', 'sunglasses', 'jewelry',
        'activewear', 'sportswear', 'innerwear', 'lingerie', 'nightwear'
    ]
    
    COLORS = [
        'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink',
        'black', 'white', 'gray', 'brown', 'beige', 'cream', 'navy',
        'maroon', 'teal', 'olive', 'lavender', 'peach', 'coral'
    ]
    
    SIZES = [
        'xs', 'small', 's', 'medium', 'm', 'large', 'l', 'xl', 'xxl',
        'xxxl', '2xl', '3xl', '4xl', '5xl', 'free size'
    ]
    
    OCCASIONS = [
        'casual', 'formal', 'party', 'wedding', 'office', 'sport',
        'gym', 'travel', 'festival', 'summer', 'winter', 'monsoon',
        'diwali', 'christmas', 'eid', 'navratri', 'durga puja'
    ]
    
    @staticmethod
    def extract_brands(text: str) -> List[str]:
        """
        Extract brand names from text
        
        Args:
            text: Text to analyze
            
        Returns:
            List of brand names found
        """
        found = []
        text_lower = text.lower()
        for brand in EntityExtractor.BRANDS:
            if brand.lower() in text_lower:
                found.append(brand)
        return found
    
    @staticmethod
    def extract_categories(text: str) -> List[str]:
        """
        Extract product categories from text
        
        Args:
            text: Text to analyze
            
        Returns:
            List of categories found
        """
        found = []
        text_lower = text.lower()
        for category in EntityExtractor.CATEGORIES:
            if category in text_lower:
                found.append(category)
        return found
    
    @staticmethod
    def extract_colors(text: str) -> List[str]:
        """
        Extract colors from text
        
        Args:
            text: Text to analyze
            
        Returns:
            List of colors found
        """
        found = []
        text_lower = text.lower()
        for color in EntityExtractor.COLORS:
            if color in text_lower:
                found.append(color)
        return found
    
    @staticmethod
    def extract_sizes(text: str) -> List[str]:
        """
        Extract sizes from text
        
        Args:
            text: Text to analyze
            
        Returns:
            List of sizes found
        """
        found = []
        text_lower = text.lower()
        for size in EntityExtractor.SIZES:
            if size in text_lower:
                found.append(size.upper() if len(size) <= 2 else size)
        return found
    
    @staticmethod
    def extract_occasions(text: str) -> List[str]:
        """
        Extract occasions from text
        
        Args:
            text: Text to analyze
            
        Returns:
            List of occasions found
        """
        found = []
        text_lower = text.lower()
        for occasion in EntityExtractor.OCCASIONS:
            if occasion in text_lower:
                found.append(occasion)
        return found
    
    @staticmethod
    def extract_all(text: str) -> List[Dict[str, Any]]:
        """
        Extract all entities from text
        
        Args:
            text: Text to analyze
            
        Returns:
            List of entities with labels
        """
        entities = []
        
        # Extract brands
        for brand in EntityExtractor.extract_brands(text):
            entities.append({
                'text': brand,
                'label': 'BRAND',
                'confidence': 0.85
            })
        
        # Extract categories
        for category in EntityExtractor.extract_categories(text):
            entities.append({
                'text': category,
                'label': 'CATEGORY',
                'confidence': 0.80
            })
        
        # Extract colors
        for color in EntityExtractor.extract_colors(text):
            entities.append({
                'text': color,
                'label': 'COLOR',
                'confidence': 0.90
            })
        
        # Extract sizes
        for size in EntityExtractor.extract_sizes(text):
            entities.append({
                'text': size,
                'label': 'SIZE',
                'confidence': 0.95
            })
        
        # Extract occasions
        for occasion in EntityExtractor.extract_occasions(text):
            entities.append({
                'text': occasion,
                'label': 'OCCASION',
                'confidence': 0.75
            })
        
        return entities
