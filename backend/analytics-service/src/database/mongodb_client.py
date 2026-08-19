"""
MongoDB Client
Database client for MongoDB operations
"""

from pymongo import MongoClient
from pymongo.collection import Collection
from typing import List, Dict, Any, Optional
import logging

from ..config.settings import settings

logger = logging.getLogger(__name__)


class MongoDBClient:
    """MongoDB database client"""
    
    def __init__(self):
        """Initialize MongoDB client"""
        self.client = None
        self.db = None
        self._initialize_client()
    
    def _initialize_client(self) -> None:
        """Initialize MongoDB client"""
        try:
            connection_string = f"mongodb://{settings.mongodb_user}:{settings.mongodb_password}@{settings.mongodb_host}:{settings.mongodb_port}/{settings.mongodb_db}?authSource=admin"
            self.client = MongoClient(connection_string)
            self.db = self.client[settings.mongodb_db]
            logger.info("MongoDB client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize MongoDB client: {e}")
            raise
    
    def get_collection(self, collection_name: str) -> Collection:
        """
        Get a MongoDB collection
        
        Args:
            collection_name: Name of the collection
            
        Returns:
            MongoDB collection
        """
        if self.db is None:
            self._initialize_client()
        return self.db[collection_name]
    
    def find(self, collection_name: str, query: Optional[Dict] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Find documents in a collection
        
        Args:
            collection_name: Name of the collection
            query: Query filter
            limit: Maximum number of documents to return
            
        Returns:
            List of documents
        """
        collection = self.get_collection(collection_name)
        cursor = collection.find(query or {})
        if limit:
            cursor = cursor.limit(limit)
        return list(cursor)
    
    def find_one(self, collection_name: str, query: Dict) -> Optional[Dict[str, Any]]:
        """
        Find a single document in a collection
        
        Args:
            collection_name: Name of the collection
            query: Query filter
            
        Returns:
            Document or None
        """
        collection = self.get_collection(collection_name)
        return collection.find_one(query)
    
    def insert_one(self, collection_name: str, document: Dict) -> str:
        """
        Insert a single document
        
        Args:
            collection_name: Name of the collection
            document: Document to insert
            
        Returns:
            Inserted document ID
        """
        collection = self.get_collection(collection_name)
        result = collection.insert_one(document)
        return str(result.inserted_id)
    
    def insert_many(self, collection_name: str, documents: List[Dict]) -> List[str]:
        """
        Insert multiple documents
        
        Args:
            collection_name: Name of the collection
            documents: List of documents to insert
            
        Returns:
            List of inserted document IDs
        """
        collection = self.get_collection(collection_name)
        result = collection.insert_many(documents)
        return [str(id) for id in result.inserted_ids]
    
    def update_one(self, collection_name: str, query: Dict, update: Dict) -> int:
        """
        Update a single document
        
        Args:
            collection_name: Name of the collection
            query: Query filter
            update: Update operation
            
        Returns:
            Number of documents modified
        """
        collection = self.get_collection(collection_name)
        result = collection.update_one(query, update)
        return result.modified_count
    
    def update_many(self, collection_name: str, query: Dict, update: Dict) -> int:
        """
        Update multiple documents
        
        Args:
            collection_name: Name of the collection
            query: Query filter
            update: Update operation
            
        Returns:
            Number of documents modified
        """
        collection = self.get_collection(collection_name)
        result = collection.update_many(query, update)
        return result.modified_count
    
    def aggregate(self, collection_name: str, pipeline: List[Dict]) -> List[Dict[str, Any]]:
        """
        Perform aggregation pipeline
        
        Args:
            collection_name: Name of the collection
            pipeline: Aggregation pipeline
            
        Returns:
            List of aggregation results
        """
        collection = self.get_collection(collection_name)
        return list(collection.aggregate(pipeline))
    
    def count(self, collection_name: str, query: Optional[Dict] = None) -> int:
        """
        Count documents in a collection
        
        Args:
            collection_name: Name of the collection
            query: Query filter
            
        Returns:
            Number of documents
        """
        collection = self.get_collection(collection_name)
        return collection.count_documents(query or {})
    
    def delete_one(self, collection_name: str, query: Dict) -> int:
        """
        Delete a single document
        
        Args:
            collection_name: Name of the collection
            query: Query filter
            
        Returns:
            Number of documents deleted
        """
        collection = self.get_collection(collection_name)
        result = collection.delete_one(query)
        return result.deleted_count
    
    def close(self) -> None:
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")


# Global MongoDB client instance
mongodb_client = MongoDBClient()
