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
  { x: 3, y: 8, z: 420, label: 'Improve size guide accuracy', description: 'Enhanced size charts with measurements and fit recommendations', quadrant: 'quick_wins', priority_score: 5.5, related_friction: 'fit_sizing', friction_percentage: 32 },
  { x: 6, y: 8, z: 380, label: 'Add user-generated fit photos', description: 'Show real customer photos with size information', quadrant: 'major_projects', priority_score: 3.8, related_friction: 'fit_sizing', friction_percentage: 32 },
  { x: 8, y: 9, z: 520, label: 'AR visualization', description: 'Augmented reality product visualization', quadrant: 'strategic_bets', priority_score: 3.9, related_friction: 'visual_reality', friction_percentage: 22 },
  { x: 7, y: 6, z: 180, label: 'Wardrobe integration', description: 'Allow users to build virtual wardrobes', quadrant: 'fill_ins', priority_score: 1.5, related_friction: 'product_styling', friction_percentage: 15 },
  { x: 4, y: 7, z: 310, label: 'Video content integration', description: 'Product videos and try-on demonstrations', quadrant: 'quick_wins', priority_score: 4.3, related_friction: 'visual_reality', friction_percentage: 22 },
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
