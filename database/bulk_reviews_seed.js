db = db.getSiblingDB('myntra_dashboard');

const now = Date.now();
const total = 4000;
const batchSize = 1000;

const sources = ['appstore', 'youtube', 'reddit'];
const sentiments = ['positive', 'neutral', 'negative'];
const frictionTypes = ['fit_sizing', 'product_styling', 'social_validation', 'visual_reality', 'price_value'];
const intents = ['research', 'bookmarking', 'immediate_purchase', 'comparison'];

const reviewTemplates = [
  'The product looks good but I am not sure about the material quality.',
  'Really disappointed with the sizing. It is completely off.',
  'Loved the color but the image looked different in real life.',
  'Great value for money. Highly recommended.',
  'Not sure how to style this item with my existing wardrobe.',
  'The fit is perfect and the fabric is soft.',
  'I added this to my wishlist but I do not know how to style it.',
  'Price is too high for what you get.',
  'Need more customer photos before I decide.',
  'My friends were right, this brand is amazing.',
  'The dress is shorter than it looks online.',
  'Wish the checkout process was smoother.',
  'Confused about the size chart, need clearer guidance.',
  'The product is exactly as shown. Very happy.',
  'I keep comparing this with another brand and cannot decide.',
  'Shipping was fast but the packaging was damaged.',
  'Not many reviews for this product yet, feeling unsure.',
  'The quality is excellent for the price.',
  'Cannot figure out which size will fit me best.',
  'The product is nice but the color faded after one wash.',
  'Will this go with jeans or should I buy trousers?',
  'I saw an influencer wearing this and now I want it.',
  'The item is out of stock in my size, frustrating.',
  'The return policy is making me hesitate.',
  'Beautiful design but the sleeves are too long.',
  'I need styling tips for this top.',
  'The material is see-through, not worth it.',
  'This is my third purchase from this brand, love it.',
  'The photo looks premium but the actual product looks cheap.',
  'I want to buy this now but I am worried about the fit.'
];

const entitiesByFriction = {
  fit_sizing: [{ text: 'size', label: 'CATEGORY', confidence: 0.9 }],
  product_styling: [{ text: 'outfit', label: 'CATEGORY', confidence: 0.88 }],
  social_validation: [{ text: 'brand', label: 'BRAND', confidence: 0.82 }],
  visual_reality: [{ text: 'color', label: 'COLOR', confidence: 0.92 }],
  price_value: [{ text: 'price', label: 'CATEGORY', confidence: 0.87 }]
};

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateReview(i) {
  const friction = randomItem(frictionTypes);
  const source = randomItem(sources);
  const sentiment = randomItem(sentiments);
  const intent = randomItem(intents);
  const baseText = reviewTemplates[i % reviewTemplates.length];
  const ts = new Date(now - i * 1000); // 1 second apart, all very recent
  return {
    text: baseText,
    source,
    sentiment,
    hesitation_driver: friction,
    intent,
    entities: entitiesByFriction[friction],
    metadata: { review_id: 'bulk_' + i, source_id: source },
    timestamp: ts,
    author: 'user_bulk_' + i,
    source_url: '',
    upvotes: Math.floor(Math.random() * 200),
    replies: Math.floor(Math.random() * 50),
    processed: true,
    createdAt: ts
  };
}

for (let batch = 0; batch < total / batchSize; batch++) {
  const batchDocs = [];
  for (let i = 0; i < batchSize; i++) {
    const idx = batch * batchSize + i;
    batchDocs.push(generateReview(idx));
  }
  db.raw_conversations.insertMany(batchDocs);
  print('Inserted batch ' + (batch + 1) + ' of ' + (total / batchSize));
}

print('Seeded ' + total + ' real-time reviews');
