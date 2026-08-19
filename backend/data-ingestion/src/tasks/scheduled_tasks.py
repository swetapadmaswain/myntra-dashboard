"""
Scheduled Tasks
Celery Beat tasks for scheduled data ingestion
"""

from celery import Celery
from celery.schedules import crontab
from datetime import datetime
import logging
import asyncio
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
    'ingest-appstore-every-hour': {
        'task': 'tasks.scheduled_tasks.ingest_appstore',
        'schedule': crontab(minute=0),
    },
    'ingest-youtube-every-6-hours': {
        'task': 'tasks.scheduled_tasks.ingest_youtube',
        'schedule': crontab(hour='*/6', minute=0),
    },
}

celery_app.conf.timezone = 'UTC'


@celery_app.task(bind=True, name='tasks.scheduled_tasks.ingest_reddit')
def ingest_reddit(self):
    """
    Scheduled task to ingest Reddit data every 15 minutes
    """
    logger = logging.getLogger('task.reddit_ingestion')
    logger.info("Starting Reddit ingestion task")
    
    try:
        collector = RedditCollector()
        deduplicator = Deduplicator()
        
        # Collect data (run async in sync context)
        items = asyncio.run(collector.collect(limit=100))
        
        # Deduplicate
        unique_items = deduplicator.deduplicate_batch(items)
        
        # Store to database (to be implemented)
        # store_to_mongodb(unique_items)
        
        logger.info(f"Reddit ingestion completed: {len(unique_items)} unique items collected")
        
        return {
            'status': 'success',
            'collected': len(items),
            'unique': len(unique_items),
            'duplicates': len(items) - len(unique_items),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Reddit ingestion failed: {e}")
        raise


@celery_app.task(bind=True, name='tasks.scheduled_tasks.ingest_appstore')
def ingest_appstore(self):
    """
    Scheduled task to ingest App Store data every hour
    """
    logger = logging.getLogger('task.appstore_ingestion')
    logger.info("Starting App Store ingestion task")
    
    try:
        collector = AppStoreCollector()
        deduplicator = Deduplicator()
        
        # Collect data (run async in sync context)
        items = asyncio.run(collector.collect(limit=100))
        
        # Deduplicate
        unique_items = deduplicator.deduplicate_batch(items)
        
        # Store to database (to be implemented)
        # store_to_mongodb(unique_items)
        
        logger.info(f"App Store ingestion completed: {len(unique_items)} unique items collected")
        
        return {
            'status': 'success',
            'collected': len(items),
            'unique': len(unique_items),
            'duplicates': len(items) - len(unique_items),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"App Store ingestion failed: {e}")
        raise


@celery_app.task(bind=True, name='tasks.scheduled_tasks.ingest_youtube')
def ingest_youtube(self):
    """
    Scheduled task to ingest YouTube data every 6 hours
    """
    logger = logging.getLogger('task.youtube_ingestion')
    logger.info("Starting YouTube ingestion task")
    
    try:
        collector = YouTubeCollector()
        deduplicator = Deduplicator()
        
        # Collect data (run async in sync context)
        items = asyncio.run(collector.collect(limit=50))
        
        # Deduplicate
        unique_items = deduplicator.deduplicate_batch(items)
        
        # Store to database (to be implemented)
        # store_to_mongodb(unique_items)
        
        logger.info(f"YouTube ingestion completed: {len(unique_items)} unique items collected")
        
        return {
            'status': 'success',
            'collected': len(items),
            'unique': len(unique_items),
            'duplicates': len(items) - len(unique_items),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"YouTube ingestion failed: {e}")
        raise


@celery_app.task(bind=True, name='tasks.scheduled_tasks.ingest_all')
def ingest_all(self):
    """
    Manual task to ingest data from all sources
    """
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
        
        logger.info(f"Full ingestion completed: {total_unique} unique items from {total_collected} total")
        
        return {
            'status': 'success',
            'results': results,
            'total_collected': total_collected,
            'total_unique': total_unique,
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Full ingestion failed: {e}")
        raise
