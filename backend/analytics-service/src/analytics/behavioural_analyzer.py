"""
Behavioural Analysis
Analyzes shopper behaviour, intent-to-friction patterns, and journey funnel.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import logging
from collections import Counter, defaultdict

from ..database.mongodb_client import mongodb_client
from ..database.redis_client import redis_client
from ..config.settings import settings

logger = logging.getLogger(__name__)


class BehaviouralAnalyzer:
    """Behavioural analysis analyzer"""

    def __init__(self):
        self.cache_ttl = settings.cache_ttl

    def calculate_behavioural_analysis(
        self,
        segment_id: Optional[int] = None,
        time_range: str = "30d",
        source: Optional[str] = None,
        sentiment: Optional[str] = None,
        hesitation_driver: Optional[str] = None
    ) -> Dict[str, Any]:
        """Calculate behavioural analysis for a time range"""

        cache_key = f"behavioural_analysis:segment_{segment_id}:time_{time_range}:source_{source}:sent_{sentiment}:hes_{hesitation_driver}"
        cached = redis_client.get(cache_key)
        if cached:
            return cached

        end_date = datetime.now()
        start_date = self._parse_time_range(time_range, end_date)

        try:
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

            # Journey events are not processed-flagged; filter by time only
            journey_query = {'timestamp': {'$gte': start_date, '$lte': end_date}}
            journey_events = mongodb_client.find(
                'user_journey_events',
                journey_query,
                limit=10000
            )

            if not conversations and not journey_events:
                return self._get_empty_behavioural_analysis()

            data = {
                'summary': self._compute_summary(conversations, journey_events),
                'funnel': self._compute_funnel(journey_events),
                'intent_friction_matrix': self._compute_intent_friction_matrix(conversations),
                'source_conversion_rates': self._compute_source_conversion_rates(conversations),
                'hourly_activity': self._compute_hourly_activity(conversations),
                'top_hesitant_users': self._compute_top_hesitant_users(conversations),
                'sentiment_by_intent': self._compute_sentiment_by_intent(conversations),
                'calculated_at': datetime.now().isoformat()
            }

            redis_client.set(cache_key, data, self.cache_ttl)
            return data

        except Exception as e:
            logger.error(f"Error calculating behavioural analysis: {e}")
            return self._get_empty_behavioural_analysis()

    def _parse_time_range(self, time_range: str, end_date: datetime) -> datetime:
        days = int(time_range.replace('d', ''))
        return end_date - timedelta(days=days)

    def _build_time_query(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        return {
            'timestamp': {'$gte': start_date, '$lte': end_date},
            'processed': True
        }

    def _compute_summary(self, conversations: List[Dict], journey_events: List[Dict]) -> Dict[str, Any]:
        total_signals = len(conversations)
        active_users = len({c.get('author') for c in conversations if c.get('author')})

        sessions = defaultdict(list)
        for ev in journey_events:
            sessions[ev.get('session_id', 'unknown')].append(ev.get('event_type'))

        total_sessions = len(sessions)
        total_events = len(journey_events)
        avg_actions = round(total_events / total_sessions, 2) if total_sessions > 0 else 0
        bounce_sessions = sum(1 for steps in sessions.values() if len(set(steps)) <= 1)
        bounce_rate = round((bounce_sessions / total_sessions) * 100, 2) if total_sessions > 0 else 0
        converted_sessions = sum(
            1 for steps in sessions.values() if 'checkout_completed' in steps
        )
        conversion_rate = round((converted_sessions / total_sessions) * 100, 2) if total_sessions > 0 else 0

        immediate = sum(1 for c in conversations if c.get('intent') == 'immediate_purchase')
        research = sum(1 for c in conversations if c.get('intent') == 'research')
        purchase_intent_rate = round((immediate / total_signals) * 100, 2) if total_signals > 0 else 0
        research_rate = round((research / total_signals) * 100, 2) if total_signals > 0 else 0

        return {
            'total_signals': total_signals,
            'active_users': active_users,
            'avg_signals_per_user': round(total_signals / active_users, 2) if active_users > 0 else 0,
            'total_sessions': total_sessions,
            'total_events': total_events,
            'avg_actions_per_session': avg_actions,
            'bounce_rate': bounce_rate,
            'conversion_rate': conversion_rate,
            'purchase_intent_rate': purchase_intent_rate,
            'research_rate': research_rate
        }

    def _compute_funnel(self, journey_events: List[Dict]) -> List[Dict[str, Any]]:
        steps = [
            'product_view',
            'add_to_wishlist',
            'view_similar_products',
            'read_reviews',
            'add_to_cart',
            'checkout_initiated',
            'checkout_completed'
        ]

        sessions = defaultdict(set)
        for ev in journey_events:
            sessions[ev.get('session_id', 'unknown')].add(ev.get('event_type'))

        counts = []
        for step in steps:
            count = sum(1 for s in sessions.values() if step in s)
            counts.append({'step': step, 'count': count})

        total = counts[0]['count'] if counts else 0
        for item in counts:
            item['percentage'] = round((item['count'] / total) * 100, 2) if total > 0 else 0

        return counts

    def _compute_intent_friction_matrix(self, conversations: List[Dict]) -> List[Dict[str, Any]]:
        matrix = defaultdict(lambda: defaultdict(int))
        for c in conversations:
            intent = c.get('intent') or 'unknown'
            friction = c.get('hesitation_driver') or 'unknown'
            matrix[intent][friction] += 1

        results = []
        for intent, frictions in matrix.items():
            for friction, count in frictions.items():
                results.append({'intent': intent, 'friction': friction, 'count': count})

        return sorted(results, key=lambda x: -x['count'])[:50]

    def _compute_source_conversion_rates(self, conversations: List[Dict]) -> List[Dict[str, Any]]:
        by_source = defaultdict(lambda: {'total': 0, 'immediate_purchase': 0})
        for c in conversations:
            src = c.get('source') or 'unknown'
            by_source[src]['total'] += 1
            if c.get('intent') == 'immediate_purchase':
                by_source[src]['immediate_purchase'] += 1

        results = []
        for src, data in by_source.items():
            conversion = round((data['immediate_purchase'] / data['total']) * 100, 2) if data['total'] > 0 else 0
            results.append({
                'source': src,
                'total': data['total'],
                'immediate_purchase': data['immediate_purchase'],
                'conversion_rate': conversion
            })

        return sorted(results, key=lambda x: -x['conversion_rate'])

    def _compute_hourly_activity(self, conversations: List[Dict]) -> List[Dict[str, Any]]:
        hours = defaultdict(int)
        for c in conversations:
            ts = c.get('timestamp')
            if isinstance(ts, datetime):
                hours[ts.hour] += 1
            elif isinstance(ts, str):
                try:
                    hours[int(ts[11:13])] += 1
                except (ValueError, IndexError):
                    continue

        return [{'hour': h, 'count': hours[h]} for h in range(24) if hours[h] > 0]

    def _compute_top_hesitant_users(self, conversations: List[Dict]) -> List[Dict[str, Any]]:
        users = defaultdict(lambda: {'count': 0, 'frictions': Counter()})
        for c in conversations:
            author = c.get('author')
            if not author:
                continue
            users[author]['count'] += 1
            users[author]['frictions'][c.get('hesitation_driver') or 'unknown'] += 1

        results = []
        for author, data in users.items():
            top_friction = data['frictions'].most_common(1)[0][0] if data['frictions'] else 'unknown'
            results.append({'author': author, 'count': data['count'], 'top_friction': top_friction})

        return sorted(results, key=lambda x: -x['count'])[:10]

    def _compute_sentiment_by_intent(self, conversations: List[Dict]) -> List[Dict[str, Any]]:
        matrix = defaultdict(lambda: Counter())
        for c in conversations:
            intent = c.get('intent') or 'unknown'
            sentiment = c.get('sentiment') or 'unknown'
            matrix[intent][sentiment] += 1

        results = []
        for intent, sentiments in matrix.items():
            row = {'intent': intent}
            total = sum(sentiments.values())
            for s in ['positive', 'neutral', 'negative']:
                row[s] = sentiments.get(s, 0)
                row[f'{s}_pct'] = round((sentiments.get(s, 0) / total) * 100, 2) if total > 0 else 0
            results.append(row)

        return results

    def _get_empty_behavioural_analysis(self) -> Dict[str, Any]:
        return {
            'summary': {
                'total_signals': 0,
                'active_users': 0,
                'avg_signals_per_user': 0,
                'total_sessions': 0,
                'total_events': 0,
                'avg_actions_per_session': 0,
                'bounce_rate': 0,
                'conversion_rate': 0,
                'purchase_intent_rate': 0,
                'research_rate': 0
            },
            'funnel': [],
            'intent_friction_matrix': [],
            'source_conversion_rates': [],
            'hourly_activity': [],
            'top_hesitant_users': [],
            'sentiment_by_intent': [],
            'calculated_at': datetime.now().isoformat()
        }


behavioural_analyzer = BehaviouralAnalyzer()
