-- Redis Initialization Script
-- This script sets up initial Redis data structures

-- Set up cache key templates
-- Format: cache:{service}:{endpoint}:{params_hash}
-- Example: cache:analytics:kpi_metrics:segment_all_timerange_30d

-- Set up session management structure
-- Format: session:{session_id}
-- Example: session:abc123 = {user_id: 1, created_at: 1234567890}

-- Set up rate limiting structure
-- Format: ratelimit:{user_id}:{endpoint}
-- Example: ratelimit:user123:dashboard_metrics = {count: 100, window: 60}

-- Set up pub/sub channels for real-time updates
-- Channels:
-- - dashboard:updates
-- - snippets:new
-- - metrics:refresh

-- Set up cache TTL configurations (in seconds)
-- Dashboard metrics: 300 (5 minutes)
-- Snippets: 120 (2 minutes)
-- Analytics: 600 (10 minutes)
-- Session: 3600 (1 hour)

-- Sample cache warming data (for development)
-- This will be replaced by actual data during operation

print("Redis initialization completed successfully")
