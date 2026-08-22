// MongoDB Seed Data
// This script inserts sample data for testing

db = db.getSiblingDB('myntra_dashboard');

// Insert sample raw conversations
db.raw_conversations.insertMany([
  {
    text: 'The sizing on this dress is completely off. I ordered a medium but it fits like a small. Very disappointed.',
    source: 'reddit',
    sentiment: 'negative',
    hesitation_driver: 'fit_sizing',
    entities: [
      { text: 'dress', label: 'CATEGORY', confidence: 0.95 },
      { text: 'medium', label: 'SIZE', confidence: 0.92 },
      { text: 'small', label: 'SIZE', confidence: 0.90 }
    ],
    metadata: {
      subreddit: 'r/IndianFashionAddicts',
      upvotes: 45
    },
    timestamp: new Date('2024-01-15T10:30:00Z'),
    author: 'user123',
    source_url: 'https://reddit.com/r/IndianFashionAddicts/comments/abc123',
    upvotes: 45,
    replies: 12,
    processed: true,
    createdAt: new Date()
  },
  {
    text: 'Great app but the return process is too complicated. Wish it was easier to return items that dont fit.',
    source: 'appstore',
    sentiment: 'neutral',
    hesitation_driver: 'styling_wardrobe',
    entities: [
      { text: 'app', label: 'CATEGORY', confidence: 0.88 }
    ],
    metadata: {
      app_version: '4.2.1',
      device: 'iPhone 14',
      rating: 3
    },
    timestamp: new Date('2024-01-15T14:20:00Z'),
    author: 'user456',
    source_url: 'https://apps.apple.com/app/reviews',
    upvotes: 0,
    replies: 0,
    processed: true,
    createdAt: new Date()
  },
  {
    text: 'I love the quality but the color looks different in person. Not sure if I should keep it or return it.',
    source: 'youtube',
    sentiment: 'neutral',
    hesitation_driver: 'visual_reality',
    entities: [
      { text: 'quality', label: 'CATEGORY', confidence: 0.85 },
      { text: 'color', label: 'COLOR', confidence: 0.92 }
    ],
    metadata: {
      video_id: 'xyz789',
      video_title: 'Myntra Haul 2024',
      channel: 'FashionWithYou'
    },
    timestamp: new Date('2024-01-15T16:45:00Z'),
    author: 'user789',
    source_url: 'https://youtube.com/watch?v=xyz789',
    upvotes: 234,
    replies: 45,
    processed: true,
    createdAt: new Date()
  },
  {
    text: 'The fabric quality is amazing for the price! Definitely recommend this to anyone looking for budget-friendly options.',
    source: 'reddit',
    sentiment: 'positive',
    hesitation_driver: 'price_value',
    entities: [
      { text: 'fabric', label: 'CATEGORY', confidence: 0.89 },
      { text: 'price', label: 'CATEGORY', confidence: 0.87 }
    ],
    metadata: {
      subreddit: 'r/myntra',
      upvotes: 89
    },
    timestamp: new Date('2024-01-15T09:15:00Z'),
    author: 'user101',
    source_url: 'https://reddit.com/r/myntra/comments/def456',
    upvotes: 89,
    replies: 23,
    processed: true,
    createdAt: new Date()
  },
  {
    text: 'My friends said this brand is trending but Im not sure if it will look good on me. Need more opinions.',
    source: 'reddit',
    sentiment: 'neutral',
    hesitation_driver: 'social_validation',
    entities: [
      { text: 'brand', label: 'BRAND', confidence: 0.82 }
    ],
    metadata: {
      subreddit: 'r/fashionreps',
      upvotes: 12
    },
    timestamp: new Date('2024-01-15T11:00:00Z'),
    author: 'user202',
    source_url: 'https://reddit.com/r/fashionreps/comments/ghi789',
    upvotes: 12,
    replies: 8,
    processed: true,
    createdAt: new Date()
  },
  {
    text: 'The sizing chart is confusing. Ordered XL based on measurements but it was way too big.',
    source: 'appstore',
    sentiment: 'negative',
    hesitation_driver: 'fit_sizing',
    entities: [
      { text: 'XL', label: 'SIZE', confidence: 0.94 }
    ],
    metadata: {
      app_version: '4.2.0',
      device: 'Samsung Galaxy S23',
      rating: 2
    },
    timestamp: new Date('2024-01-15T13:30:00Z'),
    author: 'user303',
    source_url: 'https://apps.apple.com/app/reviews',
    upvotes: 0,
    replies: 0,
    processed: true,
    createdAt: new Date()
  },
  {
    text: 'Stylish and comfortable! Perfect for office wear. Will definitely buy more from this collection.',
    source: 'youtube',
    sentiment: 'positive',
    hesitation_driver: 'styling_wardrobe',
    entities: [
      { text: 'office', label: 'OCCASION', confidence: 0.91 }
    ],
    metadata: {
      video_id: 'abc456',
      video_title: 'Office Wear Haul',
      channel: 'StyleDiaries'
    },
    timestamp: new Date('2024-01-15T15:20:00Z'),
    author: 'user404',
    source_url: 'https://youtube.com/watch?v=abc456',
    upvotes: 567,
    replies: 89,
    processed: true,
    createdAt: new Date()
  },
  {
    text: 'The photos dont do justice. The actual color is much brighter than shown. Pleasantly surprised!',
    source: 'reddit',
    sentiment: 'positive',
    hesitation_driver: 'visual_reality',
    entities: [
      { text: 'color', label: 'COLOR', confidence: 0.93 }
    ],
    metadata: {
      subreddit: 'r/IndianFashionAddicts',
      upvotes: 34
    },
    timestamp: new Date('2024-01-15T12:45:00Z'),
    author: 'user505',
    source_url: 'https://reddit.com/r/IndianFashionAddicts/comments/jkl012',
    upvotes: 34,
    replies: 15,
    processed: true,
    createdAt: new Date()
  },
  {
    text: 'I added this jacket to my wishlist but I have no idea how to style it for an evening out. Outfit tips would help so much.',
    source: 'appstore',
    sentiment: 'neutral',
    hesitation_driver: 'wishlist_styling',
    entities: [
      { text: 'jacket', label: 'CATEGORY', confidence: 0.91 },
      { text: 'evening', label: 'OCCASION', confidence: 0.85 }
    ],
    metadata: {
      app_version: '4.2.1',
      device: 'iPhone 14',
      rating: 3
    },
    timestamp: new Date('2024-01-15T17:00:00Z'),
    author: 'user606',
    source_url: 'https://apps.apple.com/app/reviews',
    upvotes: 0,
    replies: 0,
    processed: true,
    createdAt: new Date()
  },
  {
    text: 'Wishlisted these jeans but not sure what top to pair them with. Need styling inspiration before I buy.',
    source: 'reddit',
    sentiment: 'neutral',
    hesitation_driver: 'wishlist_styling',
    entities: [
      { text: 'jeans', label: 'CATEGORY', confidence: 0.93 },
      { text: 'top', label: 'CATEGORY', confidence: 0.88 }
    ],
    metadata: {
      subreddit: 'r/IndianFashionAddicts',
      upvotes: 28
    },
    timestamp: new Date('2024-01-15T17:30:00Z'),
    author: 'user707',
    source_url: 'https://reddit.com/r/IndianFashionAddicts/comments/mno345',
    upvotes: 28,
    replies: 9,
    processed: true,
    createdAt: new Date()
  },
  {
    text: 'I keep saving items to my wishlist but I never know how to actually wear them. Would love lookbook suggestions.',
    source: 'youtube',
    sentiment: 'neutral',
    hesitation_driver: 'wishlist_styling',
    entities: [
      { text: 'lookbook', label: 'CATEGORY', confidence: 0.87 }
    ],
    metadata: {
      video_id: 'def789',
      video_title: 'Myntra Wishlist Woes',
      channel: 'StyleDiaries'
    },
    timestamp: new Date('2024-01-15T18:00:00Z'),
    author: 'user808',
    source_url: 'https://youtube.com/watch?v=def789',
    upvotes: 150,
    replies: 42,
    processed: true,
    createdAt: new Date()
  },
  {
    text: 'There is this dress in my wishlist but I do not know what accessories or shoes will go with it. Styling guidance missing.',
    source: 'appstore',
    sentiment: 'negative',
    hesitation_driver: 'wishlist_styling',
    entities: [
      { text: 'dress', label: 'CATEGORY', confidence: 0.95 },
      { text: 'accessories', label: 'CATEGORY', confidence: 0.86 }
    ],
    metadata: {
      app_version: '4.2.0',
      device: 'Samsung Galaxy S23',
      rating: 2
    },
    timestamp: new Date('2024-01-15T17:20:00Z'),
    author: 'user909',
    source_url: 'https://apps.apple.com/app/reviews',
    upvotes: 0,
    replies: 0,
    processed: true,
    createdAt: new Date()
  }
]);

