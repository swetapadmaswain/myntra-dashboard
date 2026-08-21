"""
Analytics Service - Main FastAPI Application
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional
import structlog
from datetime import datetime

from .config.settings import settings
from .analytics.kpi_calculator import kpi_calculator
from .analytics.friction_analyzer import friction_analyzer
from .analytics.intent_analyzer import intent_analyzer
from .analytics.journey_analyzer import journey_analyzer
from .analytics.opportunity_analyzer import opportunity_analyzer
from .database.postgres_client import postgres_client

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    logger.info("Starting Analytics Service", version=settings.app_version)
    yield
    logger.info("Shutting down Analytics Service")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Analytics Service for Wishlist AI Discovery Engine",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "timestamp": datetime.now().isoformat()
    }


# Segments endpoint
@app.get("/analytics/segments")
async def get_segments() -> Dict[str, Any]:
    """
    Get list of available user segments

    Returns:
        List of user segments
    """
    try:
        logger.info("Fetching user segments")

        query = """
            SELECT id, segment_name, segment_description, criteria, is_active
            FROM user_segments
            WHERE is_active = true
            ORDER BY id ASC
        """

        segments = postgres_client.execute_query(query)

        return {
            "segments": segments,
            "total": len(segments),
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Error fetching segments: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# KPI Metrics endpoint
@app.get("/analytics/kpi-metrics")
async def get_kpi_metrics(
    segment_id: Optional[int] = Query(None, description="User segment ID"),
    time_range: str = Query("30d", description="Time range: 7d, 30d, 90d"),
    source: Optional[str] = Query(None, description="Data source filter"),
    sentiment: Optional[str] = Query(None, description="Sentiment filter"),
    hesitation_driver: Optional[str] = Query(None, description="Hesitation driver filter")
) -> Dict[str, Any]:
    """
    Get KPI metrics for a segment and time range
    """
    try:
        logger.info(f"Fetching KPI metrics: segment={segment_id}, time_range={time_range}, source={source}, sentiment={sentiment}, hesitation_driver={hesitation_driver}")
        
        metrics = kpi_calculator.calculate_kpi_metrics(segment_id, time_range, source, sentiment, hesitation_driver)
        
        return metrics
        
    except Exception as e:
        logger.error(f"Error fetching KPI metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Friction Breakdown endpoint
@app.get("/analytics/friction-breakdown")
async def get_friction_breakdown(
    segment_id: Optional[int] = Query(None, description="User segment ID"),
    time_range: str = Query("30d", description="Time range: 7d, 30d, 90d"),
    source: Optional[str] = Query(None, description="Data source filter"),
    sentiment: Optional[str] = Query(None, description="Sentiment filter"),
    hesitation_driver: Optional[str] = Query(None, description="Hesitation driver filter")
) -> Dict[str, Any]:
    """
    Get friction breakdown for a segment and time range
    """
    try:
        logger.info(f"Fetching friction breakdown: segment={segment_id}, time_range={time_range}, source={source}, sentiment={sentiment}, hesitation_driver={hesitation_driver}")
        
        breakdown = friction_analyzer.calculate_friction_breakdown(segment_id, time_range, source, sentiment, hesitation_driver)
        
        return breakdown
        
    except Exception as e:
        logger.error(f"Error fetching friction breakdown: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/analytics/friction-breakdown/trend/{friction_type}")
async def get_friction_trend(
    friction_type: str,
    segment_id: Optional[int] = Query(None, description="User segment ID"),
    days: int = Query(7, description="Number of days of history")
) -> Dict[str, Any]:
    """
    Get historical trend for a specific friction type
    
    Args:
        friction_type: Type of friction
        segment_id: User segment ID (optional)
        days: Number of days of history
        
    Returns:
        Trend data
    """
    try:
        logger.info(f"Fetching friction trend: type={friction_type}, segment={segment_id}")
        
        trend = friction_analyzer.get_friction_trend(friction_type, segment_id, days)
        
        return {"friction_type": friction_type, "trend": trend}
        
    except Exception as e:
        logger.error(f"Error fetching friction trend: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Intent Matrix endpoint
@app.get("/analytics/intent-matrix")
async def get_intent_matrix(
    segment_id: Optional[int] = Query(None, description="User segment ID"),
    time_range: str = Query("30d", description="Time range: 7d, 30d, 90d"),
    source: Optional[str] = Query(None, description="Data source filter"),
    sentiment: Optional[str] = Query(None, description="Sentiment filter"),
    hesitation_driver: Optional[str] = Query(None, description="Hesitation driver filter")
) -> Dict[str, Any]:
    """
    Get intent matrix for a segment and time range
    """
    try:
        logger.info(f"Fetching intent matrix: segment={segment_id}, time_range={time_range}, source={source}, sentiment={sentiment}, hesitation_driver={hesitation_driver}")
        
        matrix = intent_analyzer.calculate_intent_matrix(segment_id, time_range, source, sentiment, hesitation_driver)
        
        return matrix
        
    except Exception as e:
        logger.error(f"Error fetching intent matrix: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Journey Tracker endpoint
@app.get("/analytics/journey-tracker")
async def get_journey_tracker(
    segment_id: Optional[int] = Query(None, description="User segment ID"),
    time_range: str = Query("30d", description="Time range: 7d, 30d, 90d"),
    source: Optional[str] = Query(None, description="Data source filter"),
    sentiment: Optional[str] = Query(None, description="Sentiment filter"),
    hesitation_driver: Optional[str] = Query(None, description="Hesitation driver filter")
) -> Dict[str, Any]:
    """
    Get journey tracker for a segment and time range
    """
    try:
        logger.info(f"Fetching journey tracker: segment={segment_id}, time_range={time_range}, source={source}, sentiment={sentiment}, hesitation_driver={hesitation_driver}")
        
        tracker = journey_analyzer.calculate_journey_tracker(segment_id, time_range, source, sentiment, hesitation_driver)
        
        return tracker
        
    except Exception as e:
        logger.error(f"Error fetching journey tracker: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Opportunity Matrix endpoint
@app.get("/analytics/opportunity-matrix")
async def get_opportunity_matrix(
    time_range: str = Query("30d", description="Time range: 7d, 30d, 90d"),
    source: Optional[str] = Query(None, description="Data source filter"),
    sentiment: Optional[str] = Query(None, description="Sentiment filter"),
    hesitation_driver: Optional[str] = Query(None, description="Hesitation driver filter")
) -> Dict[str, Any]:
    """
    Get opportunity matrix for prioritization
    """
    try:
        logger.info(f"Fetching opportunity matrix: time_range={time_range}, source={source}, sentiment={sentiment}, hesitation_driver={hesitation_driver}")
        
        matrix = opportunity_analyzer.calculate_opportunity_matrix(time_range, source, sentiment, hesitation_driver)
        
        return matrix
        
    except Exception as e:
        logger.error(f"Error fetching opportunity matrix: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Dashboard summary endpoint (combines all analytics)
@app.get("/analytics/dashboard-summary")
async def get_dashboard_summary(
    segment_id: Optional[int] = Query(None, description="User segment ID"),
    time_range: str = Query("30d", description="Time range: 7d, 30d, 90d")
) -> Dict[str, Any]:
    """
    Get combined dashboard summary with all analytics
    
    Args:
        segment_id: User segment ID (optional)
        time_range: Time range (7d, 30d, 90d)
        
    Returns:
        Combined dashboard data
    """
    try:
        logger.info(f"Fetching dashboard summary: segment={segment_id}, time_range={time_range}")
        
        kpi_metrics = kpi_calculator.calculate_kpi_metrics(segment_id, time_range)
        friction_breakdown = friction_analyzer.calculate_friction_breakdown(segment_id, time_range)
        intent_matrix = intent_analyzer.calculate_intent_matrix(segment_id, time_range)
        journey_tracker = journey_analyzer.calculate_journey_tracker(segment_id, time_range)
        opportunity_matrix = opportunity_analyzer.calculate_opportunity_matrix(time_range)
        
        return {
            "kpi_metrics": kpi_metrics,
            "friction_breakdown": friction_breakdown,
            "intent_matrix": intent_matrix,
            "journey_tracker": journey_tracker,
            "opportunity_matrix": opportunity_matrix,
            "segment_id": segment_id,
            "time_range": time_range,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching dashboard summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Cache invalidation endpoint
@app.post("/analytics/invalidate-cache")
async def invalidate_cache(
    segment_id: Optional[int] = Query(None, description="User segment ID to invalidate")
) -> Dict[str, Any]:
    """
    Invalidate all analytics cache for a segment
    
    Args:
        segment_id: User segment ID (optional, invalidates all if None)
        
    Returns:
        Invalidation status
    """
    try:
        logger.info(f"Invalidating cache for segment: {segment_id}")
        
        kpi_calculator.invalidate_cache(segment_id)
        friction_analyzer.invalidate_cache(segment_id)
        intent_analyzer.invalidate_cache(segment_id)
        journey_analyzer.invalidate_cache(segment_id)
        opportunity_analyzer.invalidate_cache()
        
        return {
            "status": "success",
            "message": f"Cache invalidated for segment {segment_id}",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error invalidating cache: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Root endpoint
@app.get("/")
async def root() -> Dict[str, Any]:
    """Root endpoint with service information"""
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "endpoints": {
            "health": "/health",
            "kpi_metrics": "/analytics/kpi-metrics",
            "friction_breakdown": "/analytics/friction-breakdown",
            "friction_trend": "/analytics/friction-breakdown/trend/{friction_type}",
            "intent_matrix": "/analytics/intent-matrix",
            "journey_tracker": "/analytics/journey-tracker",
            "opportunity_matrix": "/analytics/opportunity-matrix",
            "dashboard_summary": "/analytics/dashboard-summary",
            "invalidate_cache": "/analytics/invalidate-cache"
        },
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    
    logger.info(
        f"Starting {settings.app_name} v{settings.app_version}",
        host=settings.host,
        port=settings.port
    )
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
