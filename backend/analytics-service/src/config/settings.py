"""
Configuration settings for Analytics Service
Uses Pydantic for type-safe configuration management
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    app_name: str = "Analytics Service"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8001
    
    # PostgreSQL
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "myntra_dashboard"
    postgres_user: str = "myntra_user"
    postgres_password: str = "myntra_password"
    postgres_sslmode: str = "prefer"
    
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
    
    # Analytics Configuration
    default_time_range: str = "30d"  # 30 days
    cache_ttl: int = 300  # 5 minutes
    batch_size: int = 1000
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "json"
    
    # Monitoring
    enable_metrics: bool = True
    metrics_port: int = 9092
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()