// Insert sample user journey events
db.user_journey_events.insertMany([
  {
    user_id: 'user_001',
    session_id: 'session_abc123',
    event_type: 'product_view',
    product_id: 'prod_123',
    product_name: 'Floral Print Dress',
    category: 'Dresses',
    brand: 'Myntra',
    metadata: {
      view_duration: 45
    },
    timestamp: new Date('2024-01-15T10:00:00Z'),
    device_info: {
      type: 'mobile',
      os: 'iOS',
      browser: 'Safari'
    },
    location: {
      country: 'India',
      city: 'Mumbai'
    },
    referrer: 'direct',
    createdAt: new Date()
  },
  {
    user_id: 'user_001',
    session_id: 'session_abc123',
    event_type: 'add_to_wishlist',
    product_id: 'prod_123',
    product_name: 'Floral Print Dress',
    category: 'Dresses',
    brand: 'Myntra',
    metadata: {},
    timestamp: new Date('2024-01-15T10:02:00Z'),
    device_info: {
      type: 'mobile',
      os: 'iOS',
      browser: 'Safari'
    },
    location: {
      country: 'India',
      city: 'Mumbai'
    },
    referrer: '',
    createdAt: new Date()
  },
  {
    user_id: 'user_001',
    session_id: 'session_abc123',
    event_type: 'view_similar_products',
    product_id: 'prod_124',
    product_name: 'Floral Print Dress - Blue',
    category: 'Dresses',
    brand: 'Myntra',
    metadata: {
      similar_count: 5
    },
    timestamp: new Date('2024-01-15T10:05:00Z'),
    device_info: {
      type: 'mobile',
      os: 'iOS',
      browser: 'Safari'
    },
    location: {
      country: 'India',
      city: 'Mumbai'
    },
    referrer: '',
    createdAt: new Date()
  },
  {
    user_id: 'user_001',
    session_id: 'session_abc123',
    event_type: 'read_reviews',
    product_id: 'prod_123',
    product_name: 'Floral Print Dress',
    category: 'Dresses',
    brand: 'Myntra',
    metadata: {
      reviews_read: 8
    },
    timestamp: new Date('2024-01-15T10:10:00Z'),
    device_info: {
      type: 'mobile',
      os: 'iOS',
      browser: 'Safari'
    },
    location: {
      country: 'India',
      city: 'Mumbai'
    },
    referrer: '',
    createdAt: new Date()
  },
  {
    user_id: 'user_001',
    session_id: 'session_abc123',
    event_type: 'add_to_cart',
    product_id: 'prod_123',
    product_name: 'Floral Print Dress',
    category: 'Dresses',
    brand: 'Myntra',
    metadata: {
      quantity: 1,
      size: 'M'
    },
    timestamp: new Date('2024-01-15T10:15:00Z'),
    device_info: {
      type: 'mobile',
      os: 'iOS',
      browser: 'Safari'
    },
    location: {
      country: 'India',
      city: 'Mumbai'
    },
    referrer: '',
    createdAt: new Date()
  },
  {
    user_id: 'user_001',
    session_id: 'session_abc123',
    event_type: 'checkout_completed',
    product_id: 'prod_123',
    product_name: 'Floral Print Dress',
    category: 'Dresses',
    brand: 'Myntra',
    metadata: {
      order_value: 1499,
      payment_method: 'UPI'
    },
    timestamp: new Date('2024-01-15T10:20:00Z'),
    device_info: {
      type: 'mobile',
      os: 'iOS',
      browser: 'Safari'
    },
    location: {
      country: 'India',
      city: 'Mumbai'
    },
    referrer: '',
    createdAt: new Date()
  }
]);

