"""
Hesitation Driver Detector
Lightweight keyword-based hesitation driver detection
"""

from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class HesitationDetector:
    """Keyword-based hesitation driver detection"""

    LABELS = ['fit_sizing', 'product_styling', 'social_validation', 'visual_reality', 'price_value']

    HESITATION_KEYWORDS = {
        'fit_sizing': [
            'fit', 'fitting', 'size', 'sizing', 'small', 'large', 'tight',
            'loose', 'length', 'measurement', 'xl', 'xxl', 'medium', 'm size'
        ],
        'product_styling': [
            'color', 'colour', 'design', 'style', 'pattern', 'material',
            'fabric', 'look', 'appearance', 'shade', 'print'
        ],
        'social_validation': [
            'review', 'reviews', 'rating', 'ratings', 'feedback',
            'opinion', 'recommended', 'suggestion', 'advice', 'people say'
        ],
        'visual_reality': [
            'image', 'photo', 'picture', 'video', 'looks different',
            'not as shown', 'quality', 'real', 'actual', 'true to color'
        ],
        'price_value': [
            'price', 'cost', 'expensive', 'cheap', 'discount', 'offer',
            'sale', 'affordable', 'budget', 'value for money', 'worth',
            'overpriced', 'deal'
        ]
    }

    def __init__(self):
        """Initialize hesitation detector"""
        pass

    def load_model(self) -> None:
        """No model to load"""
        logger.info("Hesitation detector (keyword) loaded")

    def predict(self, text: str) -> Dict[str, Any]:
        """
        Predict hesitation driver for a single text

        Args:
            text: Input text

        Returns:
            Dictionary with hesitation driver label and confidence
        """
        text_lower = text.lower()
        scores = {label: 0.0 for label in self.LABELS}

        for driver, keywords in self.HESITATION_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text_lower:
                    scores[driver] += 1.0

        # Default if no keywords matched
        if all(score == 0.0 for score in scores.values()):
            scores['fit_sizing'] = 1.0

        total = sum(scores.values())
        probabilities = {label: (score / total) if total > 0 else 0.0 for label, score in scores.items()}

        predicted_driver = max(probabilities, key=probabilities.get)
        confidence = probabilities[predicted_driver]

        return {
            'hesitation_driver': predicted_driver,
            'confidence': confidence,
            'probabilities': probabilities
        }

    def predict_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """
        Predict hesitation driver for multiple texts

        Args:
            texts: List of input texts

        Returns:
            List of hesitation driver predictions
        """
        return [self.predict(text) for text in texts]

    def get_hesitation_distribution(self, texts: List[str]) -> Dict[str, float]:
        """
        Get hesitation driver distribution for a list of texts

        Args:
            texts: List of input texts

        Returns:
            Dictionary with hesitation driver percentages
        """
        predictions = self.predict_batch(texts)

        hesitation_counts = {label: 0 for label in self.LABELS}
        for pred in predictions:
            hesitation_counts[pred['hesitation_driver']] += 1

        total = len(predictions)
        if total == 0:
            return {label: 0.0 for label in self.LABELS}

        return {
            label: (count / total) * 100
            for label, count in hesitation_counts.items()
        }


# Global hesitation detector instance
hesitation_detector = HesitationDetector()
