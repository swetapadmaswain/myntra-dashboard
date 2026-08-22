"""
Data Ingestion Service - Main FastAPI Application
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import structlog
from datetime import datetime
from typing import Dict, Any, Optional
import asyncio

import httpx
from pydantic import BaseModel as PydanticBaseModel
from pymongo import MongoClient

from .config.settings import settings
from .collectors.reddit_collector import RedditCollector
from .collectors.appstore_collector import AppStoreCollector
from .collectors.youtube_collector import YouTubeCollector
from .processors.deduplicator import Deduplicator
from .tasks.scheduled_tasks import celery_app

_mongo_client = MongoClient(
    f"mongodb://{settings.mongodb_user}:{settings.mongodb_password}@"
    f"{settings.mongodb_host}:{settings.mongodb_port}/{settings.mongodb_db}"
    f"?authSource=admin"
)
_mongo_db = _mongo_client[settings.mongodb_db]


class SnippetSearchRequest(PydanticBaseModel):
    query: str
    filters: Dict[str, Any] = {}
    page: int = 1
    limit: int = 20


async def enrich_and_store(items: list, batch_size: int = 50) -> int:
    """
    Enrich collected items with NLP predictions (sentiment, intent, hesitation
    driver, entities) in batches and persist them to MongoDB's raw_conversations
    collection.

    Args:
        items: List of normalized conversation items from a collector
        batch_size: Number of items to send to the NLP service per batch request

    Returns:
        Number of items successfully stored
    """
    if not items:
        return 0

    collection = _mongo_db["raw_conversations"]
    stored_count = 0

    async with httpx.AsyncClient(timeout=900.0) as client:
        for i in range(0, len(items), batch_size):
            chunk = items[i:i + batch_size]

            try:
                conversations = []
                for item in chunk:
                    ts = item.get("timestamp")
                    conversations.append({
                        "text": item["text"],
                        "source": item["source"],
                        "timestamp": ts.isoformat() if hasattr(ts, 'isoformat') else ts,
                        "author": item.get("author"),
                        "metadata": item.get("metadata", {})
                    })

                response = await client.post(
                    f"{settings.nlp_service_url}/process/conversations",
                    json={"conversations": conversations}
                )
                response.raise_for_status()
                nlp_results = response.json()

                for item, nlp_result in zip(chunk, nlp_results):
                    item["sentiment"] = nlp_result.get("sentiment", item.get("sentiment"))
                    item["intent"] = nlp_result.get("intent", item.get("intent"))
                    item["hesitation_driver"] = nlp_result.get(
                        "hesitation_driver", item.get("hesitation_driver")
                    )
                    item["entities"] = nlp_result.get("entities", item.get("entities", []))
                    item["processed"] = True
            except Exception as e:
                logger.warning(f"NLP enrichment failed for a batch, storing unprocessed: {e!r}")
                for item in chunk:
                    item["processed"] = False

            collection.insert_many([dict(item) for item in chunk])
            stored_count += len(chunk)
            logger.info(f"Enriched and stored {stored_count}/{len(items)} items")

    return stored_count

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
    logger.info("Starting Data Ingestion Service", version=settings.app_version)
    yield
    logger.info("Shutting down Data Ingestion Service")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Data Ingestion Service for Wishlist AI Discovery Engine",
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
    """
    Health check endpoint
    
    Returns:
        Health status of the service
    """
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "timestamp": datetime.now().isoformat()
    }


# Snippets endpoints
@app.get("/snippets")
async def list_snippets(
    page: int = 1,
    limit: int = 20,
    hesitation_driver: Optional[str] = None,
    sentiment: Optional[str] = None
) -> Dict[str, Any]:
    """
    List conversation snippets with pagination and filtering

    Args:
        page: Page number (1-indexed)
        limit: Number of items per page
        hesitation_driver: Filter by hesitation driver
        sentiment: Filter by sentiment

    Returns:
        Paginated list of snippets
    """
    try:
        query: Dict[str, Any] = {"processed": True}
        if hesitation_driver:
            query["hesitation_driver"] = hesitation_driver
        if sentiment:
            query["sentiment"] = sentiment

        collection = _mongo_db["raw_conversations"]
        total = collection.count_documents(query)

        skip = (page - 1) * limit
        cursor = collection.find(query, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit)
        snippets = list(cursor)

        return {
            "snippets": snippets,
            "page": page,
            "limit": limit,
            "total": total,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Error listing snippets: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/snippets/search")
async def search_snippets(request: SnippetSearchRequest) -> Dict[str, Any]:
    """
    Full-text search over conversation snippets with filters

    Args:
        request: Search request with query text, filters, and pagination

    Returns:
        Paginated search results
    """
    try:
        mongo_query: Dict[str, Any] = {
            "processed": True,
            "$text": {"$search": request.query}
        }

        if request.filters.get("source"):
            mongo_query["source"] = request.filters["source"]
        if request.filters.get("sentiment"):
            mongo_query["sentiment"] = request.filters["sentiment"]
        if request.filters.get("hesitation_driver"):
            mongo_query["hesitation_driver"] = request.filters["hesitation_driver"]

        collection = _mongo_db["raw_conversations"]
        total = collection.count_documents(mongo_query)

        skip = (request.page - 1) * request.limit
        cursor = collection.find(mongo_query, {"_id": 0}).skip(skip).limit(request.limit)
        results = list(cursor)

        return {
            "results": results,
            "page": request.page,
            "limit": request.limit,
            "total": total,
            "query": request.query,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Error searching snippets: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Manual ingestion endpoints
@app.post("/ingest/reddit")
async def ingest_reddit_manual(background_tasks: BackgroundTasks, limit: int = 100) -> Dict[str, Any]:
    """
    Manual trigger for Reddit data ingestion
    
    Args:
        background_tasks: FastAPI background tasks
        limit: Maximum number of posts to collect
        
    Returns:
        Ingestion task status
    """
    try:
        logger.info(f"Manual Reddit ingestion requested with limit={limit}")
        
        collector = RedditCollector()
        deduplicator = Deduplicator()
        
        # Collect data
        items = await collector.collect(limit=limit)
        
        # Deduplicate
        unique_items = deduplicator.deduplicate_batch(items)
        
        # Enrich with NLP predictions and persist to MongoDB
        stored = await enrich_and_store(unique_items)
        
        logger.info(f"Manual Reddit ingestion completed: {len(unique_items)} unique items, {stored} stored")
        
        return {
            "status": "success",
            "collected": len(items),
            "unique": len(unique_items),
            "duplicates": len(items) - len(unique_items),
            "stored": stored,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Manual Reddit ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ingest/appstore")
async def ingest_appstore_manual(background_tasks: BackgroundTasks, limit: int = 100) -> Dict[str, Any]:
    """
    Manual trigger for App Store data ingestion
    
    Args:
        background_tasks: FastAPI background tasks
        limit: Maximum number of reviews to collect
        
    Returns:
        Ingestion task status
    """
    try:
        logger.info(f"Manual App Store ingestion requested with limit={limit}")
        
        collector = AppStoreCollector()
        deduplicator = Deduplicator()
        
        # Collect data
        items = await collector.collect(limit=limit)
        
        # Deduplicate
        unique_items = deduplicator.deduplicate_batch(items)
        
        # Enrich with NLP predictions and persist to MongoDB
        stored = await enrich_and_store(unique_items)
        
        logger.info(f"Manual App Store ingestion completed: {len(unique_items)} unique items, {stored} stored")
        
        return {
            "status": "success",
            "collected": len(items),
            "unique": len(unique_items),
            "duplicates": len(items) - len(unique_items),
            "stored": stored,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Manual App Store ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ingest/youtube")
async def ingest_youtube_manual(background_tasks: BackgroundTasks, limit: int = 50) -> Dict[str, Any]:
    """
    Manual trigger for YouTube data ingestion
    
    Args:
        background_tasks: FastAPI background tasks
        limit: Maximum number of videos to collect
        
    Returns:
        Ingestion task status
    """
    try:
        logger.info(f"Manual YouTube ingestion requested with limit={limit}")
        
        collector = YouTubeCollector()
        deduplicator = Deduplicator()
        
        # Collect data
        items = await collector.collect(limit=limit)
        
        # Deduplicate
        unique_items = deduplicator.deduplicate_batch(items)
        
        # Enrich with NLP predictions and persist to MongoDB in the background
        # so the API returns immediately while the slow NLP service runs
        background_tasks.add_task(enrich_and_store, unique_items)
        
        logger.info(f"Manual YouTube ingestion started: {len(unique_items)} unique items queued for background processing")
        
        return {
            "status": "processing",
            "collected": len(items),
            "unique": len(unique_items),
            "duplicates": len(items) - len(unique_items),
            "stored": 0,
            "queued_for_processing": len(unique_items),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Manual YouTube ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ingest/all")
async def ingest_all_manual(background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """
    Manual trigger for ingestion from all sources
    
    Args:
        background_tasks: FastAPI background tasks
        
    Returns:
        Combined ingestion task status
    """
    try:
        logger.info("Manual full ingestion requested")
        
        # Run all ingestions in parallel
        reddit_task = asyncio.create_task(ingest_reddit_manual(background_tasks, 100))
        appstore_task = asyncio.create_task(ingest_appstore_manual(background_tasks, 100))
        youtube_task = asyncio.create_task(ingest_youtube_manual(background_tasks, 50))
        
        results = await asyncio.gather(reddit_task, appstore_task, youtube_task)
        
        total_collected = sum(r['collected'] for r in results)
        total_unique = sum(r['unique'] for r in results)
        
        logger.info(f"Manual full ingestion completed: {total_unique} unique items from {total_collected} total")
        
        return {
            "status": "success",
            "results": {
                "reddit": results[0],
                "appstore": results[1],
                "youtube": results[2]
            },
            "total_collected": total_collected,
            "total_unique": total_unique,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Manual full ingestion failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Celery task status endpoint
@app.get("/tasks/{task_id}")
async def get_task_status(task_id: str) -> Dict[str, Any]:
    """
    Get status of a Celery task
    
    Args:
        task_id: Celery task ID
        
    Returns:
        Task status
    """
    try:
        from celery.result import AsyncResult
        
        task = AsyncResult(task_id, app=celery_app)
        
        return {
            "task_id": task_id,
            "status": task.status,
            "result": task.result if task.ready() else None,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get task status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Root endpoint
@app.get("/")
async def root() -> Dict[str, Any]:
    """
    Root endpoint with service information
    
    Returns:
        Service information
    """
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "endpoints": {
            "health": "/health",
            "ingest_reddit": "/ingest/reddit",
            "ingest_appstore": "/ingest/appstore",
            "ingest_youtube": "/ingest/youtube",
            "ingest_all": "/ingest/all",
            "task_status": "/tasks/{task_id}"
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
