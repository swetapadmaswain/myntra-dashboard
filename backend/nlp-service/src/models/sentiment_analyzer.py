"""
Sentiment Analyzer
Lightweight VADER rule-based sentiment analysis
"""

from typing import List, Dict, Any
import logging

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

logger = logging.getLogger(__name__)


class SentimentAnalyzer:
    """Rule-based VADER sentiment analysis"""

    LABELS = ['negative', 'neutral', 'positive']

    def __init__(self):
        """Initialize sentiment analyzer"""
        self.analyzer = None

    def load_model(self) -> None:
        """Load VADER sentiment analyzer"""
        try:
            self.analyzer = SentimentIntensityAnalyzer()
            logger.info("Sentiment analyzer (VADER) loaded")
        except Exception as e:
            logger.error(f"Failed to load VADER: {e}")
            raise

    def _ensure_loaded(self):
        if not self.analyzer:
            self.load_model()

    def predict(self, text: str) -> Dict[str, Any]:
        """
        Predict sentiment for a single text

        Args:
            text: Input text

        Returns:
            Dictionary with sentiment label and confidence
        """
        self._ensure_loaded()

        try:
            scores = self.analyzer.polarity_scores(text)
            compound = scores['compound']

            if compound >= 0.05:
                sentiment = 'positive'
            elif compound <= -0.05:
                sentiment = 'negative'
            else:
                sentiment = 'neutral'

            probabilities = {
                'negative': scores['neg'],
                'neutral': scores['neu'],
                'positive': scores['pos']
            }

            # Confidence is the highest probability
            confidence = max(probabilities.values())

            return {
                'sentiment': sentiment,
                'confidence': confidence,
                'probabilities': probabilities
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
        return [self.predict(text) for text in texts]

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
