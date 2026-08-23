"""
Scheduled Tasks
Celery Beat tasks for scheduled data ingestion
"""

from celery import Celery
from celery.schedules import crontab
from datetime import datetime
import logging
import asyncio
import httpx
from pymongo import MongoClient
from ..collectors.reddit_collector import RedditCollector
from ..collectors.appstore_collector import AppStoreCollector
from ..collectors.youtube_collector import YouTubeCollector
from ..processors.deduplicator import Deduplicator
from ..config.settings import settings

# Configure Celery
celery_app = Celery(
    'data_ingestion',
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend
)

# Configure Celery Beat schedule
celery_app.conf.beat_schedule = {
    'ingest-reddit-every-15-minutes': {
        'task': 'tasks.scheduled_tasks.ingest_reddit',
        'schedule': crontab(minute='*/15'),
    },
    'ingest-appstore-every-6-hours': {
        'task': 'tasks.scheduled_tasks.ingest_appstore',
        'schedule': crontab(hour='*/6', minute=0),
    },
    'ingest-youtube-every-12-hours': {
        'task': 'tasks.scheduled_tasks.ingest_youtube',
        'schedule': crontab(hour='*/12', minute=30),
    },
}

celery_app.conf.timezone = 'UTC'


async def _enrich_and_store(items: list, batch_size: int = 50) -> int:
    """Enrich items with NLP and store to MongoDB."""
    if not items:
        return 0

    mongo_client = MongoClient(
        f"mongodb://{settings.mongodb_user}:{settings.mongodb_password}@"
        f"{settings.mongodb_host}:{settings.mongodb_port}/{settings.mongodb_db}"
        f"?authSource=admin"
    )
    mongo_db = mongo_client[settings.mongodb_db]
    collection = mongo_db["raw_conversations"]
    stored_count = 0

    async with httpx.AsyncClient(timeout=900.0) as client:
        for i in range(0, len(items), batch_size):
            chunk = items[i:i + batch_size]
            try:
                conversations = []
                for item in chunk:
                    ts = item.get("timestamp")
                    if isinstance(ts, str):
                        try:
                            ts = datetime.fromisoformat(ts)
                        except Exception:
                            ts = datetime.now()
                    elif not hasattr(ts, 'isoformat'):
                        ts = datetime.now()
                    item["timestamp"] = ts
                    conversations.append({
                        "text": item["text"],
                        "source": item["source"],
                        "timestamp": ts.isoformat(),
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
                logging.warning(f"NLP enrichment failed for a batch, storing unprocessed: {e!r}")
                for item in chunk:
                    item["processed"] = False

            collection.insert_many([dict(item) for item in chunk])
            stored_count += len(chunk)

    mongo_client.close()
    return stored_count


@celery_app.task(bind=True, name='tasks.scheduled_tasks.ingest_reddit')
def ingest_reddit(self):
    """Scheduled task to ingest Reddit data every 15 minutes"""
    logger = logging.getLogger('task.reddit_ingestion')
    logger.info("Starting Reddit ingestion task")
    
    try:
        collector = RedditCollector()
        deduplicator = Deduplicator()
        
        items = asyncio.run(collector.collect(limit=100))
        unique_items = deduplicator.deduplicate_batch(items)
        
        stored = asyncio.run(_enrich_and_store(unique_items))
        
        logger.info(f"Reddit ingestion completed: {len(unique_items)} unique items, {stored} stored")
        
        return {
            'status': 'success',
            'collected': len(items),
            'unique': len(unique_items),
            'stored': stored,
            'duplicates': len(items) - len(unique_items),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Reddit ingestion failed: {e}")
        raise


@celery_app.task(bind=True, name='tasks.scheduled_tasks.ingest_appstore')
def ingest_appstore(self):
    """Scheduled task to ingest App Store data every hour"""
    logger = logging.getLogger('task.appstore_ingestion')
    logger.info("Starting App Store ingestion task")
    
    try:
        collector = AppStoreCollector()
        deduplicator = Deduplicator()
        
        items = asyncio.run(collector.collect(limit=50))
        unique_items = deduplicator.deduplicate_batch(items)
        
        stored = asyncio.run(_enrich_and_store(unique_items))
        
        logger.info(f"App Store ingestion completed: {len(unique_items)} unique items, {stored} stored")
        
        return {
            'status': 'success',
            'collected': len(items),
            'unique': len(unique_items),
            'stored': stored,
            'duplicates': len(items) - len(unique_items),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"App Store ingestion failed: {e}")
        raise


@celery_app.task(bind=True, name='tasks.scheduled_tasks.ingest_youtube')
def ingest_youtube(self):
    """Scheduled task to ingest YouTube data every 6 hours"""
    logger = logging.getLogger('task.youtube_ingestion')
    logger.info("Starting YouTube ingestion task")
    
    try:
        collector = YouTubeCollector()
        deduplicator = Deduplicator()
        
        items = asyncio.run(collector.collect(limit=20))
        unique_items = deduplicator.deduplicate_batch(items)
        
        stored = asyncio.run(_enrich_and_store(unique_items))
        
        logger.info(f"YouTube ingestion completed: {len(unique_items)} unique items, {stored} stored")
        
        return {
            'status': 'success',
            'collected': len(items),
            'unique': len(unique_items),
            'stored': stored,
            'duplicates': len(items) - len(unique_items),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"YouTube ingestion failed: {e}")
        raise


@celery_app.task(bind=True, name='tasks.scheduled_tasks.ingest_all')
def ingest_all(self):
    """Manual task to ingest data from all sources"""
    logger = logging.getLogger('task.all_ingestion')
    logger.info("Starting full ingestion from all sources")
    
    try:
        reddit_task = ingest_reddit.delay()
        appstore_task = ingest_appstore.delay()
        youtube_task = ingest_youtube.delay()
        
        results = {
            'reddit': reddit_task.get(),
            'appstore': appstore_task.get(),
            'youtube': youtube_task.get()
        }
        
        total_collected = sum(r['collected'] for r in results.values())
        total_unique = sum(r['unique'] for r in results.values())
        total_stored = sum(r['stored'] for r in results.values())
        
        logger.info(f"Full ingestion completed: {total_unique} unique items, {total_stored} stored from {total_collected} total")
        
        return {
            'status': 'success',
            'results': results,
            'total_collected': total_collected,
            'total_unique': total_unique,
            'total_stored': total_stored,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Full ingestion failed: {e}")
        raise