// Insert sample NLP model metrics
db.nlp_model_metrics.insertMany([
  {
    model_name: 'sentiment_bert',
    model_version: '1.0.0',
    metric_date: new Date('2024-01-15'),
    accuracy: 0.87,
    precision: 0.85,
    recall: 0.89,
    f1_score: 0.87,
    confusion_matrix: {
      'true_positive': 450,
      'true_negative': 380,
      'false_positive': 65,
      'false_negative': 55
    },
    inference_time_ms: 45.2,
    total_predictions: 950,
    metadata: {
      training_dataset: 'fashion_reviews_v2',
      training_date: new Date('2024-01-10')
    },
    createdAt: new Date()
  },
  {
    model_name: 'intent_classifier',
    model_version: '1.0.0',
    metric_date: new Date('2024-01-15'),
    accuracy: 0.82,
    precision: 0.80,
    recall: 0.84,
    f1_score: 0.82,
    confusion_matrix: {
      'bookmarking': { 'correct': 320, 'incorrect': 45 },
      'immediate_purchase': { 'correct': 280, 'incorrect': 35 },
      'research': { 'correct': 190, 'incorrect': 30 },
      'comparison': { 'correct': 150, 'incorrect': 25 }
    },
    inference_time_ms: 62.8,
    total_predictions: 975,
    metadata: {
      training_dataset: 'user_journey_v1',
      training_date: new Date('2024-01-08')
    },
    createdAt: new Date()
  },
  {
    model_name: 'hesitation_detector',
    model_version: '1.0.0',
    metric_date: new Date('2024-01-15'),
    accuracy: 0.79,
    precision: 0.77,
    recall: 0.81,
    f1_score: 0.79,
    confusion_matrix: {
      'fit_sizing': { 'correct': 210, 'incorrect': 40 },
      'styling_wardrobe': { 'correct': 180, 'incorrect': 35 },
      'social_validation': { 'correct': 150, 'incorrect': 30 },
      'visual_reality': { 'correct': 165, 'incorrect': 35 },
      'price_value': { 'correct': 140, 'incorrect': 25 }
    },
    inference_time_ms: 78.5,
    total_predictions: 910,
    metadata: {
      training_dataset: 'hesitation_labels_v1',
      training_date: new Date('2024-01-05')
    },
    createdAt: new Date()
  }
]);

