"""
NLP Pipeline
End-to-end processing pipeline for text data
"""

from typing import List, Dict, Any
import logging
from datetime import datetime

from ..models.sentiment_analyzer import sentiment_analyzer
from ..models.intent_classifier import intent_classifier
from ..models.hesitation_detector import hesitation_detector
from ..models.entity_recognizer import entity_recognizer

logger = logging.getLogger(__name__)


class NLPPipeline:
    """End-to-end NLP processing pipeline"""
    
    def __init__(self):
        """Initialize NLP pipeline"""
        self.models_loaded = False
    
    def load_models(self) -> None:
        """Load all required models"""
        try:
            logger.info("Loading NLP models...")
            
            sentiment_analyzer.load_model()
            intent_classifier.load_model()
            hesitation_detector.load_model()
            entity_recognizer.load_model()
            
            self.models_loaded = True
            logger.info("All NLP models loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load NLP models: {e}")
            raise
    
    def process_text(self, text: str) -> Dict[str, Any]:
        """
        Process a single text through the NLP pipeline
        
        Args:
            text: Input text to process
            
        Returns:
            Dictionary with all NLP predictions
        """
        if not self.models_loaded:
            self.load_models()
        
        try:
            logger.debug(f"Processing text: {text[:100]}...")
            
            # Sentiment analysis
            sentiment_result = sentiment_analyzer.predict(text)
            
            # Intent classification
            intent_result = intent_classifier.predict(text)
            
            # Hesitation driver detection
            hesitation_result = hesitation_detector.predict(text)
            
            # Entity recognition
            entities = entity_recognizer.extract_entities(text)
            
            result = {
                'text': text,
                'sentiment': sentiment_result['sentiment'],
                'sentiment_confidence': sentiment_result['confidence'],
                'intent': intent_result['intent'],
                'intent_confidence': intent_result['confidence'],
                'hesitation_driver': hesitation_result['hesitation_driver'],
                'hesitation_confidence': hesitation_result['confidence'],
                'entities': entities,
                'processed_at': datetime.now().isoformat()
            }
            
            logger.debug(f"Text processed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error processing text: {e}")
            return {
                'text': text,
                'sentiment': 'neutral',
                'sentiment_confidence': 0.0,
                'intent': 'research',
                'intent_confidence': 0.0,
                'hesitation_driver': 'fit_sizing',
                'hesitation_confidence': 0.0,
                'entities': [],
                'processed_at': datetime.now().isoformat(),
                'error': str(e)
            }
    
    def process_batch(self, texts: List[str]) -> List[Dict[str, Any]]:
        """
        Process multiple texts through the NLP pipeline
        
        Args:
            texts: List of input texts
            
        Returns:
            List of processed results
        """
        if not self.models_loaded:
            self.load_models()
        
        logger.info(f"Processing batch of {len(texts)} texts")
        
        results = []
        
        try:
            # Batch sentiment analysis
            sentiment_results = sentiment_analyzer.predict_batch(texts)
            
            # Batch intent classification
            intent_results = intent_classifier.predict_batch(texts)
            
            # Batch hesitation detection
            hesitation_results = hesitation_detector.predict_batch(texts)
            
            # Batch entity recognition
            entity_results = entity_recognizer.extract_entities_batch(texts)
            
            # Combine results
            for i, text in enumerate(texts):
                results.append({
                    'text': text,
                    'sentiment': sentiment_results[i]['sentiment'],
                    'sentiment_confidence': sentiment_results[i]['confidence'],
                    'intent': intent_results[i]['intent'],
                    'intent_confidence': intent_results[i]['confidence'],
                    'hesitation_driver': hesitation_results[i]['hesitation_driver'],
                    'hesitation_confidence': hesitation_results[i]['confidence'],
                    'entities': entity_results[i],
                    'processed_at': datetime.now().isoformat()
                })
            
            logger.info(f"Batch processing completed: {len(results)} texts")
            return results
            
        except Exception as e:
            logger.error(f"Error processing batch: {e}")
            # Return neutral predictions for failed batch
            for text in texts:
                results.append({
                    'text': text,
                    'sentiment': 'neutral',
                    'sentiment_confidence': 0.0,
                    'intent': 'research',
                    'intent_confidence': 0.0,
                    'hesitation_driver': 'fit_sizing',
                    'hesitation_confidence': 0.0,
                    'entities': [],
                    'processed_at': datetime.now().isoformat(),
                    'error': str(e)
                })
            return results
    
    def process_conversation(self, conversation_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a conversation item with existing metadata
        
        Args:
            conversation_data: Conversation data with text and metadata
            
        Returns:
            Processed conversation with NLP predictions
        """
        text = conversation_data.get('text', '')
        
        # Process text through pipeline
        nlp_result = self.process_text(text)
        
        # Merge with original data
        result = {
            **conversation_data,
            **nlp_result,
            'processed': True
        }
        
        return result
    
    def process_conversation_batch(self, conversations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Process multiple conversation items
        
        Args:
            conversations: List of conversation data
            
        Returns:
            List of processed conversations
        """
        texts = [conv.get('text', '') for conv in conversations]
        
        # Process batch
        nlp_results = self.process_batch(texts)
        
        # Merge with original data
        results = []
        for i, conversation in enumerate(conversations):
            result = {
                **conversation,
                **nlp_results[i],
                'processed': True
            }
            results.append(result)
        
        return results
    
    def get_pipeline_statistics(self, texts: List[str]) -> Dict[str, Any]:
        """
        Get aggregated statistics for a batch of texts
        
        Args:
            texts: List of input texts
            
        Returns:
            Dictionary with aggregated statistics
        """
        results = self.process_batch(texts)
        
        # Sentiment distribution
        sentiment_counts = {}
        intent_counts = {}
        hesitation_counts = {}
        entity_counts = {}
        
        for result in results:
            # Count sentiments
            sentiment = result['sentiment']
            sentiment_counts[sentiment] = sentiment_counts.get(sentiment, 0) + 1
            
            # Count intents
            intent = result['intent']
            intent_counts[intent] = intent_counts.get(intent, 0) + 1
            
            # Count hesitation drivers
            hesitation = result['hesitation_driver']
            hesitation_counts[hesitation] = hesitation_counts.get(hesitation, 0) + 1
            
            # Count entities
            for entity in result['entities']:
                entity_label = entity['label']
                entity_counts[entity_label] = entity_counts.get(entity_label, 0) + 1
        
        total = len(results)
        
        return {
            'total_processed': total,
            'sentiment_distribution': {
                label: (count / total * 100) if total > 0 else 0
                for label, count in sentiment_counts.items()
            },
            'intent_distribution': {
                label: (count / total * 100) if total > 0 else 0
                for label, count in intent_counts.items()
            },
            'hesitation_distribution': {
                label: (count / total * 100) if total > 0 else 0
                for label, count in hesitation_counts.items()
            },
            'entity_counts': entity_counts,
            'average_confidence': {
                'sentiment': sum(r['sentiment_confidence'] for r in results) / total if total > 0 else 0,
                'intent': sum(r['intent_confidence'] for r in results) / total if total > 0 else 0,
                'hesitation': sum(r['hesitation_confidence'] for r in results) / total if total > 0 else 0
            }
        }


# Global NLP pipeline instance
nlp_pipeline = NLPPipeline()
