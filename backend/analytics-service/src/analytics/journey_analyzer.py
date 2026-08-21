"""
Journey Tracker Analyzer
Analyzes user journey patterns and funnel metrics
"""

from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import logging
import json
from collections import Counter, defaultdict

from ..database.postgres_client import postgres_client
from ..database.mongodb_client import mongodb_client
from ..database.redis_client import redis_client
from ..config.settings import settings

logger = logging.getLogger(__name__)


class JourneyAnalyzer:
    """Journey tracker analyzer"""
    
    JOURNEY_STEPS = [
        'product_view',
        'add_to_wishlist',
        'view_similar_products',
        'read_reviews',
        'add_to_cart',
        'checkout_initiated',
        'checkout_completed',
        'checkout_abandoned'
    ]
    
    def __init__(self):
        """Initialize journey analyzer"""
        self.cache_ttl = settings.cache_ttl
    
    def calculate_journey_tracker(
        self,
        segment_id: Optional[int] = None,
        time_range: str = "30d",
        source: Optional[str] = None,
        sentiment: Optional[str] = None,
        hesitation_driver: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Calculate journey tracker for a segment and time range
        
        Args:
            segment_id: User segment ID (None for all segments)
            time_range: Time range (7d, 30d, 90d)
            source: Data source filter
            sentiment: Sentiment filter
            hesitation_driver: Hesitation driver filter
            
        Returns:
            Dictionary with journey tracker data
        """
        # Check cache first
        cache_key = f"journey_tracker:segment_{segment_id}:time_{time_range}:source_{source}:sent_{sentiment}:hes_{hesitation_driver}"
        cached_result = redis_client.get(cache_key)
        
        if cached_result:
            logger.info(f"Returning cached journey tracker for segment {segment_id}")
            return cached_result
        
        # Calculate date range
        end_date = datetime.now()
        start_date = self._parse_time_range(time_range, end_date)
        
        try:
            # Fetch user journey events from MongoDB
            query = self._build_time_query(start_date, end_date)
            if segment_id:
                query['metadata.segment_id'] = segment_id
            if source:
                query['source'] = source
            if sentiment:
                query['sentiment'] = sentiment
            if hesitation_driver:
                query['hesitation_driver'] = hesitation_driver
            
            events = mongodb_client.find(
                'user_journey_events',
                query,
                limit=50000
            )
            
            if not events:
                logger.warning(f"No journey events found for segment {segment_id}, time range {time_range}")
                return self._get_empty_journey_tracker()
            
            # Calculate journey metrics
            journey_data = self._calculate_journey_from_events(events)
            
            # Store in cache
            redis_client.set(cache_key, journey_data, self.cache_ttl)
            
            logger.info(f"Calculated journey tracker for segment {segment_id}: {len(events)} events")
            return journey_data
            
        except Exception as e:
            logger.error(f"Error calculating journey tracker: {e}")
            return self._get_empty_journey_tracker()
    
    def _parse_time_range(self, time_range: str, end_date: datetime) -> datetime:
        """Parse time range string to start date"""
        days = int(time_range.replace('d', ''))
        return end_date - timedelta(days=days)
    
    def _build_time_query(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Build MongoDB time range query"""
        return {
            'timestamp': {
                '$gte': start_date.isoformat(),
                '$lte': end_date.isoformat()
            }
        }
    
    def _calculate_journey_from_events(self, events: list) -> Dict[str, Any]:
        """Calculate journey metrics from event data"""
        # Group events by session
        session_events = defaultdict(list)
        for event in events:
            session_id = event.get('session_id', 'unknown')
            session_events[session_id].append(event)
        
        # Calculate funnel metrics
        funnel_data = self._calculate_funnel_metrics(session_events)
        
        # Calculate common paths
        common_paths = self._calculate_common_paths(session_events)
        
        # Calculate average time per step
        time_metrics = self._calculate_time_metrics(session_events)
        
        return {
            'funnel_data': funnel_data,
            'common_paths': common_paths,
            'time_metrics': time_metrics,
            'total_sessions': len(session_events),
            'total_events': len(events),
            'calculated_at': datetime.now().isoformat()
        }
    
    def _calculate_funnel_metrics(self, session_events: dict) -> List[Dict[str, Any]]:
        """Calculate funnel metrics for each step"""
        funnel = []
        
        # Count sessions that reached each step
        step_counts = Counter()
        total_sessions = len(session_events)
        
        for session_id, events in session_events.items():
            reached_steps = set()
            for event in events:
                event_type = event.get('event_type')
                if event_type in self.JOURNEY_STEPS:
                    reached_steps.add(event_type)
            
            for step in self.JOURNEY_STEPS:
                if step in reached_steps:
                    step_counts[step] += 1
        
        # Calculate funnel metrics
        previous_count = total_sessions
        for i, step in enumerate(self.JOURNEY_STEPS):
            count = step_counts.get(step, 0)
            percentage = (count / total_sessions * 100) if total_sessions > 0 else 0
            drop_off_rate = ((previous_count - count) / previous_count * 100) if previous_count > 0 else 0
            
            funnel.append({
                'step_name': step,
                'step_order': i + 1,
                'percentage': round(percentage, 2),
                'count': count,
                'drop_off_rate': round(drop_off_rate, 2),
                'cumulative_drop_off': round((1 - percentage / 100) * 100, 2)
            })
            
            previous_count = count
        
        return funnel
    
    def _calculate_common_paths(self, session_events: dict) -> List[Dict[str, Any]]:
        """Calculate most common user paths"""
        paths = []
        
        # Extract paths from sessions
        path_sequences = []
        for session_id, events in session_events.items():
            # Sort events by timestamp
            sorted_events = sorted(events, key=lambda x: x.get('timestamp', ''))
            
            # Extract event types
            path = [event.get('event_type') for event in sorted_events if event.get('event_type') in self.JOURNEY_STEPS]
            if path:
                path_sequences.append(' -> '.join(path))
        
        # Count path frequencies
        path_counts = Counter(path_sequences)
        
        # Get top paths
        for path, count in path_counts.most_common(5):
            paths.append({
                'path': path,
                'count': count,
                'percentage': round((count / len(session_events) * 100), 2)
            })
        
        return paths
    
    def _calculate_time_metrics(self, session_events: dict) -> Dict[str, Any]:
        """Calculate average time spent at each step"""
        step_times = defaultdict(list)
        
        for session_id, events in session_events.items():
            # Sort events by timestamp
            sorted_events = sorted(events, key=lambda x: x.get('timestamp', ''))
            
            # Calculate time between steps
            for i in range(len(sorted_events) - 1):
                current_event = sorted_events[i]
                next_event = sorted_events[i + 1]
                
                try:
                    current_time = datetime.fromisoformat(current_event.get('timestamp', ''))
                    next_time = datetime.fromisoformat(next_event.get('timestamp', ''))
                    time_diff = (next_time - current_time).total_seconds()
                    
                    step = current_event.get('event_type')
                    if step in self.JOURNEY_STEPS:
                        step_times[step].append(time_diff)
                except:
                    continue
        
        # Calculate average times
        avg_times = {}
        for step, times in step_times.items():
            if times:
                avg_times[step] = {
                    'average_seconds': round(sum(times) / len(times), 2),
                    'median_seconds': round(sorted(times)[len(times) // 2], 2),
                    'sample_count': len(times)
                }
        
        return avg_times
    
    def _get_empty_journey_tracker(self) -> Dict[str, Any]:
        """Return empty journey tracker structure"""
        funnel = []
        for i, step in enumerate(self.JOURNEY_STEPS):
            funnel.append({
                'step_name': step,
                'step_order': i + 1,
                'percentage': 0,
                'count': 0,
                'drop_off_rate': 0,
                'cumulative_drop_off': 0
            })
        
        return {
            'funnel_data': funnel,
            'common_paths': [],
            'time_metrics': {},
            'total_sessions': 0,
            'total_events': 0,
            'calculated_at': datetime.now().isoformat()
        }
    
    def store_journey_funnel(
        self,
        journey_data: Dict[str, Any],
        segment_id: Optional[int] = None
    ) -> bool:
        """Store journey funnel to PostgreSQL"""
        try:
            metric_date = datetime.now().date()
            
            for funnel_item in journey_data['funnel_data']:
                query = """
                    INSERT INTO journey_funnel (
                        metric_date, segment_id, step_name, step_order,
                        percentage, drop_off_rate, avg_time_seconds, metadata
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (metric_date, segment_id, step_name)
                    DO UPDATE SET
                        percentage = EXCLUDED.percentage,
                        drop_off_rate = EXCLUDED.drop_off_rate,
                        avg_time_seconds = EXCLUDED.avg_time_seconds,
                        metadata = EXCLUDED.metadata,
                        updated_at = CURRENT_TIMESTAMP
                """
                
                avg_time = journey_data['time_metrics'].get(funnel_item['step_name'], {}).get('average_seconds')
                
                postgres_client.execute_update(
                    query,
                    (
                        metric_date,
                        segment_id,
                        funnel_item['step_name'],
                        funnel_item['step_order'],
                        funnel_item['percentage'],
                        funnel_item['drop_off_rate'],
                        avg_time,
                        json.dumps(funnel_item)
                    )
                )
            
            logger.info(f"Stored journey funnel for segment {segment_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error storing journey funnel: {e}")
            return False
    
    def invalidate_cache(self, segment_id: Optional[int] = None) -> None:
        """Invalidate cache for journey tracker"""
        redis_client.flush_pattern(f"journey_tracker:segment_{segment_id}:*")


# Global journey analyzer instance
journey_analyzer = JourneyAnalyzer()
