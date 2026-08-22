"""
Hesitation Driver Detector
CNN + BiLSTM model for detecting hesitation drivers
"""

import torch
import torch.nn as nn
from typing import List, Dict, Any
import logging

from .model_loader import model_loader
from ..config.settings import settings

logger = logging.getLogger(__name__)


class HesitationDetector(nn.Module):
    """CNN + BiLSTM model for hesitation driver detection"""
    
    LABELS = ['fit_sizing', 'product_styling', 'social_validation', 'visual_reality', 'price_value']
    
    def __init__(self, vocab_size: int, embedding_dim: int = 300, hidden_dim: int = 128, num_classes: int = 5):
        """
        Initialize hesitation detector model
        
        Args:
            vocab_size: Size of vocabulary
            embedding_dim: Dimension of word embeddings
            hidden_dim: Dimension of hidden layers
            num_classes: Number of output classes
        """
        super(HesitationDetector, self).__init__()
        
        # Embedding layer
        self.embedding = nn.Embedding(vocab_size, embedding_dim, padding_idx=0)
        
        # CNN layers
        self.conv1 = nn.Conv1d(embedding_dim, 128, kernel_size=3, padding=1)
        self.conv2 = nn.Conv1d(128, 128, kernel_size=3, padding=1)
        self.pool = nn.MaxPool1d(2)
        
        # BiLSTM layers
        self.lstm = nn.LSTM(128, hidden_dim, batch_first=True, bidirectional=True)
        
        # Fully connected layers
        self.fc1 = nn.Linear(hidden_dim * 2, 64)
        self.fc2 = nn.Linear(64, num_classes)
        
        # Dropout
        self.dropout = nn.Dropout(0.5)
        
        # Activation
        self.relu = nn.ReLU()
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass
        
        Args:
            x: Input tensor of shape (batch_size, seq_length)
            
        Returns:
            Output tensor of shape (batch_size, num_classes)
        """
        # Embedding
        x = self.embedding(x)  # (batch_size, seq_length, embedding_dim)
        x = x.permute(0, 2, 1)  # (batch_size, embedding_dim, seq_length)
        
        # CNN
        x = self.relu(self.conv1(x))
        x = self.pool(x)
        x = self.relu(self.conv2(x))
        x = self.pool(x)
        
        # Permute for LSTM
        x = x.permute(0, 2, 1)  # (batch_size, seq_length, features)
        
        # BiLSTM
        lstm_out, (hidden, cell) = self.lstm(x)
        
        # Use last hidden state
        hidden = torch.cat((hidden[-2], hidden[-1]), dim=1)
        
        # Fully connected
        x = self.dropout(hidden)
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        
        return x


class HesitationDriverClassifier:
    """Wrapper for hesitation driver detection"""
    
    def __init__(self):
        """Initialize hesitation driver classifier"""
        self.model = None
        self.tokenizer = None
        self.device = torch.device(settings.device if torch.cuda.is_available() else "cpu")
        self.vocab_size = 10000  # Placeholder, should be set based on actual vocabulary
    
    def load_model(self) -> None:
        """Load hesitation detection model"""
        try:
            model_tuple = model_loader.load_hesitation_model()
            
            if model_tuple:
                self.model, self.tokenizer = model_tuple
                logger.info("Hesitation detector model loaded from file")
            else:
                # Initialize new model if no saved model exists
                logger.info("Initializing new hesitation detector model")
                self.model = HesitationDetector(
                    vocab_size=self.vocab_size,
                    embedding_dim=300,
                    hidden_dim=128,
                    num_classes=len(HesitationDetector.LABELS)
                )
                self.model.to(self.device)
                self.model.eval()
                
        except Exception as e:
            logger.error(f"Failed to load hesitation model: {e}")
            raise
    
    def predict(self, text: str) -> Dict[str, Any]:
        """
        Predict hesitation driver for a single text
        
        Args:
            text: Input text
            
        Returns:
            Dictionary with hesitation driver label and confidence
        """
        if not self.model:
            self.load_model()
        
        try:
            # Simple tokenization (placeholder - should use proper tokenizer)
            tokens = text.lower().split()
            token_ids = [hash(token) % self.vocab_size for token in tokens]
            token_ids = token_ids[:settings.max_sequence_length]
            
            # Convert to tensor
            input_tensor = torch.tensor([token_ids], dtype=torch.long).to(self.device)
            
            # Predict
            with torch.no_grad():
                logits = self.model(input_tensor)
                probabilities = torch.softmax(logits, dim=-1)
                confidence, predicted_class = torch.max(probabilities, dim=-1)
            
            return {
                'hesitation_driver': HesitationDetector.LABELS[predicted_class.item()],
                'confidence': confidence.item(),
                'probabilities': {
                    HesitationDetector.LABELS[i]: prob.item() 
                    for i, prob in enumerate(probabilities[0])
                }
            }
            
        except Exception as e:
            logger.error(f"Error predicting hesitation driver: {e}")
            return {
                'hesitation_driver': 'fit_sizing',
                'confidence': 0.0,
                'probabilities': {label: 0.0 for label in HesitationDetector.LABELS}
            }
    
    def predict_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """
        Predict hesitation driver for multiple texts
        
        Args:
            texts: List of input texts
            
        Returns:
            List of hesitation driver predictions
        """
        if not self.model:
            self.load_model()
        
        results = []
        
        for text in texts:
            result = self.predict(text)
            results.append(result)
        
        return results
    
    def get_hesitation_distribution(self, texts: List[str]) -> Dict[str, float]:
        """
        Get hesitation driver distribution for a list of texts
        
        Args:
            texts: List of input texts
            
        Returns:
            Dictionary with hesitation driver percentages
        """
        predictions = self.predict_batch(texts)
        
        hesitation_counts = {label: 0 for label in HesitationDetector.LABELS}
        for pred in predictions:
            hesitation_counts[pred['hesitation_driver']] += 1
        
        total = len(predictions)
        if total == 0:
            return {label: 0.0 for label in HesitationDetector.LABELS}
        
        return {
            label: (count / total) * 100 
            for label, count in hesitation_counts.items()
        }


# Global hesitation detector instance
hesitation_detector = HesitationDriverClassifier()
