"""
Sentiment Analyzer
BERT-based sentiment analysis model
"""

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from typing import List, Dict, Any, Tuple
import logging
import numpy as np

from .model_loader import model_loader
from ..config.settings import settings

logger = logging.getLogger(__name__)


class SentimentAnalyzer:
    """BERT-based sentiment analysis"""
    
    LABELS = ['negative', 'neutral', 'positive']
    
    def __init__(self):
        """Initialize sentiment analyzer"""
        self.model = None
        self.tokenizer = None
        self.device = torch.device(settings.device if torch.cuda.is_available() else "cpu")
    
    def load_model(self) -> None:
        """Load sentiment analysis model"""
        try:
            self.model, self.tokenizer = model_loader.load_sentiment_model(num_labels=len(self.LABELS))
            logger.info("Sentiment analyzer model loaded")
        except Exception as e:
            logger.error(f"Failed to load sentiment model: {e}")
            raise
    
    def predict(self, text: str) -> Dict[str, Any]:
        """
        Predict sentiment for a single text
        
        Args:
            text: Input text
            
        Returns:
            Dictionary with sentiment label and confidence
        """
        if not self.model or not self.tokenizer:
            self.load_model()
        
        try:
            # Tokenize
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                max_length=settings.max_sequence_length,
                padding=True
            )
            
            # Move to device
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Predict
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
            
            # Get probabilities
            probabilities = torch.softmax(logits, dim=-1)
            confidence, predicted_class = torch.max(probabilities, dim=-1)
            
            return {
                'sentiment': self.LABELS[predicted_class.item()],
                'confidence': confidence.item(),
                'probabilities': {
                    self.LABELS[i]: prob.item() 
                    for i, prob in enumerate(probabilities[0])
                }
            }
            
        except Exception as e:
            logger.error(f"Error predicting sentiment: {e}")
            return {
                'sentiment': 'neutral',
                'confidence': 0.0,
                'probabilities': {label: 0.0 for label in self.LABELS}
            }
    
    def predict_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """
        Predict sentiment for multiple texts
        
        Args:
            texts: List of input texts
            
        Returns:
            List of sentiment predictions
        """
        if not self.model or not self.tokenizer:
            self.load_model()
        
        results = []
        
        # Process in batches
        batch_size = settings.batch_size
        
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]
            
            try:
                # Tokenize batch
                inputs = self.tokenizer(
                    batch_texts,
                    return_tensors="pt",
                    truncation=True,
                    max_length=settings.max_sequence_length,
                    padding=True
                )
                
                # Move to device
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
                
                # Predict
                with torch.no_grad():
                    outputs = self.model(**inputs)
                    logits = outputs.logits
                
                # Get probabilities
                probabilities = torch.softmax(logits, dim=-1)
                confidences, predicted_classes = torch.max(probabilities, dim=-1)
                
                # Process results
                for j in range(len(batch_texts)):
                    results.append({
                        'sentiment': self.LABELS[predicted_classes[j].item()],
                        'confidence': confidences[j].item(),
                        'probabilities': {
                            self.LABELS[k]: prob.item() 
                            for k, prob in enumerate(probabilities[j])
                        }
                    })
                    
            except Exception as e:
                logger.error(f"Error predicting batch sentiment: {e}")
                # Add neutral predictions for failed batch
                for _ in batch_texts:
                    results.append({
                        'sentiment': 'neutral',
                        'confidence': 0.0,
                        'probabilities': {label: 0.0 for label in self.LABELS}
                    })
        
        return results
    
    def get_sentiment_distribution(self, texts: List[str]) -> Dict[str, float]:
        """
        Get sentiment distribution for a list of texts
        
        Args:
            texts: List of input texts
            
        Returns:
            Dictionary with sentiment percentages
        """
        predictions = self.predict_batch(texts)
        
        sentiment_counts = {label: 0 for label in self.LABELS}
        for pred in predictions:
            sentiment_counts[pred['sentiment']] += 1
        
        total = len(predictions)
        if total == 0:
            return {label: 0.0 for label in self.LABELS}
        
        return {
            label: (count / total) * 100 
            for label, count in sentiment_counts.items()
        }


# Global sentiment analyzer instance
sentiment_analyzer = SentimentAnalyzer()
