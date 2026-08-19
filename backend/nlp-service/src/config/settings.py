"""
Configuration settings for NLP Processing Service
Uses Pydantic for type-safe configuration management
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    app_name: str = "NLP Processing Service"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # PostgreSQL
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "myntra_dashboard"
    postgres_user: str = "myntra_user"
    postgres_password: str = "myntra_password"
    
    # MongoDB
    mongodb_host: str = "localhost"
    mongodb_port: int = 27017
    mongodb_user: str = "myntra_user"
    mongodb_password: str = "myntra_password"
    mongodb_db: str = "myntra_dashboard"
    
    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    redis_password: Optional[str] = None
    
    # Celery
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"
    
    # Model Configuration
    models_dir: str = "./models"
    device: str = "cpu"  # or "cuda" for GPU
    batch_size: int = 32
    max_sequence_length: int = 512
    
    # Model URLs (Hugging Face)
    sentiment_model: str = "bert-base-uncased"
    intent_model: str = "distilbert-base-uncased"
    entity_model: str = "en_core_web_sm"
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "json"
    
    # Monitoring
    enable_metrics: bool = True
    metrics_port: int = 9091
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()
