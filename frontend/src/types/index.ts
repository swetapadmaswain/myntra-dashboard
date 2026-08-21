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
  total_signals: number;
  bookmarking_intent: number;
  immediate_purchase_intent: number;
  primary_hesitation_driver: string;
  primary_hesitation_percentage: number;
  information_leakage: number;
  sentiment_distribution: Record<string, number>;
  intent_distribution: Record<string, number>;
  hesitation_distribution: Record<string, number>;
  calculated_at: string;
}

export interface FrictionItem {
  name: string;
  count: number;
  percentage: number;
}

export interface FilterState {
  source: string | null;
  sentiment: string | null;
  hesitation_driver: string | null;
  searchQuery: string;
  page: number;
  limit: number;
}

export type TabKey = 'friction' | 'intent' | 'journey' | 'opportunity' | 'discovery';
