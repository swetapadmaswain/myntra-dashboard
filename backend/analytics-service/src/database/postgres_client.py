"""
PostgreSQL Client
Database client for PostgreSQL operations
"""

import psycopg2
import psycopg2.extras
from psycopg2 import pool
from typing import List, Dict, Any, Optional
from contextlib import contextmanager
import logging

from ..config.settings import settings

logger = logging.getLogger(__name__)


class PostgreSQLClient:
    """PostgreSQL database client with connection pooling"""
    
    def __init__(self):
        """Initialize PostgreSQL client"""
        self.connection_pool = None
        self._initialize_pool()
    
    def _initialize_pool(self) -> None:
        """Initialize connection pool"""
        try:
            self.connection_pool = psycopg2.pool.ThreadedConnectionPool(
                minconn=1,
                maxconn=10,
                host=settings.postgres_host,
                port=settings.postgres_port,
                database=settings.postgres_db,
                user=settings.postgres_user,
                password=settings.postgres_password,
                sslmode=settings.postgres_sslmode
            )
            logger.info("PostgreSQL connection pool initialized")
        except Exception as e:
            logger.error(f"Failed to initialize PostgreSQL pool: {e}")
            raise
    
    @contextmanager
    def get_connection(self):
        """
        Get a connection from the pool
        
        Yields:
            PostgreSQL connection
        """
        if not self.connection_pool:
            self._initialize_pool()
        
        conn = self.connection_pool.getconn()
        try:
            yield conn
        finally:
            self.connection_pool.putconn(conn)
    
    def execute_query(self, query: str, params: Optional[tuple] = None) -> List[Dict[str, Any]]:
        """
        Execute a SELECT query and return results
        
        Args:
            query: SQL query
            params: Query parameters
            
        Returns:
            List of result dictionaries
        """
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                cursor.execute(query, params or ())
                results = cursor.fetchall()
                return [dict(row) for row in results]
    
    def execute_update(self, query: str, params: Optional[tuple] = None) -> int:
        """
        Execute an INSERT/UPDATE/DELETE query
        
        Args:
            query: SQL query
            params: Query parameters
            
        Returns:
            Number of affected rows
        """
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params or ())
                conn.commit()
                return cursor.rowcount
    
    def execute_batch(self, query: str, params_list: List[tuple]) -> int:
        """
        Execute a batch of INSERT/UPDATE/DELETE queries
        
        Args:
            query: SQL query
            params_list: List of parameter tuples
            
        Returns:
            Number of affected rows
        """
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.executemany(query, params_list)
                conn.commit()
                return cursor.rowcount
    
    def close_pool(self) -> None:
        """Close the connection pool"""
        if self.connection_pool:
            self.connection_pool.closeall()
            logger.info("PostgreSQL connection pool closed")


# Global PostgreSQL client instance
postgres_client = PostgreSQLClient()
