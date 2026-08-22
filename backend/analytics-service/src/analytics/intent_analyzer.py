"""
Intent Matrix Analyzer
Analyzes user intent patterns across segments
"""

from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import logging
import json
from collections import Counter

from ..database.postgres_client import postgres_client
from ..database.mongodb_client import mongodb_client
from ..database.redis_client import redis_client
from ..config.settings import settings

logger = logging.getLogger(__name__)


class IntentAnalyzer:
    """Intent matrix analyzer"""
    
    INTENT_TYPES = ['bookmarking', 'immediate_purchase', 'research', 'comparison']
    
    def __init__(self):
        """Initialize intent analyzer"""
        self.cache_ttl = settings.cache_ttl
    
    def calculate_intent_matrix(
        self,
        segment_id: Optional[int] = None,
        time_range: str = "30d",
        source: Optional[str] = None,
        sentiment: Optional[str] = None,
        hesitation_driver: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate intent matrix for a segment and time range
        
        Args:
            segment_id: User segment ID (None for all segments)
            time_range: Time range (7d, 30d, 90d)
            source: Data source filter
            sentiment: Sentiment filter
            hesitation_driver: Hesitation driver filter
            
        Returns:
            Dictionary with intent matrix data
        """
        # Check cache first
        cache_key = f"intent_matrix:segment_{segment_id}:time_{time_range}:source_{source}:sent_{sentiment}:hes_{hesitation_driver}"
        cached_result = redis_client.get(cache_key)
        
        if cached_result:
            logger.info(f"Returning cached intent matrix for segment {segment_id}")
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
                return self._get_empty_intent_matrix()
            
            # Calculate intent matrix
            intent_data = self._calculate_intent_from_conversations(conversations)
            
            # Store in cache
            redis_client.set(cache_key, intent_data, self.cache_ttl)
            
            logger.info(f"Calculated intent matrix for segment {segment_id}: {len(conversations)} conversations")
            return intent_data
            
        except Exception as e:
            logger.error(f"Error calculating intent matrix: {e}")
            return self._get_empty_intent_matrix()
    
    def _parse_time_range(self, time_range: str, end_date: datetime) -> datetime:
        """Parse time range string to start date"""
        days = int(time_range.replace('d', ''))
        return end_date - timedelta(days=days)
    
    def _build_time_query(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Build MongoDB time range query"""
        return {
            'timestamp': {
                '$gte': start_date,
                '$lte': end_date
            },
            'processed': True
        }
    
    def _calculate_intent_from_conversations(self, conversations: list) -> Dict[str, Any]:
        """Calculate intent matrix from conversation data"""
        total_signals = len(conversations)
        
        # Count intents
        intents = [conv.get('intent', 'research') for conv in conversations]
        intent_counts = Counter(intents)
        
        # Calculate intent distribution
        intent_distribution = []
        for intent_type in self.INTENT_TYPES:
            count = intent_counts.get(intent_type, 0)
            percentage = (count / total_signals * 100) if total_signals > 0 else 0
            
            intent_distribution.append({
                'intent_type': intent_type,
                'percentage': round(percentage, 2),
                'count': count
            })
        
        # Calculate radar data for visualization
        radar_data = self._calculate_radar_data(conversations)
        
        return {
            'intent_distribution': intent_distribution,
            'radar_data': radar_data,
            'total_signals': total_signals,
            'dominant_intent': intent_distribution[0]['intent_type'] if intent_distribution else 'research',
            'dominant_percentage': intent_distribution[0]['percentage'] if intent_distribution else 0,
            'calculated_at': datetime.now().isoformat()
        }
    
    def _calculate_radar_data(self, conversations: list) -> List[Dict[str, Any]]:
        """Calculate radar chart data for intent visualization"""
        # Group by segment if available
        segment_intents = {}
        
        for conv in conversations:
            segment = conv.get('metadata', {}).get('segment_id', 'all')
            intent = conv.get('intent', 'research')
            
            if segment not in segment_intents:
                segment_intents[segment] = Counter()
            segment_intents[segment][intent] += 1
        
        # Calculate percentages per segment
        radar_data = []
        for segment, intent_counts in segment_intents.items():
            total = sum(intent_counts.values())
            
            bookmarking_pct = (intent_counts.get('bookmarking', 0) / total * 100) if total > 0 else 0
            purchase_pct = (intent_counts.get('immediate_purchase', 0) / total * 100) if total > 0 else 0
            
            radar_data.append({
                'subject': f"Segment {segment}" if segment != 'all' else 'All Users',
                'active_intent': round(bookmarking_pct, 2),
                'passive_bookmarking': round(purchase_pct, 2)
            })
        
        return radar_data
    
    def _get_empty_intent_matrix(self) -> Dict[str, Any]:
        """Return empty intent matrix structure"""
        intent_distribution = []
        for intent_type in self.INTENT_TYPES:
            intent_distribution.append({
                'intent_type': intent_type,
                'percentage': 0,
                'count': 0
            })
        
        return {
            'intent_distribution': intent_distribution,
            'radar_data': [],
            'total_signals': 0,
            'dominant_intent': 'research',
            'dominant_percentage': 0,
            'calculated_at': datetime.now().isoformat()
        }
    
    def store_intent_classification(
        self,
        intent_data: Dict[str, Any],
        segment_id: Optional[int] = None
    ) -> bool:
        """Store intent classification to PostgreSQL"""
        try:
            metric_date = datetime.now().date()
            
            for intent_item in intent_data['intent_distribution']:
                query = """
                    INSERT INTO intent_classification (
                        metric_date, segment_id, intent_type, percentage,
                        confidence_score, metadata
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (metric_date, segment_id, intent_type)
                    DO UPDATE SET
                        percentage = EXCLUDED.percentage,
                        confidence_score = EXCLUDED.confidence_score,
                        metadata = EXCLUDED.metadata,
                        updated_at = CURRENT_TIMESTAMP
                """
                
                postgres_client.execute_update(
                    query,
                    (
                        metric_date,
                        segment_id,
                        intent_item['intent_type'],
                        intent_item['percentage'],
                        0.85,  # Default confidence score
                        json.dumps(intent_item)
                    )
                )
            
            logger.info(f"Stored intent classification for segment {segment_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error storing intent classification: {e}")
            return False
    
    def get_intent_trend(
        self,
        intent_type: str,
        segment_id: Optional[int] = None,
        days: int = 7
    ) -> List[Dict[str, Any]]:
        """
        Get historical trend for a specific intent type
        
        Args:
            intent_type: Type of intent
            segment_id: User segment ID
            days: Number of days of history
            
        Returns:
            List of historical data points
        """
        try:
            query = """
                SELECT metric_date, percentage, confidence_score
                FROM intent_classification
                WHERE intent_type = %s
                AND (%s IS NULL OR segment_id = %s)
                AND metric_date >= CURRENT_DATE - INTERVAL '%s days'
                ORDER BY metric_date ASC
            """
            
            results = postgres_client.execute_query(
                query,
                (intent_type, segment_id, segment_id, days)
            )
            
            return [
                {
                    'date': row['metric_date'].isoformat(),
                    'percentage': row['percentage'],
                    'confidence_score': row['confidence_score']
                }
                for row in results
            ]
            
        except Exception as e:
            logger.error(f"Error getting intent trend: {e}")
            return []
    
    def invalidate_cache(self, segment_id: Optional[int] = None) -> None:
        """Invalidate cache for intent matrix"""
        redis_client.flush_pattern(f"intent_matrix:segment_{segment_id}:*")


# Global intent analyzer instance
intent_analyzer = IntentAnalyzer()
