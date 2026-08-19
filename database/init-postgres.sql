-- PostgreSQL Initialization Script
-- This script sets up the initial database schema

-- Create user_segments table
CREATE TABLE IF NOT EXISTS user_segments (
    id SERIAL PRIMARY KEY,
    segment_name VARCHAR(100) NOT NULL UNIQUE,
    segment_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP Default CURRENT_TIMESTAMP
);

-- Create kpi_metrics table
CREATE TABLE IF NOT EXISTS kpi_metrics (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    segment_id INTEGER REFERENCES user_segments(id),
    total_signals INTEGER DEFAULT 0,
    bookmarking_intent DECIMAL(5,2) DEFAULT 0,
    immediate_purchase_intent DECIMAL(5,2) DEFAULT 0,
    primary_hesitation_driver VARCHAR(100),
    primary_hesitation_percentage DECIMAL(5,2) DEFAULT 0,
    information_leakage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, segment_id)
);

-- Create friction_breakdown table
CREATE TABLE IF NOT EXISTS friction_breakdown (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    segment_id INTEGER REFERENCES user_segments(id),
    friction_type VARCHAR(100) NOT NULL,
    percentage DECIMAL(5,2) DEFAULT 0,
    trend VARCHAR(20) DEFAULT 'neutral',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, segment_id, friction_type)
);

-- Create intent_classification table
CREATE TABLE IF NOT EXISTS intent_classification (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    segment_id INTEGER REFERENCES user_segments(id),
    intent_type VARCHAR(100) NOT NULL,
    percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, segment_id, intent_type)
);

-- Create journey_funnel table
CREATE TABLE IF NOT EXISTS journey_funnel (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    segment_id INTEGER REFERENCES user_segments(id),
    step_name VARCHAR(100) NOT NULL,
    step_order INTEGER NOT NULL,
    percentage DECIMAL(5,2) DEFAULT 0,
    avg_time_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, segment_id, step_name)
);

-- Create opportunity_matrix table
CREATE TABLE IF NOT EXISTS opportunity_matrix (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    opportunity_name VARCHAR(200) NOT NULL,
    effort_score INTEGER CHECK (effort_score >= 1 AND effort_score <= 10),
    lift_score INTEGER CHECK (lift_score >= 1 AND lift_score <= 10),
    quadrant VARCHAR(50),
    priority_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create product_catalog table
CREATE TABLE IF NOT EXISTS product_catalog (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create data_ingestion_logs table
CREATE TABLE IF NOT EXISTS data_ingestion_logs (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50) NOT NULL,
    ingestion_start TIMESTAMP NOT NULL,
    ingestion_end TIMESTAMP,
    records_processed INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kpi_metrics_date ON kpi_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_kpi_metrics_segment ON kpi_metrics(segment_id);
CREATE INDEX IF NOT EXISTS idx_friction_breakdown_date ON friction_breakdown(metric_date);
CREATE INDEX IF NOT EXISTS idx_friction_breakdown_segment ON friction_breakdown(segment_id);
CREATE INDEX IF NOT EXISTS idx_intent_classification_date ON intent_classification(metric_date);
CREATE INDEX IF NOT EXISTS idx_journey_funnel_date ON journey_funnel(metric_date);
CREATE INDEX IF NOT EXISTS idx_ingestion_logs_source ON data_ingestion_logs(source);
CREATE INDEX IF NOT EXISTS idx_ingestion_logs_date ON data_ingestion_logs(ingestion_start);

-- Create view for dashboard KPI summary
CREATE OR REPLACE VIEW dashboard_kpi_summary AS
SELECT 
    km.metric_date,
    us.segment_name,
    km.total_signals,
    km.bookmarking_intent,
    km.immediate_purchase_intent,
    km.primary_hesitation_driver,
    km.primary_hesitation_percentage,
    km.information_leakage
FROM kpi_metrics km
LEFT JOIN user_segments us ON km.segment_id = us.id
ORDER BY km.metric_date DESC, us.segment_name;

-- Create view for segment performance
CREATE OR REPLACE VIEW segment_performance AS
SELECT 
    us.segment_name,
    AVG(km.total_signals) as avg_total_signals,
    AVG(km.bookmarking_intent) as avg_bookmarking_intent,
    AVG(km.immediate_purchase_intent) as avg_immediate_purchase_intent,
    AVG(km.information_leakage) as avg_information_leakage
FROM user_segments us
LEFT JOIN kpi_metrics km ON us.id = km.segment_id
GROUP BY us.segment_name
ORDER BY us.segment_name;

-- Insert default user segments
INSERT INTO user_segments (segment_name, segment_description) VALUES
('New Users', 'Users who joined in the last 30 days'),
('Active Wishlisters', 'Users with 10+ wishlist items'),
('High Intent', 'Users with high purchase intent'),
('At Risk', 'Users showing signs of churn')
ON CONFLICT (segment_name) DO NOTHING;

-- Insert sample product catalog
INSERT INTO product_catalog (product_name, category, brand) VALUES
('Floral Print Dress', 'Dresses', 'Myntra'),
('Running Shoes', 'Footwear', 'Nike'),
('Cotton T-Shirt', 'Tops', 'H&M'),
('Denim Jeans', 'Bottoms', 'Levis'),
('Winter Jacket', 'Outerwear', 'Zara')
ON CONFLICT DO NOTHING;
