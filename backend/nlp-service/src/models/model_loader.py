"""
Model Loader
Lightweight placeholder for the old model loading system.
The NLP pipeline now uses rule-based and VADER algorithms that do not require
heavy PyTorch or Transformer model downloads.
"""

from typing import List
import logging

logger = logging.getLogger(__name__)


class ModelLoader:
    """Lightweight model loader that tracks the lightweight mode"""

    def __init__(self):
        """Initialize model loader"""
        self.models: List[str] = ['vader', 'keywords']

    def load_sentiment_model(self, num_labels: int = 3):
        """Sentiment is handled by VADER, no model to load"""
        return None, None

    def load_intent_model(self, num_labels: int = 4):
        """Intent is handled by keyword rules, no model to load"""
        return None, None

    def load_hesitation_model(self):
        """Hesitation is handled by keyword rules, no model to load"""
        return None

    def load_entity_model(self):
        """Entities are handled by rule matching, no model to load"""
        return None

    def unload_model(self, model_name: str) -> None:
        """Unload a model from memory"""
        pass

    def unload_all(self) -> None:
        """Unload all models from memory"""
        logger.info("All lightweight models unloaded")

    def get_loaded_models(self) -> list:
        """
        Get list of loaded models

        Returns:
            List of loaded model names
        """
        return list(self.models)


# Global model loader instance
model_loader = ModelLoader()
