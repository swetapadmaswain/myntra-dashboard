#!/usr/bin/env python3
"""
Redis Initialization Script
This script sets up initial Redis data structures and configurations
"""

import redis
import json
import time
from datetime import datetime, timedelta

def initialize_redis(host='localhost', port=6379, db=0, password=None):
    """
    Initialize Redis with required data structures
    """
    try:
        # Connect to Redis
        r = redis.Redis(host=host, port=port, db=db, password=password, decode_responses=True)
        
        # Test connection
        r.ping()
        print("✓ Connected to Redis successfully")
        
        # Set up cache key templates
        print("\n--- Setting up cache key templates ---")
        cache_templates = {
            'cache:analytics:kpi_metrics:{segment}:{time_range}': 'Dashboard KPI metrics cache',
            'cache:analytics:friction_breakdown:{segment}:{time_range}': 'Friction breakdown cache',
            'cache:analytics:intent_matrix:{segment}:{time_range}': 'Intent matrix cache',
            'cache:analytics:journey_tracker:{segment}:{time_range}': 'Journey tracker cache',
            'cache:analytics:opportunity_matrix:{time_range}': 'Opportunity matrix cache',
            'cache:snippets:{hesitation_driver}:{page}': 'Snippets cache',
            'cache:segments:all': 'Segments list cache'
        }
        
        for template, description in cache_templates.items():
            r.set(f'template:{template}', description)
            print(f"✓ Template: {template}")
        
        # Set up session management structure
        print("\n--- Setting up session management structure ---")
        session_config = {
            'ttl': 3600,  # 1 hour
            'prefix': 'session:'
        }
        r.set('config:session', json.dumps(session_config))
        print(f"✓ Session config: TTL={session_config['ttl']}s")
        
        # Set up rate limiting structure
        print("\n--- Setting up rate limiting structure ---")
        rate_limit_config = {
            'default_limit': 1000,
            'window': 60,  # 60 seconds
            'prefix': 'ratelimit:'
        }
        r.set('config:ratelimit', json.dumps(rate_limit_config))
        print(f"✓ Rate limit config: {rate_limit_config['default_limit']} req/{rate_limit_config['window']}s")
        
        # Set up pub/sub channels for real-time updates
        print("\n--- Setting up pub/sub channels ---")
        pubsub_channels = {
            'dashboard:updates': 'Dashboard real-time updates',
            'snippets:new': 'New snippets notifications',
            'metrics:refresh': 'Metrics refresh notifications',
            'ingestion:complete': 'Data ingestion completion'
        }
        
        for channel, description in pubsub_channels.items():
            r.set(f'channel:{channel}', description)
            print(f"✓ Channel: {channel}")
        
        # Set up cache TTL configurations
        print("\n--- Setting up cache TTL configurations ---")
        ttl_config = {
            'dashboard_metrics': 300,  # 5 minutes
            'snippets': 120,  # 2 minutes
            'analytics': 600,  # 10 minutes
            'session': 3600,  # 1 hour
            'rate_limit': 60  # 1 minute
        }
        
        for key, ttl in ttl_config.items():
            r.set(f'ttl:{key}', ttl)
            print(f"✓ TTL {key}: {ttl}s")
        
        # Insert sample cache data for development
        print("\n--- Inserting sample cache data ---")
        
        # Sample KPI metrics cache
        kpi_data = {
            'total_signals': 12500,
            'bookmarking_intent': 68.5,
            'immediate_purchase_intent': 31.5,
            'primary_hesitation_driver': 'fit_sizing',
            'primary_hesitation_percentage': 24.3,
            'information_leakage': 16.8,
            'cached': True,
            'last_updated': datetime.now().isoformat()
        }
        kpi_key = 'cache:analytics:kpi_metrics:all:30d'
        r.setex(kpi_key, 300, json.dumps(kpi_data))
        print(f"✓ Sample cache: {kpi_key}")
        
        # Sample friction breakdown cache
        friction_data = {
            'friction_types': [
                {'name': 'fit_sizing', 'percentage': 24.3, 'trend': 'down', 'color': '#ff3f6c'},
                {'name': 'styling_wardrobe', 'percentage': 22.1, 'trend': 'up', 'color': '#ff905a'},
                {'name': 'social_validation', 'percentage': 18.7, 'trend': 'neutral', 'color': '#282c3f'},
                {'name': 'visual_reality', percentage: 19.4, 'trend': 'up', 'color': '#535766'},
                {'name': 'price_value', 'percentage': 15.5, 'trend': 'down', 'color': '#eaeaec'}
            ],
            'cached': True,
            'last_updated': datetime.now().isoformat()
        }
        friction_key = 'cache:analytics:friction_breakdown:all:30d'
        r.setex(friction_key, 300, json.dumps(friction_data))
        print(f"✓ Sample cache: {friction_key}")
        
        # Sample intent matrix cache
        intent_data = {
            'radar_data': [
                {'subject': 'New Users', 'active_intent': 65.5, 'passive_bookmarking': 34.5},
                {'subject': 'Active Wishlisters', 'active_intent': 72.1, 'passive_bookmarking': 27.9},
                {'subject': 'High Intent', 'active_intent': 58.3, 'passive_bookmarking': 41.7},
                {'subject': 'At Risk', 'active_intent': 45.2, 'passive_bookmarking': 54.8}
            ],
            'cached': True,
            'last_updated': datetime.now().isoformat()
        }
        intent_key = 'cache:analytics:intent_matrix:all:30d'
        r.setex(intent_key, 300, json.dumps(intent_data))
        print(f"✓ Sample cache: {intent_key}")
        
        # Sample segments cache
        segments_data = [
            {'id': 1, 'name': 'New Users', 'description': 'Users who joined in the last 30 days'},
            {'id': 2, 'name': 'Active Wishlisters', 'description': 'Users with 10+ wishlist items'},
            {'id': 3, 'name': 'High Intent', 'description': 'Users with high purchase intent'},
            {'id': 4, 'name': 'At Risk', 'description': 'Users showing signs of churn'}
        ]
        segments_key = 'cache:segments:all'
        r.setex(segments_key, 600, json.dumps(segments_data))
        print(f"✓ Sample cache: {segments_key}")
        
        # Set up health check key
        r.set('health:redis', 'ok')
        r.expire('health:redis', 60)
        print("\n✓ Health check key set")
        
        print("\n" + "="*50)
        print("Redis initialization completed successfully!")
        print("="*50)
        
        # Print summary
        info = r.info()
        print(f"\nRedis Info:")
        print(f"  - Version: {info['redis_version']}")
        print(f"  - Connected clients: {info['connected_clients']}")
        print(f"  - Used memory: {info['used_memory_human']}")
        print(f"  - Total keys: {info['db0']}")
        
        return True
        
    except redis.ConnectionError as e:
        print(f"✗ Failed to connect to Redis: {e}")
        return False
    except Exception as e:
        print(f"✗ Error during initialization: {e}")
        return False

if __name__ == '__main__':
    import sys
    
    # Parse command line arguments
    host = sys.argv[1] if len(sys.argv) > 1 else 'localhost'
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 6379
    db = int(sys.argv[3]) if len(sys.argv) > 3 else 0
    password = sys.argv[4] if len(sys.argv) > 4 else None
    
    print(f"Initializing Redis at {host}:{port} (DB: {db})")
    print("="*50)
    
    success = initialize_redis(host, port, db, password)
    
    sys.exit(0 if success else 1)
