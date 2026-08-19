export interface Snippet {
  text: string;
  source: string;
  sentiment: string | null;
  hesitation_driver: string | null;
  entities: { text: string; label: string; confidence: number }[];
  metadata: Record<string, any>;
  timestamp: string;
  author: string;
  source_url: string;
  upvotes: number;
  replies: number;
  processed: boolean;
}

export interface KPIMetrics {
  total_snippets: number;
  avg_sentiment_score: number;
  top_friction_driver: string;
  top_intent: string;
  snippet_growth_rate: number;
}

export interface FilterState {
  source: string | null;
  sentiment: string | null;
  hesitation_driver: string | null;
  searchQuery: string;
  page: number;
  limit: number;
}

export type TabKey = 'friction' | 'intent' | 'journey' | 'opportunity';
