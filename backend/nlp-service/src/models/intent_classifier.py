"""
Intent Classifier
Lightweight keyword-based intent classification
"""

from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class IntentClassifier:
    """Keyword-based intent classification"""

    LABELS = ['bookmarking', 'immediate_purchase', 'research', 'comparison']

    INTENT_KEYWORDS = {
        'immediate_purchase': [
            'buy', 'buying', 'purchase', 'purchasing', 'order', 'ordering',
            'checkout', 'pay', 'payment', 'cart', 'confirm', 'book now',
            'get this', 'want to buy'
        ],
        'bookmarking': [
            'save', 'saving', 'wishlist', 'wish list', 'bookmark',
            'later', 'buy later', 'for later', 'remember this'
        ],
        'comparison': [
            'compare', 'comparison', 'versus', 'vs', 'better than',
            'difference between', 'which is better', 'or', 'between'
        ]
    }

    def __init__(self):
        """Initialize intent classifier"""
        pass

    def load_model(self) -> None:
        """No model to load"""
        logger.info("Intent classifier (keyword) loaded")

    def predict(self, text: str) -> Dict[str, Any]:
        """
        Predict intent for a single text

        Args:
            text: Input text

        Returns:
            Dictionary with intent label and confidence
        """
        text_lower = text.lower()
        scores = {label: 0.0 for label in self.LABELS}

        for intent, keywords in self.INTENT_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text_lower:
                    scores[intent] += 1.0

        # Default to research if no keywords matched
        if all(score == 0.0 for score in scores.values()):
            scores['research'] = 1.0

        total = sum(scores.values())
        probabilities = {label: (score / total) if total > 0 else 0.0 for label, score in scores.items()}

        predicted_intent = max(probabilities, key=probabilities.get)
        confidence = probabilities[predicted_intent]

        return {
            'intent': predicted_intent,
            'confidence': confidence,
            'probabilities': probabilities
        }

    def predict_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """
        Predict intent for multiple texts

        Args:
            texts: List of input texts

        Returns:
            List of intent predictions
        """
        return [self.predict(text) for text in texts]

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
