"""
KPI Metrics Calculator
Calculates key performance indicators from processed conversation data
"""

from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import logging
import json
from collections import Counter

from ..database.postgres_client import postgres_client
from ..database.mongodb_client import mongodb_client
from ..database.redis_client import redis_client
from ..config.settings import settings

logger = logging.getLogger(__name__)


class KPICalculator:
    """KPI metrics calculator"""
    
    def __init__(self):
        """Initialize KPI calculator"""
        self.cache_ttl = settings.cache_ttl
    
    def calculate_kpi_metrics(
        self,
        segment_id: Optional[int] = None,
        time_range: str = "30d",
        source: Optional[str] = None,
        sentiment: Optional[str] = None,
        hesitation_driver: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate KPI metrics for a segment and time range
        
        Args:
            segment_id: User segment ID (None for all segments)
            time_range: Time range (7d, 30d, 90d)
            source: Data source filter (appstore, youtube, reddit)
            sentiment: Sentiment filter (positive, neutral, negative)
            hesitation_driver: Hesitation driver filter
            
        Returns:
            Dictionary with KPI metrics
        """
        # Check cache first
        cache_key = f"kpi_metrics:segment_{segment_id}:time_{time_range}:source_{source}:sent_{sentiment}:hes_{hesitation_driver}"
        cached_result = redis_client.get(cache_key)
        
        if cached_result:
            logger.info(f"Returning cached KPI metrics for segment {segment_id}")
            return cached_result
        
        # Calculate date range
        end_date = datetime.now()
        start_date = self._parse_time_range(time_range, end_date)
        
        try:
            # Fetch processed conversations from MongoDB
            query = self._build_time_query(start_date, end_date)
            if segment_id:
                query['metadata.segment_id'] = segment_id
            if source:
                query['source'] = source
            if sentiment:
                query['sentiment'] = sentiment
            if hesitation_driver:
                query['hesitation_driver'] = hesitation_driver
            
            conversations = mongodb_client.find(
                'raw_conversations',
                query,
                limit=10000
            )
            
            if not conversations:
                logger.warning(f"No conversations found for segment {segment_id}, time range {time_range}")
                return self._get_empty_kpi_metrics()
            
            # Calculate metrics
            metrics = self._calculate_metrics_from_conversations(conversations)
            
            # Store in cache
            redis_client.set(cache_key, metrics, self.cache_ttl)
            
            logger.info(f"Calculated KPI metrics for segment {segment_id}: {len(conversations)} conversations")
            return metrics
            
        except Exception as e:
            logger.error(f"Error calculating KPI metrics: {e}")
            return self._get_empty_kpi_metrics()
    
    def _parse_time_range(self, time_range: str, end_date: datetime) -> datetime:
        """
        Parse time range string to start date
        
        Args:
            time_range: Time range string (7d, 30d, 90d)
            end_date: End date
            
        Returns:
            Start date
        """
        days = int(time_range.replace('d', ''))
        return end_date - timedelta(days=days)
    
    def _build_time_query(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """
        Build MongoDB time range query
        
        Args:
            start_date: Start date
            end_date: End date
            
        Returns:
            MongoDB query
        """
        return {
            'timestamp': {
                '$gte': start_date.isoformat(),
                '$lte': end_date.isoformat()
            },
            'processed': True
        }
    
    def _calculate_metrics_from_conversations(self, conversations: list) -> Dict[str, Any]:
        """
        Calculate metrics from conversation data
        
        Args:
            conversations: List of processed conversations
            
        Returns:
            Dictionary with KPI metrics
        """
        total_signals = len(conversations)
        
        # Count sentiments
        sentiments = [conv.get('sentiment', 'neutral') for conv in conversations]
        sentiment_counts = Counter(sentiments)
        
        # Count intents
        intents = [conv.get('intent', 'research') for conv in conversations]
        intent_counts = Counter(intents)
        
        # Count hesitation drivers
        hesitation_drivers = [conv.get('hesitation_driver', 'fit_sizing') for conv in conversations]
        hesitation_counts = Counter(hesitation_drivers)
        
        # Calculate bookmarking vs immediate purchase intent
        bookmarking_count = intent_counts.get('bookmarking', 0)
        immediate_purchase_count = intent_counts.get('immediate_purchase', 0)
        total_intent = bookmarking_count + immediate_purchase_count
        
        if total_intent > 0:
            bookmarking_intent = (bookmarking_count / total_intent) * 100
            immediate_purchase_intent = (immediate_purchase_count / total_intent) * 100
        else:
            bookmarking_intent = 0
            immediate_purchase_intent = 0
        
        # Find primary hesitation driver
        if hesitation_counts:
            primary_hesitation_driver = hesitation_counts.most_common(1)[0][0]
            primary_hesitation_percentage = (hesitation_counts[primary_hesitation_driver] / total_signals) * 100
        else:
            primary_hesitation_driver = 'fit_sizing'
            primary_hesitation_percentage = 0
        
        # Calculate information leakage ratio (negative sentiment with purchase intent)
        information_leakage = self._calculate_information_leakage(conversations)
        
        return {
            'total_signals': total_signals,
            'bookmarking_intent': round(bookmarking_intent, 2),
            'immediate_purchase_intent': round(immediate_purchase_intent, 2),
            'primary_hesitation_driver': primary_hesitation_driver,
            'primary_hesitation_percentage': round(primary_hesitation_percentage, 2),
            'information_leakage': round(information_leakage, 2),
            'sentiment_distribution': {
                'positive': sentiment_counts.get('positive', 0),
                'neutral': sentiment_counts.get('neutral', 0),
                'negative': sentiment_counts.get('negative', 0)
            },
            'intent_distribution': dict(intent_counts),
            'hesitation_distribution': dict(hesitation_counts),
            'calculated_at': datetime.now().isoformat()
        }
    
    def _calculate_information_leakage(self, conversations: list) -> float:
        """
        Calculate information leakage ratio
        Ratio of negative sentiment with purchase intent
        
        Args:
            conversations: List of processed conversations
            
        Returns:
            Information leakage percentage
        """
        negative_purchase = 0
        total_negative = 0
        
        for conv in conversations:
            if conv.get('sentiment') == 'negative':
                total_negative += 1
                if conv.get('intent') == 'immediate_purchase':
                    negative_purchase += 1
        
        if total_negative > 0:
            return (negative_purchase / total_negative) * 100
        return 0
    
    def _get_empty_kpi_metrics(self) -> Dict[str, Any]:
        """Return empty KPI metrics structure"""
        return {
            'total_signals': 0,
            'bookmarking_intent': 0,
            'immediate_purchase_intent': 0,
            'primary_hesitation_driver': 'fit_sizing',
            'primary_hesitation_percentage': 0,
            'information_leakage': 0,
            'sentiment_distribution': {
                'positive': 0,
                'neutral': 0,
                'negative': 0
            },
            'intent_distribution': {},
            'hesitation_distribution': {},
            'calculated_at': datetime.now().isoformat()
        }
    
    def store_kpi_metrics(self, metrics: Dict[str, Any], segment_id: Optional[int] = None) -> bool:
        """
        Store KPI metrics to PostgreSQL
        
        Args:
            metrics: KPI metrics dictionary
            segment_id: User segment ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            query = """
                INSERT INTO kpi_metrics (
                    metric_date, segment_id, total_signals, 
                    bookmarking_intent, immediate_purchase_intent,
                    primary_hesitation_driver, primary_hesitation_percentage,
                    information_leakage, metadata
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (metric_date, segment_id) 
                DO UPDATE SET
                    total_signals = EXCLUDED.total_signals,
                    bookmarking_intent = EXCLUDED.bookmarking_intent,
                    immediate_purchase_intent = EXCLUDED.immediate_purchase_intent,
                    primary_hesitation_driver = EXCLUDED.primary_hesitation_driver,
                    primary_hesitation_percentage = EXCLUDED.primary_hesitation_percentage,
                    information_leakage = EXCLUDED.information_leakage,
                    metadata = EXCLUDED.metadata,
                    updated_at = CURRENT_TIMESTAMP
            """
            
            metric_date = datetime.now().date()
            metadata = {
                'sentiment_distribution': metrics.get('sentiment_distribution'),
                'intent_distribution': metrics.get('intent_distribution'),
                'hesitation_distribution': metrics.get('hesitation_distribution')
            }
            
            postgres_client.execute_update(
                query,
                (
                    metric_date,
                    segment_id,
                    metrics['total_signals'],
                    metrics['bookmarking_intent'],
                    metrics['immediate_purchase_intent'],
                    metrics['primary_hesitation_driver'],
                    metrics['primary_hesitation_percentage'],
                    metrics['information_leakage'],
                    json.dumps(metadata)
                )
            )
            
            logger.info(f"Stored KPI metrics for segment {segment_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error storing KPI metrics: {e}")
            return False
    
    def invalidate_cache(self, segment_id: Optional[int] = None) -> None:
        """Invalidate cache for KPI metrics"""
        redis_client.flush_pattern(f"kpi_metrics:segment_{segment_id}:*")


# Global KPI calculator instance
kpi_calculator = KPICalculator()
