export const frictionMock = [
  { name: 'Price / Value', count: 320 },
  { name: 'Fit / Sizing', count: 245 },
  { name: 'Visual / Reality', count: 180 },
  { name: 'Styling / Wardrobe', count: 120 },
  { name: 'Social Validation', count: 90 },
];

export const intentMock = [
  { subject: 'Buy', A: 120, fullMark: 200 },
  { subject: 'Compare', A: 98, fullMark: 200 },
  { subject: 'Wishlist', A: 86, fullMark: 200 },
  { subject: 'Review', A: 65, fullMark: 200 },
  { subject: 'Search', A: 85, fullMark: 200 },
];

export const journeyMock = [
  { name: 'Search', users: 5000 },
  { name: 'Wishlist', users: 3200 },
  { name: 'Compare', users: 1800 },
  { name: 'Cart', users: 900 },
  { name: 'Purchase', users: 450 },
];

export const opportunityMock = [
  { x: 80, y: 20, z: 300, label: 'Price drop alerts' },
  { x: 60, y: 70, z: 200, label: 'Size guides' },
  { x: 30, y: 40, z: 150, label: 'AR try-on' },
  { x: 90, y: 85, z: 400, label: 'Wishlist share' },
  { x: 20, y: 60, z: 120, label: 'Reviews' },
];

export const snippetMock = [
  {
    text: 'I keep wishlisting items but the price never drops enough for me to buy.',
    source: 'appstore',
    sentiment: 'negative',
    hesitation_driver: 'price_value',
    entities: [],
    metadata: {},
    timestamp: '2024-05-01T00:00:00Z',
    author: 'user1',
    source_url: '',
    upvotes: 12,
    replies: 3,
    processed: true,
  },
  {
    text: 'Not sure if the dress will fit me. Sizing chart is confusing.',
    source: 'youtube',
    sentiment: 'neutral',
    hesitation_driver: 'fit_sizing',
    entities: [],
    metadata: {},
    timestamp: '2024-05-02T00:00:00Z',
    author: 'user2',
    source_url: '',
    upvotes: 45,
    replies: 8,
    processed: true,
  },
];
