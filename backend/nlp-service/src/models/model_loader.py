"""
Model Loader
Utilities for loading and managing ML models
"""

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from typing import Dict, Any, Optional
import logging
from pathlib import Path
import spacy

from ..config.settings import settings

logger = logging.getLogger(__name__)


class ModelLoader:
    """Model loading and management utilities"""
    
    def __init__(self):
        """Initialize model loader"""
        self.device = torch.device(settings.device if torch.cuda.is_available() else "cpu")
        self.models: Dict[str, Any] = {}
        self.tokenizers: Dict[str, Any] = {}
        logger.info(f"Model loader initialized with device: {self.device}")
    
    def load_sentiment_model(self, num_labels: int = 3) -> tuple:
        """
        Load sentiment analysis model
        
        Args:
            num_labels: Number of sentiment classes to configure the classification head for
        
        Returns:
            Tuple of (model, tokenizer)
        """
        model_name = settings.sentiment_model
        
        if 'sentiment' in self.models:
            logger.info("Sentiment model already loaded")
            return self.models['sentiment'], self.tokenizers['sentiment']
        
        try:
            logger.info(f"Loading sentiment model: {model_name}")
            
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=num_labels)
            
            model.to(self.device)
            model.eval()
            
            self.models['sentiment'] = model
            self.tokenizers['sentiment'] = tokenizer
            
            logger.info("Sentiment model loaded successfully")
            return model, tokenizer
            
        except Exception as e:
            logger.error(f"Failed to load sentiment model: {e}")
            raise
    
    def load_intent_model(self, num_labels: int = 4) -> tuple:
        """
        Load intent classification model
        
        Args:
            num_labels: Number of intent classes to configure the classification head for
        
        Returns:
            Tuple of (model, tokenizer)
        """
        model_name = settings.intent_model
        
        if 'intent' in self.models:
            logger.info("Intent model already loaded")
            return self.models['intent'], self.tokenizers['intent']
        
        try:
            logger.info(f"Loading intent model: {model_name}")
            
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=num_labels)
            
            model.to(self.device)
            model.eval()
            
            self.models['intent'] = model
            self.tokenizers['intent'] = tokenizer
            
            logger.info("Intent model loaded successfully")
            return model, tokenizer
            
        except Exception as e:
            logger.error(f"Failed to load intent model: {e}")
            raise
    
    def load_entity_model(self) -> Any:
        """
        Load NER model for entity recognition
        
        Returns:
            spaCy NLP model
        """
        model_name = settings.entity_model
        
        if 'entity' in self.models:
            logger.info("Entity model already loaded")
            return self.models['entity']
        
        try:
            logger.info(f"Loading entity model: {model_name}")
            
            nlp = spacy.load(model_name)
            
            self.models['entity'] = nlp
            
            logger.info("Entity model loaded successfully")
            return nlp
            
        except Exception as e:
            logger.error(f"Failed to load entity model: {e}")
            # Try to download if not found
            logger.info(f"Attempting to download {model_name}")
            try:
                spacy.cli.download(model_name)
                nlp = spacy.load(model_name)
                self.models['entity'] = nlp
                logger.info("Entity model downloaded and loaded successfully")
                return nlp
            except Exception as download_error:
                logger.error(f"Failed to download entity model: {download_error}")
                raise
    
    def load_hesitation_model(self) -> Optional[tuple]:
        """
        Load hesitation detection model (custom model)
        
        Returns:
            Tuple of (model, tokenizer) or None if not available
        """
        model_path = Path(settings.models_dir) / "hesitation_detector.pt"
        
        if not model_path.exists():
            logger.warning(f"Hesitation model not found at {model_path}")
            return None
        
        if 'hesitation' in self.models:
            logger.info("Hesitation model already loaded")
            return self.models['hesitation'], self.tokenizers['hesitation']
        
        try:
            logger.info(f"Loading hesitation model from {model_path}")
            
            # Load custom model (implementation depends on model architecture)
            # This is a placeholder for custom model loading
            model = torch.load(model_path, map_location=self.device)
            tokenizer = AutoTokenizer.from_pretrained(settings.sentiment_model)
            
            model.to(self.device)
            model.eval()
            
            self.models['hesitation'] = model
            self.tokenizers['hesitation'] = tokenizer
            
            logger.info("Hesitation model loaded successfully")
            return model, tokenizer
            
        except Exception as e:
            logger.error(f"Failed to load hesitation model: {e}")
            return None
    
    def unload_model(self, model_name: str) -> None:
        """
        Unload a model from memory
        
        Args:
            model_name: Name of the model to unload
        """
        if model_name in self.models:
            del self.models[model_name]
            logger.info(f"Unloaded model: {model_name}")
        
        if model_name in self.tokenizers:
            del self.tokenizers[model_name]
    
    def unload_all(self) -> None:
        """Unload all models from memory"""
        for model_name in list(self.models.keys()):
            self.unload_model(model_name)
        logger.info("All models unloaded")
    
    def get_loaded_models(self) -> list:
        """
        Get list of loaded models
        
        Returns:
            List of loaded model names
        """
        return list(self.models.keys())


# Global model loader instance
model_loader = ModelLoader()
