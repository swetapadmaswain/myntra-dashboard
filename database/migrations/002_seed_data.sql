-- Migration 002: Seed Data
-- This migration inserts initial seed data

BEGIN;

-- Insert default user segments
INSERT INTO user_segments (segment_name, segment_description, criteria, is_active) VALUES
('New Users', 'Users who joined in the last 30 days', '{"days_since_signup": 30}', true),
('Active Wishlisters', 'Users with 10+ wishlist items', '{"min_wishlist_items": 10}', true),
('High Intent', 'Users with high purchase intent', '{"min_intent_score": 0.7}', true),
('At Risk', 'Users showing signs of churn', '{"days_since_last_activity": 14}', true),
('Premium Shoppers', 'Users with high average order value', '{"min_aov": 2000}', true)
ON CONFLICT (segment_name) DO NOTHING;

-- Insert sample product catalog
INSERT INTO product_catalog (product_name, category, brand, price_range, is_active, attributes) VALUES
('Floral Print Dress', 'Dresses', 'Myntra', '₹999-₹1999', true, '{"style": "casual", "occasion": "summer"}'),
('Running Shoes', 'Footwear', 'Nike', '₹2999-₹5999', true, '{"type": "sports", "gender": "unisex"}'),
('Cotton T-Shirt', 'Tops', 'H&M', '₹499-₹999', true, '{"material": "cotton", "fit": "regular"}'),
('Denim Jeans', 'Bottoms', 'Levis', '₹1999-₹3999', true, '{"style": "skinny", "wash": "blue"}'),
('Winter Jacket', 'Outerwear', 'Zara', '₹3999-₹7999', true, '{"season": "winter", "material": "polyester"}'),
('Kurta Set', 'Ethnic Wear', 'W', '₹1499-₹2999', true, '{"style": "traditional", "occasion": "festive"}'),
('Sports Bra', 'Activewear', 'Nike', '₹999-₹1999', true, '{"type": "sports", "support": "medium"}'),
('Sneakers', 'Footwear', 'Adidas', '₹2499-₹4999', true, '{"type": "casual", "gender": "unisex"}'),
('Blazer', 'Formal Wear', 'Blackberrys', '₹2999-₹5999', true, '{"style": "formal", "fit": "slim"}'),
('Palazzo Pants', 'Bottoms', 'Myntra', '₹799-₹1499', true, '{"style": "ethnic", "material": "cotton"}')
ON CONFLICT DO NOTHING;

-- Insert sample KPI metrics for testing
INSERT INTO kpi_metrics (metric_date, segment_id, total_signals, bookmarking_intent, immediate_purchase_intent, primary_hesitation_driver, primary_hesitation_percentage, information_leakage) VALUES
(CURRENT_DATE - INTERVAL '7 days', 1, 1500, 65.5, 34.5, 'fit_sizing', 28.3, 15.2),
(CURRENT_DATE - INTERVAL '7 days', 2, 3200, 72.1, 27.9, 'styling_wardrobe', 22.7, 18.5),
(CURRENT_DATE - INTERVAL '7 days', 3, 2100, 58.3, 41.7, 'social_validation', 19.4, 12.8),
(CURRENT_DATE - INTERVAL '7 days', 4, 890, 45.2, 54.8, 'visual_reality', 31.2, 22.1),
(CURRENT_DATE, 1, 1650, 67.2, 32.8, 'fit_sizing', 26.5, 14.8),
(CURRENT_DATE, 2, 3450, 74.3, 25.7, 'styling_wardrobe', 21.2, 17.9),
(CURRENT_DATE, 3, 2250, 60.1, 39.9, 'social_validation', 18.7, 13.2),
(CURRENT_DATE, 4, 920, 48.5, 51.5, 'visual_reality', 29.8, 21.5)
ON CONFLICT (metric_date, segment_id) DO NOTHING;

