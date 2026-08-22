// MongoDB Schema Definitions
// This file defines the schemas for all MongoDB collections

const { Schema } = require('mongoose');

// Raw Conversations Schema
const rawConversationsSchema = new Schema({
  text: {
    type: String,
    required: true,
    index: 'text'
  },
  source: {
    type: String,
    required: true,
    enum: ['reddit', 'appstore', 'youtube'],
    index: true
  },
  sentiment: {
    type: String,
    required: true,
    enum: ['positive', 'neutral', 'negative'],
    index: true
  },
  hesitation_driver: {
    type: String,
    required: true,
    enum: ['fit_sizing', 'product_styling', 'social_validation', 'visual_reality', 'price_value'],
    index: true
  },
  entities: [{
    text: String,
    label: {
      type: String,
      enum: ['BRAND', 'CATEGORY', 'COLOR', 'SIZE', 'OCCASION']
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    }
  }],
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  author: {
    type: String,
    required: true
  },
  source_url: String,
  upvotes: {
    type: Number,
    default: 0
  },
  replies: {
    type: Number,
    default: 0
  },
  processed: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 2592000 // TTL: 30 days
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes
rawConversationsSchema.index({ source: 1, timestamp: -1 });
rawConversationsSchema.index({ sentiment: 1, hesitation_driver: 1 });
rawConversationsSchema.index({ 'entities.label': 1 });

// User Journey Events Schema
const userJourneyEventsSchema = new Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  session_id: {
    type: String,
    required: true,
    index: true
  },
  event_type: {
    type: String,
    required: true,
    enum: [
      'product_view',
      'add_to_wishlist',
      'view_similar_products',
      'read_reviews',
      'add_to_cart',
      'checkout_initiated',
      'checkout_completed',
      'checkout_abandoned'
    ],
    index: true
  },
  product_id: String,
  product_name: String,
  category: String,
  brand: String,
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  device_info: {
    type: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop']
    },
    os: String,
    browser: String
  },
  location: {
    country: String,
    city: String
  },
  referrer: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 7776000 // TTL: 90 days
  }
});

// Compound indexes
userJourneyEventsSchema.index({ user_id: 1, timestamp: -1 });
userJourneyEventsSchema.index({ session_id: 1, timestamp: 1 });
userJourneyEventsSchema.index({ event_type: 1, timestamp: -1 });

// NLP Model Metrics Schema
const nlpModelMetricsSchema = new Schema({
  model_name: {
    type: String,
    required: true,
    index: true
  },
  model_version: {
    type: String,
    required: true
  },
  metric_date: {
    type: Date,
    required: true,
    index: true
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 1
  },
  precision: {
    type: Number,
    min: 0,
    max: 1
  },
  recall: {
    type: Number,
    min: 0,
    max: 1
  },
  f1_score: {
    type: Number,
    min: 0,
    max: 1
  },
  confusion_matrix: {
    type: Map,
    of: Number
  },
  inference_time_ms: {
    type: Number,
    required: true
  },
  total_predictions: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes
nlpModelMetricsSchema.index({ model_name: 1, metric_date: -1 });
nlpModelMetricsSchema.index({ model_name: 1, model_version: 1 });

// Aggregation Cache Schema
const aggregationCacheSchema = new Schema({
  cache_key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  service: {
    type: String,
    required: true,
    enum: ['analytics', 'nlp', 'ingestion'],
    index: true
  },
  endpoint: {
    type: String,
    required: true
  },
  parameters: {
    type: Map,
    of: Schema.Types.Mixed,
    default: {}
  },
  data: {
    type: Schema.Types.Mixed,
    required: true
  },
  expires_at: {
    type: Date,
    required: true,
    index: true,
    expires: 0 // TTL index
  },
  hit_count: {
    type: Number,
    default: 0
  },
  last_accessed: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes
aggregationCacheSchema.index({ service: 1, endpoint: 1 });
aggregationCacheSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Export schemas
module.exports = {
  rawConversationsSchema,
  userJourneyEventsSchema,
  nlpModelMetricsSchema,
  aggregationCacheSchema
};
