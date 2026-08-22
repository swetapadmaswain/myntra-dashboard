#!/usr/bin/env python3
"""
Elasticsearch Seed Data Script
This script inserts sample data into the conversations index for testing
"""

from elasticsearch import Elasticsearch
from datetime import datetime
import json

def seed_elasticsearch(host='localhost', port=9200, index_name='conversations'):
    """
    Seed Elasticsearch with sample conversation data
    """
    try:
        # Connect to Elasticsearch
        es = Elasticsearch([f'http://{host}:{port}'])
        
        # Test connection
        if not es.ping():
            raise ConnectionError("Could not connect to Elasticsearch")
        
        print("✓ Connected to Elasticsearch successfully")
        
        # Check if index exists
        if es.indices.exists(index=index_name):
            print(f"✓ Index '{index_name}' already exists")
        else:
            print(f"✗ Index '{index_name}' does not exist. Please create it first using the index mapping.")
            return False
        
        # Sample conversation data
        conversations = [
            {
                "text": "The sizing on this dress is completely off. I ordered a medium but it fits like a small. Very disappointed.",
                "source": "reddit",
                "sentiment": "negative",
                "hesitation_driver": "fit_sizing",
                "entities": [
                    {"text": "dress", "label": "CATEGORY", "confidence": 0.95},
                    {"text": "medium", "label": "SIZE", "confidence": 0.92},
                    {"text": "small", "label": "SIZE", "confidence": 0.90}
                ],
                "metadata": {
                    "subreddit": "r/IndianFashionAddicts",
                    "upvotes": 45
                },
                "timestamp": "2024-01-15T10:30:00Z",
                "author": "user123",
                "source_url": "https://reddit.com/r/IndianFashionAddicts/comments/abc123",
                "upvotes": 45,
                "replies": 12,
                "processed": True,
                "createdAt": "2024-01-15T10:30:00Z",
                "updatedAt": "2024-01-15T10:30:00Z"
            },
            {
                "text": "Great app but the return process is too complicated. Wish it was easier to return items that dont fit.",
                "source": "appstore",
                "sentiment": "neutral",
                "hesitation_driver": "product_styling",
                "entities": [
                    {"text": "app", "label": "CATEGORY", "confidence": 0.88}
                ],
                "metadata": {
                    "app_version": "4.2.1",
                    "device": "iPhone 14",
                    "rating": 3
                },
                "timestamp": "2024-01-15T14:20:00Z",
                "author": "user456",
                "source_url": "https://apps.apple.com/app/reviews",
                "upvotes": 0,
                "replies": 0,
                "processed": True,
                "createdAt": "2024-01-15T14:20:00Z",
                "updatedAt": "2024-01-15T14:20:00Z"
            },
            {
                "text": "I love the quality but the color looks different in person. Not sure if I should keep it or return it.",
                "source": "youtube",
                "sentiment": "neutral",
                "hesitation_driver": "visual_reality",
                "entities": [
                    {"text": "quality", "label": "CATEGORY", "confidence": 0.85},
                    {"text": "color", "label": "COLOR", "confidence": 0.92}
                ],
                "metadata": {
                    "video_id": "xyz789",
                    "video_title": "Myntra Haul 2024",
                    "channel": "FashionWithYou"
                },
                "timestamp": "2024-01-15T16:45:00Z",
                "author": "user789",
                "source_url": "https://youtube.com/watch?v=xyz789",
                "upvotes": 234,
                "replies": 45,
                "processed": True,
                "createdAt": "2024-01-15T16:45:00Z",
                "updatedAt": "2024-01-15T16:45:00Z"
            },
            {
                "text": "The fabric quality is amazing for the price! Definitely recommend this to anyone looking for budget-friendly options.",
                "source": "reddit",
                "sentiment": "positive",
                "hesitation_driver": "price_value",
                "entities": [
                    {"text": "fabric", "label": "CATEGORY", "confidence": 0.89},
                    {"text": "price", "label": "CATEGORY", "confidence": 0.87}
                ],
                "metadata": {
                    "subreddit": "r/myntra",
                    "upvotes": 89
                },
                "timestamp": "2024-01-15T09:15:00Z",
                "author": "user101",
                "source_url": "https://reddit.com/r/myntra/comments/def456",
                "upvotes": 89,
                "replies": 23,
                "processed": True,
                "createdAt": "2024-01-15T09:15:00Z",
                "updatedAt": "2024-01-15T09:15:00Z"
            },
            {
                "text": "My friends said this brand is trending but Im not sure if it will look good on me. Need more opinions.",
                "source": "reddit",
                "sentiment": "neutral",
                "hesitation_driver": "social_validation",
                "entities": [
                    {"text": "brand", "label": "BRAND", "confidence": 0.82}
                ],
                "metadata": {
                    "subreddit": "r/fashionreps",
                    "upvotes": 12
                },
                "timestamp": "2024-01-15T11:00:00Z",
                "author": "user202",
                "source_url": "https://reddit.com/r/fashionreps/comments/ghi789",
                "upvotes": 12,
                "replies": 8,
                "processed": True,
                "createdAt": "2024-01-15T11:00:00Z",
                "updatedAt": "2024-01-15T11:00:00Z"
            },
            {
                "text": "The sizing chart is confusing. Ordered XL based on measurements but it was way too big.",
                "source": "appstore",
                "sentiment": "negative",
                "hesitation_driver": "fit_sizing",
                "entities": [
                    {"text": "XL", "label": "SIZE", "confidence": 0.94}
                ],
                "metadata": {
                    "app_version": "4.2.0",
                    "device": "Samsung Galaxy S23",
                    "rating": 2
                },
                "timestamp": "2024-01-15T13:30:00Z",
                "author": "user303",
                "source_url": "https://apps.apple.com/app/reviews",
                "upvotes": 0,
                "replies": 0,
                "processed": True,
                "createdAt": "2024-01-15T13:30:00Z",
                "updatedAt": "2024-01-15T13:30:00Z"
            },
            {
                "text": "Stylish and comfortable! Perfect for office wear. Will definitely buy more from this collection.",
                "source": "youtube",
                "sentiment": "positive",
                "hesitation_driver": "product_styling",
                "entities": [
                    {"text": "office", "label": "OCCASION", "confidence": 0.91}
                ],
                "metadata": {
                    "video_id": "abc456",
                    "video_title": "Office Wear Haul",
                    "channel": "StyleDiaries"
                },
                "timestamp": "2024-01-15T15:20:00Z",
                "author": "user404",
                "source_url": "https://youtube.com/watch?v=abc456",
                "upvotes": 567,
                "replies": 89,
                "processed": True,
                "createdAt": "2024-01-15T15:20:00Z",
                "updatedAt": "2024-01-15T15:20:00Z"
            },
            {
                "text": "The photos dont do justice. The actual color is much brighter than shown. Pleasantly surprised!",
                "source": "reddit",
                "sentiment": "positive",
                "hesitation_driver": "visual_reality",
                "entities": [
                    {"text": "color", "label": "COLOR", "confidence": 0.93}
                ],
                "metadata": {
                    "subreddit": "r/IndianFashionAddicts",
                    "upvotes": 34
                },
                "timestamp": "2024-01-15T12:45:00Z",
                "author": "user505",
                "source_url": "https://reddit.com/r/IndianFashionAddicts/comments/jkl012",
                "upvotes": 34,
                "replies": 15,
                "processed": True,
                "createdAt": "2024-01-15T12:45:00Z",
                "updatedAt": "2024-01-15T12:45:00Z"
            }
        ]
        
        # Bulk insert documents
        print(f"\n--- Inserting {len(conversations)} documents ---")
        from elasticsearch.helpers import bulk
        
        actions = [
            {
                "_index": index_name,
                "_op_type": "index",
                "_id": f"doc_{i}",
                "_source": doc
            }
            for i, doc in enumerate(conversations)
        ]
        
        success, failed = bulk(es, actions)
        
        print(f"✓ Successfully inserted {success} documents")
        if failed:
            print(f"✗ Failed to insert {len(failed)} documents")
            for item in failed:
                print(f"  Error: {item}")
        
        # Refresh index
        es.indices.refresh(index=index_name)
        print("✓ Index refreshed")
        
        # Verify count
        count = es.count(index=index_name)
        print(f"\n✓ Total documents in '{index_name}': {count['count']}")
        
        print("\n" + "="*50)
        print("Elasticsearch seed data completed successfully!")
        print("="*50)
        
        return True
        
    except ConnectionError as e:
        print(f"✗ Failed to connect to Elasticsearch: {e}")
        return False
    except Exception as e:
        print(f"✗ Error during seeding: {e}")
        return False

if __name__ == '__main__':
    import sys
    
    # Parse command line arguments
    host = sys.argv[1] if len(sys.argv) > 1 else 'localhost'
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 9200
    index_name = sys.argv[3] if len(sys.argv) > 3 else 'conversations'
    
    print(f"Seeding Elasticsearch at {host}:{port} (index: {index_name})")
    print("="*50)
    
    success = seed_elasticsearch(host, port, index_name)
    
    sys.exit(0 if success else 1)
