-- Migration 001: Initial Schema
-- This migration creates the base database schema

BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_segments table
CREATE TABLE IF NOT EXISTS user_segments (
    id SERIAL PRIMARY KEY,
    segment_name VARCHAR(100) NOT NULL UNIQUE,
    segment_description TEXT,
    criteria JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create kpi_metrics table
CREATE TABLE IF NOT EXISTS kpi_metrics (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    segment_id INTEGER REFERENCES user_segments(id) ON DELETE SET NULL,
    total_signals INTEGER DEFAULT 0,
    bookmarking_intent DECIMAL(5,2) DEFAULT 0,
    immediate_purchase_intent DECIMAL(5,2) DEFAULT 0,
    primary_hesitation_driver VARCHAR(100),
    primary_hesitation_percentage DECIMAL(5,2) DEFAULT 0,
    information_leakage DECIMAL(5,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, segment_id)
);

-- Create friction_breakdown table
CREATE TABLE IF NOT EXISTS friction_breakdown (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    segment_id INTEGER REFERENCES user_segments(id) ON DELETE SET NULL,
    friction_type VARCHAR(100) NOT NULL,
    percentage DECIMAL(5,2) DEFAULT 0,
    trend VARCHAR(20) DEFAULT 'neutral',
    sample_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, segment_id, friction_type)
);

-- Create intent_classification table
CREATE TABLE IF NOT EXISTS intent_classification (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    segment_id INTEGER REFERENCES user_segments(id) ON DELETE SET NULL,
    intent_type VARCHAR(100) NOT NULL,
    percentage DECIMAL(5,2) DEFAULT 0,
    confidence_score DECIMAL(5,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, segment_id, intent_type)
);

-- Create journey_funnel table
CREATE TABLE IF NOT EXISTS journey_funnel (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    segment_id INTEGER REFERENCES user_segments(id) ON DELETE SET NULL,
    step_name VARCHAR(100) NOT NULL,
    step_order INTEGER NOT NULL,
    percentage DECIMAL(5,2) DEFAULT 0,
    drop_off_rate DECIMAL(5,2) DEFAULT 0,
    avg_time_seconds INTEGER,
    common_path_to_next TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    estimated_impact DECIMAL(10,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create product_catalog table
CREATE TABLE IF NOT EXISTS product_catalog (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(100),
    price_range VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    attributes JSONB DEFAULT '{}',
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
    records_duplicated INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create model_performance_metrics table
CREATE TABLE IF NOT EXISTS model_performance_metrics (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50),
    metric_date DATE NOT NULL,
    accuracy DECIMAL(5,2),
    precision DECIMAL(5,2),
    recall DECIMAL(5,2),
    f1_score DECIMAL(5,2),
    inference_time_ms DECIMAL(10,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kpi_metrics_date ON kpi_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_kpi_metrics_segment ON kpi_metrics(segment_id);
CREATE INDEX IF NOT EXISTS idx_kpi_metrics_date_segment ON kpi_metrics(metric_date DESC, segment_id);

CREATE INDEX IF NOT EXISTS idx_friction_breakdown_date ON friction_breakdown(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_friction_breakdown_segment ON friction_breakdown(segment_id);
CREATE INDEX IF NOT EXISTS idx_friction_breakdown_type ON friction_breakdown(friction_type);

CREATE INDEX IF NOT EXISTS idx_intent_classification_date ON intent_classification(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_intent_classification_segment ON intent_classification(segment_id);
CREATE INDEX IF NOT EXISTS idx_intent_classification_type ON intent_classification(intent_type);

CREATE INDEX IF NOT EXISTS idx_journey_funnel_date ON journey_funnel(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_journey_funnel_segment ON journey_funnel(segment_id);
CREATE INDEX IF NOT EXISTS idx_journey_funnel_order ON journey_funnel(step_order);

CREATE INDEX IF NOT EXISTS idx_opportunity_matrix_date ON opportunity_matrix(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_opportunity_matrix_quadrant ON opportunity_matrix(quadrant);

CREATE INDEX IF NOT EXISTS idx_product_catalog_category ON product_catalog(category);
CREATE INDEX IF NOT EXISTS idx_product_catalog_brand ON product_catalog(brand);
CREATE INDEX IF NOT EXISTS idx_product_catalog_active ON product_catalog(is_active);

CREATE INDEX IF NOT EXISTS idx_ingestion_logs_source ON data_ingestion_logs(source);
CREATE INDEX IF NOT EXISTS idx_ingestion_logs_date ON data_ingestion_logs(ingestion_start DESC);
CREATE INDEX IF NOT EXISTS idx_ingestion_logs_status ON data_ingestion_logs(status);

CREATE INDEX IF NOT EXISTS idx_model_performance_date ON model_performance_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_model_performance_name ON model_performance_metrics(model_name);

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_segments_updated_at BEFORE UPDATE ON user_segments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kpi_metrics_updated_at BEFORE UPDATE ON kpi_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friction_breakdown_updated_at BEFORE UPDATE ON friction_breakdown
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intent_classification_updated_at BEFORE UPDATE ON intent_classification
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journey_funnel_updated_at BEFORE UPDATE ON journey_funnel
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunity_matrix_updated_at BEFORE UPDATE ON opportunity_matrix
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_catalog_updated_at BEFORE UPDATE ON product_catalog
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
