"""
Friction Breakdown Analyzer
Analyzes friction points in the user journey
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


class FrictionAnalyzer:
    """Friction breakdown analyzer"""
    
    FRICTION_TYPES = ['fit_sizing', 'styling_wardrobe', 'social_validation', 'visual_reality', 'price_value', 'wishlist_styling']
    FRICTION_COLORS = {
        'fit_sizing': '#ff3f6c',
        'styling_wardrobe': '#ff905a',
        'social_validation': '#282c3f',
        'visual_reality': '#535766',
        'price_value': '#eaeaec',
        'wishlist_styling': '#9333ea'
    }
    
    def __init__(self):
        """Initialize friction analyzer"""
        self.cache_ttl = settings.cache_ttl
    
    def calculate_friction_breakdown(
        self,
        segment_id: Optional[int] = None,
        time_range: str = "30d",
        source: Optional[str] = None,
        sentiment: Optional[str] = None,
        hesitation_driver: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate friction breakdown for a segment and time range
        
        Args:
            segment_id: User segment ID (None for all segments)
            time_range: Time range (7d, 30d, 90d)
            source: Data source filter
            sentiment: Sentiment filter
            hesitation_driver: Hesitation driver filter
            
        Returns:
            Dictionary with friction breakdown
        """
        # Check cache first
        cache_key = f"friction_breakdown:segment_{segment_id}:time_{time_range}:source_{source}:sent_{sentiment}:hes_{hesitation_driver}"
        cached_result = redis_client.get(cache_key)
        
        if cached_result:
            logger.info(f"Returning cached friction breakdown for segment {segment_id}")
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
                return self._get_empty_friction_breakdown()
            
            # Calculate friction breakdown
            friction_data = self._calculate_friction_from_conversations(conversations)
            
            # Store in cache
            redis_client.set(cache_key, friction_data, self.cache_ttl)
            
            logger.info(f"Calculated friction breakdown for segment {segment_id}: {len(conversations)} conversations")
            return friction_data
            
        except Exception as e:
            logger.error(f"Error calculating friction breakdown: {e}")
            return self._get_empty_friction_breakdown()
    
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
    
    def _calculate_friction_from_conversations(self, conversations: list) -> Dict[str, Any]:
        """Calculate friction breakdown from conversation data"""
        total_signals = len(conversations)
        
        # Count hesitation drivers
        hesitation_drivers = [conv.get('hesitation_driver', 'fit_sizing') for conv in conversations]
        hesitation_counts = Counter(hesitation_drivers)
        
        # Calculate friction breakdown
        friction_types = []
        total_count = sum(hesitation_counts.values())
        
        for friction_type in self.FRICTION_TYPES:
            count = hesitation_counts.get(friction_type, 0)
            percentage = (count / total_signals * 100) if total_signals > 0 else 0
            
            # Determine trend (simplified - would need historical data for real trend)
            trend = 'neutral'
            
            friction_types.append({
                'name': friction_type,
                'percentage': round(percentage, 2),
                'count': count,
                'trend': trend,
                'color': self.FRICTION_COLORS.get(friction_type, '#eaeaec'),
                'sample_count': count
            })
        
        # Sort by percentage descending
        friction_types.sort(key=lambda x: x['percentage'], reverse=True)
        
        return {
            'friction_types': friction_types,
            'total_signals': total_signals,
            'dominant_friction': friction_types[0]['name'] if friction_types else 'fit_sizing',
            'dominant_percentage': friction_types[0]['percentage'] if friction_types else 0,
            'calculated_at': datetime.now().isoformat()
        }
    
    def _get_empty_friction_breakdown(self) -> Dict[str, Any]:
        """Return empty friction breakdown structure"""
        friction_types = []
        for friction_type in self.FRICTION_TYPES:
            friction_types.append({
                'name': friction_type,
                'percentage': 0,
                'count': 0,
                'trend': 'neutral',
                'color': self.FRICTION_COLORS.get(friction_type, '#eaeaec'),
                'sample_count': 0
            })
        
        return {
            'friction_types': friction_types,
            'total_signals': 0,
            'dominant_friction': 'fit_sizing',
            'dominant_percentage': 0,
            'calculated_at': datetime.now().isoformat()
        }
    
    def store_friction_breakdown(
        self,
        friction_data: Dict[str, Any],
        segment_id: Optional[int] = None
    ) -> bool:
        """Store friction breakdown to PostgreSQL"""
        try:
            metric_date = datetime.now().date()
            
            for friction_type in friction_data['friction_types']:
                query = """
                    INSERT INTO friction_breakdown (
                        metric_date, segment_id, friction_type, percentage,
                        trend, sample_count, metadata
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (metric_date, segment_id, friction_type)
                    DO UPDATE SET
                        percentage = EXCLUDED.percentage,
                        trend = EXCLUDED.trend,
                        sample_count = EXCLUDED.sample_count,
                        metadata = EXCLUDED.metadata,
                        updated_at = CURRENT_TIMESTAMP
                """
                
                postgres_client.execute_update(
                    query,
                    (
                        metric_date,
                        segment_id,
                        friction_type['name'],
                        friction_type['percentage'],
                        friction_type['trend'],
                        friction_type['sample_count'],
                        json.dumps(friction_type)
                    )
                )
            
            logger.info(f"Stored friction breakdown for segment {segment_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error storing friction breakdown: {e}")
            return False
    
    def get_friction_trend(
        self,
        friction_type: str,
        segment_id: Optional[int] = None,
        days: int = 7
    ) -> List[Dict[str, Any]]:
        """
        Get historical trend for a specific friction type
        
        Args:
            friction_type: Type of friction
            segment_id: User segment ID
            days: Number of days of history
            
        Returns:
            List of historical data points
        """
        try:
            query = """
                SELECT metric_date, percentage, trend, sample_count
                FROM friction_breakdown
                WHERE friction_type = %s
                AND (%s IS NULL OR segment_id = %s)
                AND metric_date >= CURRENT_DATE - INTERVAL '%s days'
                ORDER BY metric_date ASC
            """
            
            results = postgres_client.execute_query(
                query,
                (friction_type, segment_id, segment_id, days)
            )
            
            return [
                {
                    'date': row['metric_date'].isoformat(),
                    'percentage': row['percentage'],
                    'trend': row['trend'],
                    'sample_count': row['sample_count']
                }
                for row in results
            ]
            
        except Exception as e:
            logger.error(f"Error getting friction trend: {e}")
            return []
    
    def invalidate_cache(self, segment_id: Optional[int] = None) -> None:
        """Invalidate cache for friction breakdown"""
        redis_client.flush_pattern(f"friction_breakdown:segment_{segment_id}:*")


# Global friction analyzer instance
friction_analyzer = FrictionAnalyzer()
