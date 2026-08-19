"""
Opportunity Matrix Analyzer
Calculates and prioritizes improvement opportunities
"""

from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import logging
import json
import math

from ..database.postgres_client import postgres_client
from ..database.mongodb_client import mongodb_client
from ..database.redis_client import redis_client
from ..config.settings import settings

logger = logging.getLogger(__name__)


class OpportunityAnalyzer:
    """Opportunity matrix analyzer"""
    
    QUADRANTS = {
        'quick_wins': {'effort_range': (1, 4), 'lift_range': (7, 10)},
        'major_projects': {'effort_range': (5, 7), 'lift_range': (7, 10)},
        'strategic_bets': {'effort_range': (8, 10), 'lift_range': (7, 10)},
        'fill_ins': {'effort_range': (1, 10), 'lift_range': (1, 6)}
    }
    
    def __init__(self):
        """Initialize opportunity analyzer"""
        self.cache_ttl = settings.cache_ttl
    
    def calculate_opportunity_matrix(
        self,
        time_range: str = "30d"
    ) -> Dict[str, Any]:
        """
        Calculate opportunity matrix based on friction and impact analysis
        
        Args:
            time_range: Time range (7d, 30d, 90d)
            
        Returns:
            Dictionary with opportunity matrix data
        """
        # Check cache first
        cache_key = f"opportunity_matrix:time_{time_range}"
        cached_result = redis_client.get(cache_key)
        
        if cached_result:
            logger.info(f"Returning cached opportunity matrix")
            return cached_result
        
        try:
            # Get friction breakdown data
            from .friction_analyzer import friction_analyzer
            friction_data = friction_analyzer.calculate_friction_breakdown(
                segment_id=None,
                time_range=time_range
            )
            
            # Get KPI metrics
            from .kpi_calculator import kpi_calculator
            kpi_data = kpi_calculator.calculate_kpi_metrics(
                segment_id=None,
                time_range=time_range
            )
            
            # Calculate opportunities
            opportunities = self._generate_opportunities(friction_data, kpi_data)
            
            # Calculate matrix data
            matrix_data = self._calculate_matrix_data(opportunities)
            
            result = {
                'opportunities': opportunities,
                'matrix_data': matrix_data,
                'total_opportunities': len(opportunities),
                'calculated_at': datetime.now().isoformat()
            }
            
            # Store in cache
            redis_client.set(cache_key, result, self.cache_ttl)
            
            logger.info(f"Calculated opportunity matrix: {len(opportunities)} opportunities")
            return result
            
        except Exception as e:
            logger.error(f"Error calculating opportunity matrix: {e}")
            return self._get_empty_opportunity_matrix()
    
    def _generate_opportunities(
        self,
        friction_data: Dict[str, Any],
        kpi_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate opportunity items from friction and KPI data"""
        opportunities = []
        
        # Predefined opportunity templates based on friction types
        opportunity_templates = {
            'fit_sizing': [
                {
                    'name': 'Improve size guide accuracy',
                    'description': 'Enhance size charts with measurements and fit recommendations',
                    'base_effort': 4,
                    'base_lift': 8
                },
                {
                    'name': 'Implement virtual try-on',
                    'description': 'AR-based virtual fitting room experience',
                    'base_effort': 8,
                    'base_lift': 9
                },
                {
                    'name': 'Add user-generated fit photos',
                    'description': 'Show real customer photos with size information',
                    'base_effort': 6,
                    'base_lift': 7
                }
            ],
            'styling_wardrobe': [
                {
                    'name': 'Style recommendation engine',
                    'description': 'AI-powered outfit suggestions based on user preferences',
                    'base_effort': 9,
                    'base_lift': 8
                },
                {
                    'name': 'Wardrobe integration',
                    'description': 'Allow users to build virtual wardrobes',
                    'base_effort': 7,
                    'base_lift': 6
                },
                {
                    'name': 'Style guides and lookbooks',
                    'description': 'Curated styling content for different occasions',
                    'base_effort': 3,
                    'base_lift': 5
                }
            ],
            'social_validation': [
                {
                    'name': 'Social proof integration',
                    'description': 'Show friend activity and reviews prominently',
                    'base_effort': 5,
                    'base_lift': 6
                },
                {
                    'name': 'Community features',
                    'description': 'User forums and style sharing platforms',
                    'base_effort': 7,
                    'base_lift': 7
                },
                {
                    'name': 'Influencer collaborations',
                    'description': 'Partner with fashion influencers for content',
                    'base_effort': 6,
                    'base_lift': 8
                }
            ],
            'visual_reality': [
                {
                    'name': 'Enhanced product photography',
                    'description': '360-degree views and lifestyle imagery',
                    'base_effort': 5,
                    'base_lift': 7
                },
                {
                    'name': 'Video content integration',
                    'description': 'Product videos and try-on demonstrations',
                    'base_effort': 4,
                    'base_lift': 6
                },
                {
                    'name': 'AR visualization',
                    'description': 'Augmented reality product visualization',
                    'base_effort': 8,
                    'base_lift': 9
                }
            ],
            'price_value': [
                {
                    'name': 'Price comparison feature',
                    'description': 'Show competitive pricing and value propositions',
                    'base_effort': 7,
                    'base_lift': 4
                },
                {
                    'name': 'Dynamic pricing insights',
                    'description': 'Price history and discount notifications',
                    'base_effort': 5,
                    'base_lift': 5
                },
                {
                    'name': 'Value-based recommendations',
                    'description': 'Highlight best value products and deals',
                    'base_effort': 3,
                    'base_lift': 4
                }
            ]
        }
        
        # Generate opportunities based on friction distribution
        for friction_type in friction_data['friction_types']:
            friction_name = friction_type['name']
            friction_percentage = friction_type['percentage']
            
            if friction_name in opportunity_templates:
                for template in opportunity_templates[friction_name]:
                    # Adjust effort and lift based on friction percentage
                    effort_multiplier = 1 + (friction_percentage / 100)
                    lift_multiplier = 1 + (friction_percentage / 100)
                    
                    effort = min(10, int(template['base_effort'] * effort_multiplier))
                    lift = min(10, int(template['base_lift'] * lift_multiplier))
                    
                    # Calculate priority score
                    priority_score = (lift * 0.7) - (effort * 0.3)
                    
                    # Determine quadrant
                    quadrant = self._determine_quadrant(effort, lift)
                    
                    # Estimate impact (simplified calculation)
                    estimated_impact = (lift * friction_percentage * 10000) / 100
                    
                    opportunities.append({
                        'opportunity_name': template['name'],
                        'description': template['description'],
                        'effort_score': effort,
                        'lift_score': lift,
                        'quadrant': quadrant,
                        'priority_score': round(priority_score, 2),
                        'estimated_impact': round(estimated_impact, 2),
                        'related_friction': friction_name,
                        'friction_percentage': friction_percentage
                    })
        
        # Sort by priority score descending
        opportunities.sort(key=lambda x: x['priority_score'], reverse=True)
        
        return opportunities
    
    def _determine_quadrant(self, effort: int, lift: int) -> str:
        """Determine which quadrant an opportunity falls into"""
        for quadrant, ranges in self.QUADRANTS.items():
            effort_min, effort_max = ranges['effort_range']
            lift_min, lift_max = ranges['lift_range']
            
            if effort_min <= effort <= effort_max and lift_min <= lift <= lift_max:
                return quadrant
        
        return 'fill_ins'
    
    def _calculate_matrix_data(self, opportunities: List[Dict]) -> Dict[str, Any]:
        """Calculate matrix visualization data"""
        matrix_data = {
            'quick_wins': [],
            'major_projects': [],
            'strategic_bets': [],
            'fill_ins': []
        }
        
        for opp in opportunities:
            quadrant = opp['quadrant']
            if quadrant in matrix_data:
                matrix_data[quadrant].append({
                    'x': opp['effort_score'],
                    'y': opp['lift_score'],
                    'name': opp['opportunity_name'],
                    'priority': opp['priority_score'],
                    'impact': opp['estimated_impact']
                })
        
        return matrix_data
    
    def _get_empty_opportunity_matrix(self) -> Dict[str, Any]:
        """Return empty opportunity matrix structure"""
        return {
            'opportunities': [],
            'matrix_data': {
                'quick_wins': [],
                'major_projects': [],
                'strategic_bets': [],
                'fill_ins': []
            },
            'total_opportunities': 0,
            'calculated_at': datetime.now().isoformat()
        }
    
    def store_opportunity_matrix(self, opportunity_data: Dict[str, Any]) -> bool:
        """Store opportunity matrix to PostgreSQL"""
        try:
            metric_date = datetime.now().date()
            
            for opportunity in opportunity_data['opportunities']:
                query = """
                    INSERT INTO opportunity_matrix (
                        metric_date, opportunity_name, effort_score,
                        lift_score, quadrant, priority_score, estimated_impact, metadata
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (metric_date, opportunity_name)
                    DO UPDATE SET
                        effort_score = EXCLUDED.effort_score,
                        lift_score = EXCLUDED.lift_score,
                        quadrant = EXCLUDED.quadrant,
                        priority_score = EXCLUDED.priority_score,
                        estimated_impact = EXCLUDED.estimated_impact,
                        metadata = EXCLUDED.metadata,
                        updated_at = CURRENT_TIMESTAMP
                """
                
                postgres_client.execute_update(
                    query,
                    (
                        metric_date,
                        opportunity['opportunity_name'],
                        opportunity['effort_score'],
                        opportunity['lift_score'],
                        opportunity['quadrant'],
                        opportunity['priority_score'],
                        opportunity['estimated_impact'],
                        json.dumps(opportunity)
                    )
                )
            
            logger.info("Stored opportunity matrix")
            return True
            
        except Exception as e:
            logger.error(f"Error storing opportunity matrix: {e}")
            return False
    
    def invalidate_cache(self) -> None:
        """Invalidate cache for opportunity matrix"""
        redis_client.flush_pattern("opportunity_matrix:*")


# Global opportunity analyzer instance
opportunity_analyzer = OpportunityAnalyzer()
