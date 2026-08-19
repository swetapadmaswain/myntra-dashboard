"""
Intent Classifier
RoBERTa-based intent classification model
"""

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from typing import List, Dict, Any
import logging

from .model_loader import model_loader
from ..config.settings import settings

logger = logging.getLogger(__name__)


class IntentClassifier:
    """RoBERTa-based intent classification"""
    
    LABELS = ['bookmarking', 'immediate_purchase', 'research', 'comparison']
    
    def __init__(self):
        """Initialize intent classifier"""
        self.model = None
        self.tokenizer = None
        self.device = torch.device(settings.device if torch.cuda.is_available() else "cpu")
    
    def load_model(self) -> None:
        """Load intent classification model"""
        try:
            self.model, self.tokenizer = model_loader.load_intent_model(num_labels=len(self.LABELS))
            logger.info("Intent classifier model loaded")
        except Exception as e:
            logger.error(f"Failed to load intent model: {e}")
            raise
    
    def predict(self, text: str) -> Dict[str, Any]:
        """
        Predict intent for a single text
        
        Args:
            text: Input text
            
        Returns:
            Dictionary with intent label and confidence
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
                'intent': self.LABELS[predicted_class.item()],
                'confidence': confidence.item(),
                'probabilities': {
                    self.LABELS[i]: prob.item() 
                    for i, prob in enumerate(probabilities[0])
                }
            }
            
        except Exception as e:
            logger.error(f"Error predicting intent: {e}")
            return {
                'intent': 'research',
                'confidence': 0.0,
                'probabilities': {label: 0.0 for label in self.LABELS}
            }
    
    def predict_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """
        Predict intent for multiple texts
        
        Args:
            texts: List of input texts
            
        Returns:
            List of intent predictions
        """
        if not self.model or not self.tokenizer:
            self.load_model()
        
        results = []
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
                        'intent': self.LABELS[predicted_classes[j].item()],
                        'confidence': confidences[j].item(),
                        'probabilities': {
                            self.LABELS[k]: prob.item() 
                            for k, prob in enumerate(probabilities[j])
                        }
                    })
                    
            except Exception as e:
                logger.error(f"Error predicting batch intent: {e}")
                for _ in batch_texts:
                    results.append({
                        'intent': 'research',
                        'confidence': 0.0,
                        'probabilities': {label: 0.0 for label in self.LABELS}
                    })
        
        return results
    
    def get_intent_distribution(self, texts: List[str]) -> Dict[str, float]:
        """
        Get intent distribution for a list of texts
        
        Args:
            texts: List of input texts
            
        Returns:
            Dictionary with intent percentages
        """
        predictions = self.predict_batch(texts)
        
        intent_counts = {label: 0 for label in self.LABELS}
        for pred in predictions:
            intent_counts[pred['intent']] += 1
        
        total = len(predictions)
        if total == 0:
            return {label: 0.0 for label in self.LABELS}
        
        return {
            label: (count / total) * 100 
            for label, count in intent_counts.items()
        }


# Global intent classifier instance
intent_classifier = IntentClassifier()
