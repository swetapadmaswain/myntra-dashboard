// MongoDB Initialization Script
// This script sets up the initial MongoDB collections and indexes

db = db.getSiblingDB('myntra_dashboard');

// Create raw_conversations collection
db.createCollection('raw_conversations');

// Create indexes for raw_conversations
db.raw_conversations.createIndex({ source: 1 });
db.raw_conversations.createIndex({ timestamp: -1 });
db.raw_conversations.createIndex({ sentiment: 1 });
db.raw_conversations.createIndex({ hesitation_driver: 1 });
db.raw_conversations.createIndex({ 'entities.label': 1 });
db.raw_conversations.createIndex({ source: 1, timestamp: -1 });
db.raw_conversations.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // TTL: 30 days

// Create user_journey_events collection
db.createCollection('user_journey_events');

// Create indexes for user_journey_events
db.user_journey_events.createIndex({ user_id: 1 });
db.user_journey_events.createIndex({ timestamp: -1 });
db.user_journey_events.createIndex({ event_type: 1 });
db.user_journey_events.createIndex({ user_id: 1, timestamp: -1 });
db.user_journey_events.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // TTL: 90 days

// Create nlp_model_metrics collection
db.createCollection('nlp_model_metrics');

// Create indexes for nlp_model_metrics
db.nlp_model_metrics.createIndex({ model_name: 1 });
db.nlp_model_metrics.createIndex({ timestamp: -1 });
db.nlp_model_metrics.createIndex({ model_name: 1, timestamp: -1 });

// Create aggregation_cache collection
db.createCollection('aggregation_cache');

// Create indexes for aggregation_cache
db.aggregation_cache.createIndex({ cache_key: 1 }, { unique: true });
db.aggregation_cache.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Insert sample data for testing
db.raw_conversations.insertMany([
  {
    source: 'reddit',
    text: 'The sizing on this dress is completely off. I ordered a medium but it fits like a small.',
    sentiment: 'negative',
    hesitation_driver: 'fit_sizing',
    entities: [
      { text: 'dress', label: 'CATEGORY' },
      { text: 'medium', label: 'SIZE' },
      { text: 'small', label: 'SIZE' }
    ],
    timestamp: new Date('2024-01-15'),
    author: 'user123',
    createdAt: new Date()
  },
  {
    source: 'appstore',
    text: 'Great app but the return process is too complicated. Wish it was easier.',
    sentiment: 'neutral',
    hesitation_driver: 'styling_wardrobe',
    entities: [
      { text: 'app', label: 'CATEGORY' }
    ],
    timestamp: new Date('2024-01-15'),
    author: 'user456',
    createdAt: new Date()
  },
  {
    source: 'youtube',
    text: 'I love the quality but the color looks different in person. Not sure if I should keep it.',
    sentiment: 'neutral',
    hesitation_driver: 'visual_reality',
    entities: [
      { text: 'quality', label: 'CATEGORY' },
      { text: 'color', label: 'COLOR' }
    ],
    timestamp: new Date('2024-01-15'),
    author: 'user789',
    createdAt: new Date()
  }
]);

print('MongoDB initialization completed successfully');
