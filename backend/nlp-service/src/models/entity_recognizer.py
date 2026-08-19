"""
Entity Recognizer
spaCy-based Named Entity Recognition for fashion domain
"""

import re
import spacy
from typing import List, Dict, Any
import logging

from .model_loader import model_loader
from ..config.settings import settings

logger = logging.getLogger(__name__)


class EntityRecognizer:
    """spaCy-based entity recognition for fashion domain"""
    
    ENTITY_LABELS = ['BRAND', 'CATEGORY', 'COLOR', 'SIZE', 'OCCASION']
    
    # Fashion-specific entity patterns
    BRANDS = [
        'myntra', 'nike', 'adidas', 'puma', 'reebok', 'under armour',
        'h&m', 'zara', 'levis', 'wrangler', 'pepe jeans',
        'jack & jones', 'only', 'vero moda', 'w', 'global desi',
        'roadster', 'hrx', 'campus', 'skechers'
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
    
    def __init__(self):
        """Initialize entity recognizer"""
        self.nlp = None
    
    def load_model(self) -> None:
        """Load spaCy NER model"""
        try:
            self.nlp = model_loader.load_entity_model()
            logger.info("Entity recognizer model loaded")
        except Exception as e:
            logger.error(f"Failed to load entity model: {e}")
            raise
    
    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract entities from text
        
        Args:
            text: Input text
            
        Returns:
            List of extracted entities
        """
        if not self.nlp:
            self.load_model()
        
        entities = []
        text_lower = text.lower()
        
        # Rule-based extraction for fashion-specific entities
        entities.extend(self._extract_brands(text_lower))
        entities.extend(self._extract_categories(text_lower))
        entities.extend(self._extract_colors(text_lower))
        entities.extend(self._extract_sizes(text_lower))
        entities.extend(self._extract_occasions(text_lower))
        
        # Use spaCy NER for general entities
        try:
            doc = self.nlp(text)
            for ent in doc.ents:
                # Map spaCy entity labels to our labels
                label = self._map_spacy_label(ent.label_)
                if label and label in self.ENTITY_LABELS:
                    entities.append({
                        'text': ent.text,
                        'label': label,
                        'confidence': 0.85,
                        'start': ent.start_char,
                        'end': ent.end_char
                    })
        except Exception as e:
            logger.error(f"Error in spaCy NER: {e}")
        
        # Remove duplicates
        unique_entities = []
        seen = set()
        for entity in entities:
            key = (entity['text'].lower(), entity['label'])
            if key not in seen:
                seen.add(key)
                unique_entities.append(entity)
        
        return unique_entities
    
    def _extract_brands(self, text: str) -> List[Dict[str, Any]]:
        """Extract brand entities"""
        entities = []
        for brand in self.BRANDS:
            if re.search(r'\b' + re.escape(brand.lower()) + r'\b', text):
                entities.append({
                    'text': brand,
                    'label': 'BRAND',
                    'confidence': 0.90
                })
        return entities
    
    def _extract_categories(self, text: str) -> List[Dict[str, Any]]:
        """Extract category entities"""
        entities = []
        for category in self.CATEGORIES:
            if re.search(r'\b' + re.escape(category) + r'\b', text):
                entities.append({
                    'text': category,
                    'label': 'CATEGORY',
                    'confidence': 0.80
                })
        return entities
    
    def _extract_colors(self, text: str) -> List[Dict[str, Any]]:
        """Extract color entities"""
        entities = []
        for color in self.COLORS:
            if re.search(r'\b' + re.escape(color) + r'\b', text):
                entities.append({
                    'text': color,
                    'label': 'COLOR',
                    'confidence': 0.90
                })
        return entities
    
    def _extract_sizes(self, text: str) -> List[Dict[str, Any]]:
        """Extract size entities"""
        entities = []
        for size in self.SIZES:
            if re.search(r'\b' + re.escape(size.lower()) + r'\b', text):
                entities.append({
                    'text': size.upper() if len(size) <= 2 else size,
                    'label': 'SIZE',
                    'confidence': 0.95
                })
        return entities
    
    def _extract_occasions(self, text: str) -> List[Dict[str, Any]]:
        """Extract occasion entities"""
        entities = []
        for occasion in self.OCCASIONS:
            if re.search(r'\b' + re.escape(occasion) + r'\b', text):
                entities.append({
                    'text': occasion,
                    'label': 'OCCASION',
                    'confidence': 0.75
                })
        return entities
    
    def _map_spacy_label(self, spacy_label: str) -> str:
        """
        Map spaCy entity labels to our custom labels
        
        Args:
            spacy_label: spaCy entity label
            
        Returns:
            Mapped label or None
        """
        label_mapping = {
            'ORG': 'BRAND',
            'PRODUCT': 'CATEGORY',
            'PERSON': None,
            'GPE': None,
            'LOC': None,
            'DATE': None,
            'TIME': None,
            'MONEY': None,
            'QUANTITY': None,
            'ORDINAL': None,
            'CARDINAL': None
        }
        return label_mapping.get(spacy_label)
    
    def extract_entities_batch(self, texts: List[str]) -> List[List[Dict[str, Any]]]:
        """
        Extract entities from multiple texts
        
        Args:
            texts: List of input texts
            
        Returns:
            List of entity lists
        """
        results = []
        for text in texts:
            entities = self.extract_entities(text)
            results.append(entities)
        return results
    
    def get_entity_statistics(self, texts: List[str]) -> Dict[str, Any]:
        """
        Get entity statistics for a list of texts
        
        Args:
            texts: List of input texts
            
        Returns:
            Dictionary with entity statistics
        """
        all_entities = self.extract_entities_batch(texts)
        
        entity_counts = {label: 0 for label in self.ENTITY_LABELS}
        for entities in all_entities:
            for entity in entities:
                if entity['label'] in entity_counts:
                    entity_counts[entity['label']] += 1
        
        total_entities = sum(entity_counts.values())
        
        return {
            'total_entities': total_entities,
            'entity_counts': entity_counts,
            'entity_percentages': {
                label: (count / total_entities * 100) if total_entities > 0 else 0
                for label, count in entity_counts.items()
            }
        }


# Global entity recognizer instance
entity_recognizer = EntityRecognizer()
