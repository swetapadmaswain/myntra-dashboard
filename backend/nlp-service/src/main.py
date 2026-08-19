"""
NLP Processing Service - Main FastAPI Application
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
import structlog
from datetime import datetime

from .config.settings import settings
from .pipelines.nlp_pipeline import nlp_pipeline
from .models.model_loader import model_loader

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


# Pydantic models for API
class TextRequest(BaseModel):
    text: str


class BatchTextRequest(BaseModel):
    texts: List[str]


class ConversationRequest(BaseModel):
    text: str
    source: str
    timestamp: Optional[str] = None
    author: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class BatchConversationRequest(BaseModel):
    conversations: List[Dict[str, Any]]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events"""
    logger.info("Starting NLP Processing Service", version=settings.app_version)
    
    # Load models on startup
    try:
        nlp_pipeline.load_models()
        logger.info("NLP models loaded successfully on startup")
    except Exception as e:
        logger.warning(f"Failed to load models on startup: {e}")
    
    yield
    
    # Unload models on shutdown
    model_loader.unload_all()
    logger.info("Shutting down NLP Processing Service")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="NLP Processing Service for Wishlist AI Discovery Engine",
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
    loaded_models = model_loader.get_loaded_models()
    
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "models_loaded": loaded_models,
        "timestamp": datetime.now().isoformat()
    }


# Single text processing endpoint
@app.post("/process/text")
async def process_text(request: TextRequest) -> Dict[str, Any]:
    """
    Process a single text through the NLP pipeline
    
    Args:
        request: Text request with text to process
        
    Returns:
        Processed text with all NLP predictions
    """
    try:
        logger.info(f"Processing single text: {request.text[:100]}...")
        
        result = nlp_pipeline.process_text(request.text)
        
        logger.info("Text processed successfully")
        return result
        
    except Exception as e:
        logger.error(f"Error processing text: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Batch text processing endpoint
@app.post("/process/batch")
async def process_batch(request: BatchTextRequest) -> List[Dict[str, Any]]:
    """
    Process multiple texts through the NLP pipeline
    
    Args:
        request: Batch text request with list of texts
        
    Returns:
        List of processed texts with NLP predictions
    """
    try:
        logger.info(f"Processing batch of {len(request.texts)} texts")
        
        results = nlp_pipeline.process_batch(request.texts)
        
        logger.info(f"Batch processing completed: {len(results)} texts")
        return results
        
    except Exception as e:
        logger.error(f"Error processing batch: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Single conversation processing endpoint
@app.post("/process/conversation")
async def process_conversation(request: ConversationRequest) -> Dict[str, Any]:
    """
    Process a single conversation item
    
    Args:
        request: Conversation request with text and metadata
        
    Returns:
        Processed conversation with NLP predictions
    """
    try:
        logger.info(f"Processing conversation: {request.text[:100]}...")
        
        conversation_data = {
            'text': request.text,
            'source': request.source,
            'timestamp': request.timestamp,
            'author': request.author,
            'metadata': request.metadata or {}
        }
        
        result = nlp_pipeline.process_conversation(conversation_data)
        
        logger.info("Conversation processed successfully")
        return result
        
    except Exception as e:
        logger.error(f"Error processing conversation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Batch conversation processing endpoint
@app.post("/process/conversations")
async def process_conversations(request: BatchConversationRequest) -> List[Dict[str, Any]]:
    """
    Process multiple conversation items
    
    Args:
        request: Batch conversation request with list of conversations
        
    Returns:
        List of processed conversations with NLP predictions
    """
    try:
        logger.info(f"Processing batch of {len(request.conversations)} conversations")
        
        results = nlp_pipeline.process_conversation_batch(request.conversations)
        
        logger.info(f"Batch processing completed: {len(results)} conversations")
        return results
        
    except Exception as e:
        logger.error(f"Error processing conversation batch: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Statistics endpoint
@app.post("/statistics")
async def get_statistics(request: BatchTextRequest) -> Dict[str, Any]:
    """
    Get aggregated statistics for a batch of texts
    
    Args:
        request: Batch text request with list of texts
        
    Returns:
        Dictionary with aggregated statistics
    """
    try:
        logger.info(f"Calculating statistics for {len(request.texts)} texts")
        
        stats = nlp_pipeline.get_pipeline_statistics(request.texts)
        
        logger.info("Statistics calculated successfully")
        return stats
        
    except Exception as e:
        logger.error(f"Error calculating statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Model management endpoints
@app.post("/models/load")
async def load_models() -> Dict[str, Any]:
    """
    Load all NLP models
    
    Returns:
        Status of model loading
    """
    try:
        logger.info("Loading all NLP models")
        
        nlp_pipeline.load_models()
        loaded_models = model_loader.get_loaded_models()
        
        logger.info(f"Models loaded: {loaded_models}")
        return {
            "status": "success",
            "models_loaded": loaded_models,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/models/unload")
async def unload_models() -> Dict[str, Any]:
    """
    Unload all NLP models
    
    Returns:
        Status of model unloading
    """
    try:
        logger.info("Unloading all NLP models")
        
        model_loader.unload_all()
        
        logger.info("All models unloaded")
        return {
            "status": "success",
            "models_loaded": [],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error unloading models: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models")
async def get_models() -> Dict[str, Any]:
    """
    Get list of loaded models
    
    Returns:
        List of loaded models
    """
    loaded_models = model_loader.get_loaded_models()
    
    return {
        "models_loaded": loaded_models,
        "timestamp": datetime.now().isoformat()
    }


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
            "process_text": "/process/text",
            "process_batch": "/process/batch",
            "process_conversation": "/process/conversation",
            "process_conversations": "/process/conversations",
            "statistics": "/statistics",
            "load_models": "/models/load",
            "unload_models": "/models/unload",
            "get_models": "/models"
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