// Insert sample aggregation cache
db.aggregation_cache.insertMany([
  {
    cache_key: 'analytics:kpi_metrics:segment_all_timerange_30d',
    service: 'analytics',
    endpoint: 'kpi_metrics',
    parameters: {
      segment: 'all',
      time_range: '30d'
    },
    data: {
      total_signals: 12500,
      bookmarking_intent: 68.5,
      immediate_purchase_intent: 31.5,
      primary_hesitation_driver: 'fit_sizing',
      primary_hesitation_percentage: 24.3,
      information_leakage: 16.8
    },
    expires_at: new Date(Date.now() + 300000), // 5 minutes
    hit_count: 45,
    last_accessed: new Date(),
    createdAt: new Date()
  },
  {
    cache_key: 'analytics:friction_breakdown:segment_2_timerange_7d',
    service: 'analytics',
    endpoint: 'friction_breakdown',
    parameters: {
      segment: '2',
      time_range: '7d'
    },
    data: {
      friction_types: [
        { name: 'fit_sizing', percentage: 21.2, trend: 'neutral' },
        { name: 'styling_wardrobe', percentage: 24.5, trend: 'up' },
        { name: 'social_validation', percentage: 12.3, trend: 'down' }
      ]
    },
    expires_at: new Date(Date.now() + 300000), // 5 minutes
    hit_count: 23,
    last_accessed: new Date(),
    createdAt: new Date()
  }
]);

print('MongoDB seed data inserted successfully');