-- Insert sample friction breakdown data
INSERT INTO friction_breakdown (metric_date, segment_id, friction_type, percentage, trend, sample_count) VALUES
(CURRENT_DATE, 1, 'fit_sizing', 26.5, 'down', 420),
(CURRENT_DATE, 1, 'styling_wardrobe', 18.2, 'up', 290),
(CURRENT_DATE, 1, 'social_validation', 15.8, 'neutral', 250),
(CURRENT_DATE, 1, 'visual_reality', 22.1, 'up', 350),
(CURRENT_DATE, 1, 'price_value', 17.4, 'down', 280),
(CURRENT_DATE, 2, 'fit_sizing', 21.2, 'neutral', 580),
(CURRENT_DATE, 2, 'styling_wardrobe', 24.5, 'up', 670),
(CURRENT_DATE, 2, 'social_validation', 12.3, 'down', 340),
(CURRENT_DATE, 2, 'visual_reality', 18.7, 'neutral', 520),
(CURRENT_DATE, 2, 'price_value', 23.3, 'up', 650)
ON CONFLICT (metric_date, segment_id, friction_type) DO NOTHING;

-- Insert sample intent classification data
INSERT INTO intent_classification (metric_date, segment_id, intent_type, percentage, confidence_score) VALUES
(CURRENT_DATE, 1, 'bookmarking', 67.2, 0.85),
(CURRENT_DATE, 1, 'immediate_purchase', 32.8, 0.82),
(CURRENT_DATE, 2, 'bookmarking', 74.3, 0.88),
(CURRENT_DATE, 2, 'immediate_purchase', 25.7, 0.79),
(CURRENT_DATE, 3, 'bookmarking', 60.1, 0.84),
(CURRENT_DATE, 3, 'immediate_purchase', 39.9, 0.86),
(CURRENT_DATE, 4, 'bookmarking', 48.5, 0.81),
(CURRENT_DATE, 4, 'immediate_purchase', 51.5, 0.83)
ON CONFLICT (metric_date, segment_id, intent_type) DO NOTHING;

-- Insert sample journey funnel data
INSERT INTO journey_funnel (metric_date, segment_id, step_name, step_order, percentage, drop_off_rate, avg_time_seconds) VALUES
(CURRENT_DATE, 1, 'Product View', 1, 100.0, 0.0, 45),
(CURRENT_DATE, 1, 'Add to Wishlist', 2, 78.5, 21.5, 120),
(CURRENT_DATE, 1, 'View Similar Products', 3, 52.3, 33.4, 180),
(CURRENT_DATE, 1, 'Read Reviews', 4, 38.7, 26.0, 240),
(CURRENT_DATE, 1, 'Add to Cart', 5, 28.5, 26.4, 90),
(CURRENT_DATE, 1, 'Checkout', 6, 15.2, 46.7, 300),
(CURRENT_DATE, 2, 'Product View', 1, 100.0, 0.0, 40),
(CURRENT_DATE, 2, 'Add to Wishlist', 2, 85.2, 14.8, 110),
(CURRENT_DATE, 2, 'View Similar Products', 3, 62.1, 27.1, 170),
(CURRENT_DATE, 2, 'Read Reviews', 4, 48.5, 22.0, 220),
(CURRENT_DATE, 2, 'Add to Cart', 5, 35.8, 26.2, 85),
(CURRENT_DATE, 2, 'Checkout', 6, 22.4, 37.4, 280)
ON CONFLICT (metric_date, segment_id, step_name) DO NOTHING;

-- Insert sample opportunity matrix data
INSERT INTO opportunity_matrix (metric_date, opportunity_name, effort_score, lift_score, quadrant, priority_score, estimated_impact) VALUES
(CURRENT_DATE, 'Improve size guide accuracy', 4, 8, 'quick_wins', 6.5, 2500000),
(CURRENT_DATE, 'Add user-generated photos', 6, 7, 'major_projects', 6.5, 1800000),
(CURRENT_DATE, 'Implement virtual try-on', 8, 9, 'strategic_bets', 8.5, 3500000),
(CURRENT_DATE, 'Enhance review system', 3, 5, 'quick_wins', 4.0, 800000),
(CURRENT_DATE, 'Social proof integration', 5, 6, 'major_projects', 5.5, 1200000),
(CURRENT_DATE, 'Price comparison feature', 7, 4, 'fill_ins', 5.5, 600000),
(CURRENT_DATE, 'Style recommendation engine', 9, 8, 'strategic_bets', 8.5, 2800000),
(CURRENT_DATE, 'Simplified return process', 2, 7, 'quick_wins', 4.5, 1500000)
ON CONFLICT DO NOTHING;

COMMIT;
