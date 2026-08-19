# Wishlist AI Discovery Engine - Complete System Architecture

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Database Architecture](#database-architecture)
6. [Data Flow](#data-flow)
7. [Security](#security)
8. [Scalability](#scalability)
9. [Monitoring & Observability](#monitoring--observability)
10. [Deployment](#deployment)

---

## System Overview

Enterprise-grade Product Intelligence Dashboard for analyzing unstructured customer conversations from multi-channel sources (Reddit, App Store, YouTube) to identify purchase hesitation drivers for Myntra wishlist items.

### System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js App Router + React + Tailwind CSS + Recharts    │  │
│  │  - Dashboard UI Components                                │  │
│  │  - Interactive Charts & Visualizations                     │  │
│  │  - Real-time Data Streaming                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ REST API / WebSocket
                              │
┌─────────────────────────────────────────────────────────────────┐
│                         Backend Layer                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Gateway (Node.js/Express or FastAPI)                 │  │
│  │  - Request Routing & Authentication                       │  │
│  │  - Rate Limiting & Caching                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Data Ingestion Service                                   │  │
│  │  - Reddit API Scraper                                      │  │
│  │  - App Store Review Fetcher                                │  │
│  │  - YouTube Data API Consumer                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  NLP/ML Processing Service                                 │  │
│  │  - Sentiment Analysis (BERT/Transformers)                 │  │
│  │  - Intent Classification (Bookmarking vs Purchase)         │  │
│  │  - Hesitation Driver Detection                             │  │
│  │  - Entity Extraction (Brands, Categories, Fit issues)     │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Analytics & Aggregation Service                          │  │
│  │  - Real-time Metrics Calculation                          │  │
│  │  - Trend Analysis & Anomaly Detection                     │  │
│  │  - Segment-wise Aggregation                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ ORM / Query Builder
                              │
┌─────────────────────────────────────────────────────────────────┐
│                         Database Layer                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL (Relational Data)                              │  │
│  │  - User Segments & Metadata                               │  │
│  │  - Product Catalog & Categories                            │  │
│  │  - Aggregated Metrics & KPIs                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MongoDB (Document Store)                                 │  │
│  │  - Raw Conversational Snippets                            │  │
│  │  - NLP Analysis Results                                    │  │
│  │  - User Journey Events                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Redis (Caching & Real-time)                              │  │
│  │  - Session Management                                      │  │
│  │  - Real-time Dashboard Metrics                            │  │
│  │  - API Response Caching                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Elasticsearch (Search & Analytics)                      │  │
│  │  - Full-text Search on Snippets                           │  │
│  │  - Faceted Filtering (Source, Category, Sentiment)        │  │
│  │  - Aggregations for Charts                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.2+
- **React Version:** React 18.2+
- **Build Tool:** Turbopack (Next.js 14)
- **Styling:** Tailwind CSS 3.3+
- **Icons:** Lucide React 0.292+
- **Charts:** Recharts 2.8+
- **Animations:** Framer Motion 10.16+
- **State Management:** Zustand 4.4+
- **Server State:** TanStack Query (React Query) 5.12+
- **Form State:** React Hook Form 7.48+
- **HTTP Client:** Axios 1.6+
- **Testing:** Jest 29+, React Testing Library 14+, Playwright
- **Linting:** ESLint 8.55+, Prettier 3.1+

### Backend Stack
- **API Framework:** FastAPI (Python) + Express.js (Node.js Gateway)
- **Languages:** Python 3.11+ (ML/NLP) + Node.js 20+ (API Gateway)
- **Task Queue:** Celery with Redis broker
- **Async Runtime:** asyncio (Python) + libuv (Node.js)
- **ML Frameworks:** PyTorch 2.0+, TensorFlow 2.13+
- **NLP Libraries:** Transformers (Hugging Face), spaCy 3.6+, NLTK
- **Models:** BERT-base-uncased, RoBERTa, Custom fine-tuned classifiers
- **Vector Operations:** NumPy, Pandas, Scikit-learn
- **Data Validation:** Pydantic v2
- **API Documentation:** Swagger/OpenAPI

### Database Stack
- **PostgreSQL 15+:** Relational data, user segments, aggregated metrics
- **MongoDB 7+:** Document store for raw conversations, NLP results, journey events
- **Redis 7+:** Caching, session management, real-time metrics
- **Elasticsearch 8+:** Full-text search, aggregations, faceted filtering

### Infrastructure Stack
- **Containerization:** Docker & Docker Compose
- **Orchestration:** Kubernetes (production)
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **CDN:** CloudFront/Cloudflare

---

## Frontend Architecture

### Project Structure
```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Dashboard home page
│   │   ├── globals.css               # Global styles & Tailwind directives
│   │   └── api/                      # API routes (if needed for proxy)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx            # Top navigation bar
│   │   │   ├── Sidebar.tsx           # Optional sidebar navigation
│   │   │   ├── GlobalFilters.tsx     # Global filter dropdowns
│   │   │   └── DataSourceChips.tsx   # Data source ingestion chips
│   │   ├── dashboard/
│   │   │   ├── KPICards.tsx          # KPI metric cards (4 cards)
│   │   │   ├── TabNavigation.tsx     # Interactive tab navigation
│   │   │   ├── Tab1_FrictionBreakdown.tsx    # Root cause analysis
│   │   │   ├── Tab2_IntentMatrix.tsx         # Intent vs bookmarking
│   │   │   ├── Tab3_JourneyTracker.tsx      # External journey tracker
│   │   │   └── Tab4_OpportunityMatrix.tsx   # Impact vs effort matrix
│   │   ├── charts/
│   │   │   ├── FrictionBarChart.tsx  # Horizontal bar chart
│   │   │   ├── IntentRadarChart.tsx  # Radar chart for intent
│   │   │   ├── JourneyFlowChart.tsx  # Step visualization flow
│   │   │   ├── OpportunityScatterPlot.tsx   # Scatter plot
│   │   │   └── ChartTooltip.tsx      # Custom tooltip component
│   │   ├── snippets/
│   │   │   ├── SnippetFeed.tsx       # Scrolling snippet feed
│   │   │   ├── SnippetCard.tsx       # Individual snippet card
│   │   │   └── SnippetFilters.tsx    # Snippet filter controls
│   │   ├── tables/
│   │   │   ├── SegmentTable.tsx      # User segment breakdown table
│   │   │   └── TablePagination.tsx   # Pagination component
│   │   ├── ui/
│   │   │   ├── Button.tsx             # Reusable button component
│   │   │   ├── Dropdown.tsx           # Custom dropdown
│   │   │   ├── SearchBar.tsx          # Search input component
│   │   │   ├── Chip.tsx               # Chip/tag component
│   │   │   ├── Card.tsx               # Card container
│   │   │   ├── Badge.tsx              # Badge component
│   │   │   ├── Spinner.tsx            # Loading spinner
│   │   │   └── EmptyState.tsx         # Empty state component
│   │   └── common/
│   │       ├── Logo.tsx               # Myntra Growth logo
│   │       ├── ErrorBoundary.tsx     # Error boundary component
│   │       └── LoadingState.tsx      # Page loading state
│   ├── hooks/
│   │   ├── useDashboardData.ts       # Dashboard data fetching hook
│   │   ├── useSnippets.ts             # Snippets data hook
│   │   ├── useFilters.ts             # Filter state management
│   │   ├── useDebounce.ts            # Debounce hook for search
│   │   ├── useWebSocket.ts           # WebSocket connection hook
│   │   └── useBreakpoint.ts           # Responsive breakpoint hook
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts             # Axios/fetch client setup
│   │   │   ├── dashboard.ts          # Dashboard API endpoints
│   │   │   ├── snippets.ts           # Snippets API endpoints
│   │   │   └── analytics.ts          # Analytics API endpoints
│   │   ├── utils/
│   │   │   ├── formatters.ts         # Number/date formatters
│   │   │   ├── validators.ts         # Input validators
│   │   │   ├── colorUtils.ts         # Color manipulation utilities
│   │   │   └── chartUtils.ts         # Chart configuration helpers
│   │   ├── constants/
│   │   │   ├── colors.ts             # Myntra brand colors
│   │   │   ├── breakpoints.ts        # Responsive breakpoints
│   │   │   ├── routes.ts             # Route constants
│   │   │   └── mockData.ts           # Mock data for development
│   │   └── types/
│   │       ├── dashboard.ts          # Dashboard data types
│   │       ├── snippets.ts           # Snippet data types
│   │       ├── analytics.ts          # Analytics data types
│   │       └── api.ts                # API response types
│   ├── store/
│   │   ├── dashboardStore.ts         # Zustand store for dashboard state
│   │   ├── filterStore.ts            # Zustand store for filters
│   │   └── snippetStore.ts           # Zustand store for snippets
│   ├── styles/
│   │   └── theme.css                 # Custom theme overrides
│   └── config/
│       ├── site.ts                   # Next.js site config
│       └── analytics.ts              # Analytics configuration
├── public/
│   ├── images/                       # Static images
│   └── icons/                        # SVG icons (if custom needed)
├── tests/
│   ├── components/                   # Component tests
│   ├── hooks/                        # Hook tests
│   └── utils/                        # Utility tests
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

### Myntra Brand Colors
```typescript
// src/lib/constants/colors.ts
export const colors = {
  primary: '#ff3f6c',      // Myntra Pink/Magenta
  secondary: '#ff905a',    // Myntra Orange
  background: '#f4f4f5',    // Light grey body
  white: '#ffffff',        // White cards/nav
  textPrimary: '#282c3f',  // Primary dark grey
  textSecondary: '#535766', // Secondary grey
  border: '#eaeaec',       // Subtle grey borders
  searchBg: '#f5f5f6'      // Search bar background
} as const;
```

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        myntra: {
          pink: '#ff3f6c',
          orange: '#ff905a',
          grey: {
            light: '#f4f4f5',
            medium: '#eaeaec',
            dark: '#282c3f',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
```

### State Management (Zustand)
```typescript
// src/store/dashboardStore.ts
interface DashboardState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeTab: 'friction',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading })
}));

// src/store/filterStore.ts
interface FilterState {
  filters: {
    userSegment: string;
    timeRange: string;
    category: string;
  };
  setFilter: (key: string, value: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  filters: {
    userSegment: 'all',
    timeRange: '30d',
    category: 'all'
  },
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),
  resetFilters: () => set({
    filters: {
      userSegment: 'all',
      timeRange: '30d',
      category: 'all'
    }
  })
}));
```

### Custom Hooks
```typescript
// src/hooks/useDashboardData.ts
export const useDashboardData = () => {
  const { filters } = useFilterStore();

  return useQuery({
    queryKey: ['dashboard', filters],
    queryFn: () => dashboardApi.getMetrics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000 // Auto-refresh every 5 minutes
  });
};

// src/hooks/useSnippets.ts
export const useSnippets = (hesitationDriver?: string) => {
  return useQuery({
    queryKey: ['snippets', hesitationDriver],
    queryFn: () => snippetsApi.getSnippets({ hesitationDriver }),
    enabled: !!hesitationDriver,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
};

// src/hooks/useDebounce.ts
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
```

### API Client
```typescript
// src/lib/api/client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Dashboard API Endpoints
```typescript
// src/lib/api/dashboard.ts
export const dashboardApi = {
  getMetrics: async (filters: any): Promise<DashboardMetrics> => {
    const response = await apiClient.get('/dashboard/metrics', { params: filters });
    return response.data;
  },
  getFrictionBreakdown: async (filters: any): Promise<FrictionBreakdown> => {
    const response = await apiClient.get('/dashboard/friction-breakdown', { params: filters });
    return response.data;
  },
  getIntentMatrix: async (filters: any): Promise<IntentMatrix> => {
    const response = await apiClient.get('/dashboard/intent-matrix', { params: filters });
    return response.data;
  },
  getJourneyTracker: async (filters: any): Promise<JourneyTracker> => {
    const response = await apiClient.get('/dashboard/journey-tracker', { params: filters });
    return response.data;
  },
  getOpportunityMatrix: async (filters: any): Promise<OpportunityMatrix> => {
    const response = await apiClient.get('/dashboard/opportunity-matrix', { params: filters });
    return response.data;
  }
};
```

### Type Definitions
```typescript
// src/lib/types/dashboard.ts
export interface DashboardMetrics {
  totalSignals: number;
  intentRatio: {
    bookmarking: number;
    immediate: number;
  };
  primaryHesitation: {
    driver: string;
    percentage: number;
  };
  informationLeakage: number;
  cached: boolean;
  lastUpdated: string;
}

export interface FrictionBreakdown {
  frictionTypes: Array<{
    name: string;
    percentage: number;
    color: string;
    trend: string;
  }>;
  snippets: Snippet[];
}

export interface IntentMatrix {
  radarData: Array<{
    subject: string;
    activeIntent: number;
    passiveBookmarking: number;
  }>;
  segments: Segment[];
}

export interface Segment {
  userSegment: string;
  avgWishlistItems: number;
  conversion30d: number;
  topHesitationFactor: string;
}

export interface JourneyTracker {
  steps: Array<{
    label: string;
    percentage: number;
    color: string;
  }>;
}

export interface OpportunityMatrix {
  opportunities: Array<{
    name: string;
    effort: number;
    lift: number;
    quadrant: string;
  }>;
}

// src/lib/types/snippets.ts
export interface Snippet {
  id: string;
  text: string;
  source: 'reddit' | 'appstore' | 'youtube';
  sentiment: 'positive' | 'neutral' | 'negative';
  hesitationDriver: string;
  entities: Entity[];
  timestamp: string;
  author: string;
}

export interface Entity {
  text: string;
  label: 'BRAND' | 'CATEGORY' | 'COLOR' | 'SIZE' | 'OCCASION';
}
```

### Main Dashboard Page
```typescript
// src/app/page.tsx
'use client';

import { KPICards } from '@/components/dashboard/KPICards';
import { TabNavigation } from '@/components/dashboard/TabNavigation';
import { Tab1_FrictionBreakdown } from '@/components/dashboard/Tab1_FrictionBreakdown';
import { Tab2_IntentMatrix } from '@/components/dashboard/Tab2_IntentMatrix';
import { Tab3_JourneyTracker } from '@/components/dashboard/Tab3_JourneyTracker';
import { Tab4_OpportunityMatrix } from '@/components/dashboard/Tab4_OpportunityMatrix';
import { useDashboardStore } from '@/store/dashboardStore';

export default function DashboardPage() {
  const { activeTab } = useDashboardStore();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'friction':
        return <Tab1_FrictionBreakdown />;
      case 'intent':
        return <Tab2_IntentMatrix />;
      case 'journey':
        return <Tab3_JourneyTracker />;
      case 'opportunity':
        return <Tab4_OpportunityMatrix />;
      default:
        return <Tab1_FrictionBreakdown />;
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f4f5]">
      <Header />
      <GlobalFilters />
      <div className="p-6">
        <KPICards />
        <TabNavigation />
        {renderActiveTab()}
      </div>
    </main>
  );
}
```

### Root Layout
```typescript
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Wishlist AI Discovery Engine | Myntra Growth',
  description: 'Product Intelligence Dashboard for analyzing customer conversations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

### Performance Optimization
- **Code Splitting:** Dynamic imports for chart components, route-based code splitting
- **Image Optimization:** Next.js Image component, WebP format, responsive images
- **Bundle Size:** Tree-shaking, external libraries via CDN, minification
- **Caching:** TanStack Query, Service Worker, LocalStorage

### Responsive Design
- **Breakpoints:** sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px
- **KPI Cards:** 4 columns (desktop), 2 columns (tablet), 1 column (mobile)
- **Chart Layout:** Side-by-side on desktop, stacked on mobile
- **Table:** Horizontal scroll on mobile

### Accessibility
- **ARIA Labels:** All interactive elements have appropriate labels
- **Keyboard Navigation:** Full keyboard support
- **Color Contrast:** WCAG AA compliant
- **Screen Readers:** Full compatibility

### Testing Strategy
- **Component Tests:** React Testing Library, MSW for mocking
- **Integration Tests:** Playwright for E2E, API integration tests
- **Performance Tests:** Lighthouse CI, bundle size monitoring, k6 load testing

### Frontend Deployment
```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Docker Configuration
```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Backend Architecture

### Service Architecture

#### 1. API Gateway Service (Node.js/Express)
```
backend/api-gateway/
├── src/
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT authentication
│   │   ├── rateLimit.middleware.js # Rate limiting
│   │   ├── cors.middleware.js      # CORS configuration
│   │   └── errorHandler.js         # Global error handling
│   ├── routes/
│   │   ├── dashboard.routes.js     # Dashboard metrics endpoints
│   │   ├── snippets.routes.js      # Conversational snippet endpoints
│   │   ├── analytics.routes.js     # Analytics aggregation endpoints
│   │   └── health.routes.js        # Health check endpoints
│   ├── services/
│   │   ├── cache.service.js        # Redis caching layer
│   │   ├── proxy.service.js        # Service proxy logic
│   │   └── logger.service.js        # Structured logging
│   ├── config/
│   │   ├── index.js                # Environment configuration
│   │   └── services.config.js       # Backend service URLs
│   └── app.js                      # Express app entry point
├── tests/
├── Dockerfile
└── package.json
```

**Responsibilities:**
- Request routing to microservices
- Authentication & authorization
- Rate limiting (1000 req/min per user)
- Response caching (Redis)
- Request/response logging
- API versioning (/api/v1/)

**Key Endpoints:**
```
GET  /api/v1/dashboard/metrics          # KPI cards data
GET  /api/v1/dashboard/friction-breakdown  # Tab 1 data
GET  /api/v1/dashboard/intent-matrix   # Tab 2 data
GET  /api/v1/dashboard/journey-tracker # Tab 3 data
GET  /api/v1/dashboard/opportunity-matrix # Tab 4 data
GET  /api/v1/snippets                   # Paginated snippet feed
POST /api/v1/snippets/search            # Full-text search
GET  /api/v1/analytics/segments         # Segment breakdown
GET  /api/v1/analytics/trends           # Trend analysis
```

#### 2. Data Ingestion Service (Python/FastAPI)
```
backend/data-ingestion/
├── src/
│   ├── collectors/
│   │   ├── reddit_collector.py     # Reddit API scraper
│   │   ├── appstore_collector.py   # App Store review fetcher
│   │   ├── youtube_collector.py    # YouTube Data API consumer
│   │   └── base_collector.py       # Base collector interface
│   ├── processors/
│   │   ├── text_normalizer.py      # Text cleaning & normalization
│   │   ├── entity_extractor.py     # Brand/category extraction
│   │   ├── pii_masker.py           # PII detection & masking
│   │   └── deduplicator.py         # Duplicate detection
│   ├── models/
│   │   ├── raw_conversation.py     # MongoDB schema
│   │   └── ingestion_log.py        # Ingestion tracking
│   ├── tasks/
│   │   ├── scheduled_tasks.py      # Celery Beat tasks
│   │   └── webhook_tasks.py        # Real-time webhook handlers
│   ├── config/
│   │   ├── settings.py             # Pydantic settings
│   │   └── api_keys.py             # External API keys
│   └── main.py                     # FastAPI entry point
├── tests/
├── Dockerfile
└── requirements.txt
```

**Responsibilities:**
- Scheduled data collection from external sources
- Real-time webhook ingestion (if available)
- Text normalization and cleaning
- PII masking (usernames, phone numbers, emails)
- Duplicate detection across sources
- Metadata enrichment (timestamp, source, channel)

**Data Sources:**
- **Reddit:** r/IndianFashionAddicts, r/myntra, r/fashionreps
  - API: PRAW (Python Reddit API Wrapper)
  - Rate: 60 requests/min
  - Data: Posts, comments, upvotes, timestamps

- **App Store:** Myntra app reviews (iOS + Android)
  - API: App Store RSS / Google Play Scraper
  - Rate: 200 requests/hour
  - Data: Reviews, ratings, version, device

- **YouTube:** Try-on haul videos, fashion reviews
  - API: YouTube Data API v3
  - Rate: 10,000 units/day
  - Data: Video titles, descriptions, comments, transcripts

**Ingestion Schedule:**
- Reddit: Every 15 minutes
- App Store: Every 1 hour
- YouTube: Every 6 hours

#### 3. NLP Processing Service (Python/FastAPI)
```
backend/nlp-service/
├── src/
│   ├── models/
│   │   ├── sentiment_analyzer.py    # BERT sentiment model
│   │   ├── intent_classifier.py    # Intent classification model
│   │   ├── hesitation_detector.py  # Hesitation driver model
│   │   ├── entity_recognizer.py    # NER for brands/categories
│   │   └── model_loader.py         # Model loading utilities
│   ├── pipelines/
│   │   ├── preprocessing.py        # Tokenization, cleaning
│   │   ├── feature_extraction.py    # TF-IDF, embeddings
│   │   ├── inference_pipeline.py   # End-to-end inference
│   │   └── postprocessing.py       # Result formatting
│   ├── tasks/
│   │   ├── batch_processor.py      # Celery batch processing
│   │   └── real_time_processor.py  # Real-time inference
│   ├── utils/
│   │   ├── text_utils.py           # Text manipulation
│   │   ├── label_encoder.py        # Label encoding/decoding
│   │   └── confidence_scorer.py     # Confidence calculation
│   ├── config/
│   │   ├── model_config.py         # Model configurations
│   │   └── labels.py               # Classification labels
│   └── main.py
├── models/                         # Saved ML models
│   ├── sentiment_bert.pt
│   ├── intent_classifier.pt
│   ├── hesitation_detector.pt
│   └── entity_ner.pt
├── tests/
├── Dockerfile
└── requirements.txt
```

**Responsibilities:**
- Sentiment analysis (Positive/Neutral/Negative)
- Intent classification (Bookmarking vs Immediate Purchase)
- Hesitation driver detection (Fit, Style, Social, Visual)
- Entity extraction (Brands: Roadster, H&M, HRX; Categories: Tops, Bottoms, Footwear)
- Confidence scoring for all predictions

**ML Models:**

1. **Sentiment Analyzer**
   - Model: BERT-base-uncased (fine-tuned on fashion reviews)
   - Input: Raw text snippet
   - Output: Sentiment label + confidence score
   - Classes: positive, neutral, negative

2. **Intent Classifier**
   - Model: RoBERTa-large (multi-label)
   - Input: Preprocessed text + metadata
   - Output: Intent probabilities
   - Classes: bookmarking, immediate_purchase, comparison, research

3. **Hesitation Driver Detector**
   - Model: Custom CNN + BiLSTM
   - Input: Text + sentiment + entities
   - Output: Hesitation driver probabilities
   - Classes: fit_sizing, styling_wardrobe, social_validation, visual_reality

4. **Entity Recognizer**
   - Model: spaCy custom NER model
   - Input: Raw text
   - Output: Entities with spans
   - Entity Types: BRAND, CATEGORY, COLOR, SIZE, OCCASION

**Processing Pipeline:**
```
Raw Conversation
    ↓
Text Preprocessing (lowercase, remove special chars)
    ↓
Tokenization (BERT tokenizer)
    ↓
Sentiment Analysis → Sentiment Label + Confidence
    ↓
Intent Classification → Intent Probabilities
    ↓
Entity Recognition → Extracted Entities
    ↓
Hesitation Detection → Driver Probabilities
    ↓
Result Aggregation → JSON output
    ↓
MongoDB Update + Elasticsearch Index
```

#### 4. Analytics & Aggregation Service (Python/FastAPI)
```
backend/analytics-service/
├── src/
│   ├── aggregators/
│   │   ├── kpi_aggregator.py       # KPI card calculations
│   │   ├── friction_aggregator.py  # Friction breakdown stats
│   │   ├── segment_aggregator.py   # User segment metrics
│   │   ├── trend_aggregator.py     # Trend analysis
│   │   └── journey_aggregator.py   # Journey funnel metrics
│   ├── calculators/
│   │   ├── conversion_calculator.py # Conversion rate calc
│   │   ├── lift_calculator.py     # Estimated lift calculation
│   │   └── effort_calculator.py    # Implementation effort scoring
│   ├── repositories/
│   │   ├── postgres_repo.py        # PostgreSQL queries
│   │   ├── mongo_repo.py           # MongoDB queries
│   │   └── elastic_repo.py         # Elasticsearch queries
│   ├── models/
│   │   ├── metrics.py              # Metric data models
│   │   ├── segment.py              # Segment data models
│   │   └── opportunity.py          # Opportunity matrix models
│   ├── tasks/
│   │   ├── scheduled_aggregation.py # Scheduled metric updates
│   │   └── cache_warming.py        # Redis cache warming
│   ├── config/
│   │   ├── aggregation_config.py   # Aggregation rules
│   │   └── cache_config.py         # Cache TTL settings
│   └── main.py
├── tests/
├── Dockerfile
└── requirements.txt
```

**Responsibilities:**
- Real-time KPI calculation
- Friction breakdown aggregation
- User segment analysis
- Journey funnel construction
- Opportunity matrix scoring
- Trend analysis and anomaly detection
- Cache warming for dashboard

**Aggregation Logic:**

1. **KPI Aggregation**
   - Total Signals: Count of processed snippets
   - Intent Ratio: Weighted average of intent classifications
   - Primary Hesitation: Max hesitation driver percentage
   - Information Leakage: % of snippets mentioning external research

2. **Friction Breakdown**
   - Group by hesitation driver
   - Calculate percentage distribution
   - Time-series trend for each driver

3. **Segment Analysis**
   - Group by user segment (Gen Z, Working Pros, etc.)
   - Calculate avg wishlist items per segment
   - Calculate 30-day conversion rate
   - Identify top hesitation factor per segment

4. **Journey Funnel**
   - Track sequence of user actions
   - Calculate drop-off rates
   - Identify common paths

5. **Opportunity Matrix**
   - X-axis: Implementation effort (1-10 scale)
   - Y-axis: Estimated conversion lift (1-10 scale)
   - Quadrant analysis for prioritization

### API Specifications

#### Dashboard Metrics Endpoint
```yaml
GET /api/v1/dashboard/metrics
Response:
{
  "total_signals": 92740,
  "intent_ratio": {
    "bookmarking": 0.68,
    "immediate": 0.32
  },
  "primary_hesitation": {
    "driver": "fit_sizing",
    "percentage": 0.384
  },
  "information_leakage": 0.54,
  "cached": true,
  "last_updated": "2024-08-19T12:00:00Z"
}
```

#### Friction Breakdown Endpoint
```yaml
GET /api/v1/dashboard/friction-breakdown
Response:
{
  "friction_types": [
    {
      "name": "Fit & Size Inconsistency",
      "percentage": 0.384,
      "color": "#ff3f6c",
      "trend": "+2.3%"
    },
    {
      "name": "Styling & Wardrobe Fit",
      "percentage": 0.261,
      "color": "#ff905a",
      "trend": "-1.1%"
    }
  ],
  "snippets": [
    {
      "id": "snippet_123",
      "text": "The size chart is confusing...",
      "source": "reddit",
      "sentiment": "negative",
      "hesitation_driver": "fit_sizing"
    }
  ]
}
```

#### Snippets Search Endpoint
```yaml
POST /api/v1/snippets/search
Request:
{
  "query": "fit sizing roadster",
  "filters": {
    "source": ["reddit", "appstore"],
    "sentiment": ["negative"],
    "hesitation_driver": ["fit_sizing"]
  },
  "page": 1,
  "page_size": 20
}
Response:
{
  "total": 1420,
  "page": 1,
  "page_size": 20,
  "snippets": [...]
}
```

### Caching Strategy

#### Redis Cache Keys
```
# Dashboard metrics (5 min TTL)
dashboard:metrics:global

# Friction breakdown (10 min TTL)
dashboard:friction:{segment}:{time_range}

# Snippets feed (2 min TTL)
snippets:feed:{driver}:{page}

# Aggregated analytics (15 min TTL)
analytics:segments:{date}
analytics:trends:{period}
```

### Error Handling

#### Error Response Format
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "API rate limit exceeded. Try again in 60 seconds.",
    "details": {
      "limit": 1000,
      "remaining": 0,
      "reset_at": "2024-08-19T12:18:00Z"
    }
  }
}
```

#### Error Codes
- `RATE_LIMIT_EXCEEDED`: 429
- `UNAUTHORIZED`: 401
- `FORBIDDEN`: 403
- `NOT_FOUND`: 404
- `VALIDATION_ERROR`: 400
- `INTERNAL_ERROR`: 500
- `SERVICE_UNAVAILABLE`: 503

### Monitoring & Logging

#### Structured Logging Format
```json
{
  "timestamp": "2024-08-19T12:00:00Z",
  "level": "INFO",
  "service": "nlp-service",
  "correlation_id": "abc-123-def",
  "event": "inference_completed",
  "duration_ms": 125,
  "model": "sentiment_bert",
  "input_length": 150,
  "confidence": 0.89
}
```

#### Metrics to Track
- Request latency (p50, p95, p99)
- Error rate by endpoint
- NLP inference time
- Database query time
- Cache hit/miss ratio
- Queue length (Celery)
- Data ingestion rate

### Backend Deployment Configuration

#### Environment Variables
```bash
# API Gateway
PORT=3000
NODE_ENV=production
JWT_SECRET=${JWT_SECRET}
REDIS_URL=redis://redis:6379
NLP_SERVICE_URL=http://nlp-service:8000
ANALYTICS_SERVICE_URL=http://analytics-service:8000

# NLP Service
MODEL_PATH=/app/models
GPU_ENABLED=true
BATCH_SIZE=32
MAX_SEQUENCE_LENGTH=512

# Database
MONGODB_URI=mongodb://mongodb:27017/wishlist_ai
POSTGRES_URI=postgresql://user:pass@postgres:5432/wishlist_ai
ELASTICSEARCH_URL=http://elasticsearch:9200

# External APIs
REDDIT_CLIENT_ID=${REDDIT_CLIENT_ID}
REDDIT_CLIENT_SECRET=${REDDIT_CLIENT_SECRET}
YOUTUBE_API_KEY=${YOUTUBE_API_KEY}
```

#### Docker Compose Services
```yaml
services:
  api-gateway:
    build: ./api-gateway
    ports: ["3000:3000"]
    depends_on: [redis]
  
  data-ingestion:
    build: ./data-ingestion
    depends_on: [mongodb, redis]
  
  nlp-service:
    build: ./nlp-service
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
  
  analytics-service:
    build: ./analytics-service
    depends_on: [postgres, mongodb, elasticsearch, redis]
```

---

## Database Architecture

### PostgreSQL Schema Design

#### Database: wishlist_ai

##### Table: user_segments
```sql
CREATE TABLE user_segments (
    id SERIAL PRIMARY KEY,
    segment_name VARCHAR(100) NOT NULL UNIQUE,
    segment_type VARCHAR(50) NOT NULL, -- 'demographic', 'behavioral', 'custom'
    description TEXT,
    criteria JSONB, -- Segment definition criteria
    avg_wishlist_items DECIMAL(10, 2) DEFAULT 0,
    conversion_rate_30d DECIMAL(5, 2) DEFAULT 0,
    conversion_rate_90d DECIMAL(5, 2) DEFAULT 0,
    top_hesitation_factor VARCHAR(100),
    total_users INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_segments_type ON user_segments(segment_type);
CREATE INDEX idx_user_segments_updated ON user_segments(updated_at DESC);
```

##### Table: kpi_metrics
```sql
CREATE TABLE kpi_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(20, 4),
    metric_type VARCHAR(50) NOT NULL, -- 'count', 'percentage', 'ratio'
    segment_id INTEGER REFERENCES user_segments(id) ON DELETE SET NULL,
    time_period DATE NOT NULL,
    time_granularity VARCHAR(20) NOT NULL, -- 'hourly', 'daily', 'weekly', 'monthly'
    source VARCHAR(50), -- 'reddit', 'appstore', 'youtube', 'all'
    category VARCHAR(100),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_name, segment_id, time_period, time_granularity, source, category)
);

CREATE INDEX idx_kpi_metrics_period ON kpi_metrics(time_period DESC);
CREATE INDEX idx_kpi_metrics_name ON kpi_metrics(metric_name);
CREATE INDEX idx_kpi_metrics_segment ON kpi_metrics(segment_id);
```

##### Table: friction_breakdown
```sql
CREATE TABLE friction_breakdown (
    id SERIAL PRIMARY KEY,
    hesitation_driver VARCHAR(100) NOT NULL, -- 'fit_sizing', 'styling_wardrobe', etc.
    percentage DECIMAL(5, 2) NOT NULL,
    count INTEGER NOT NULL,
    segment_id INTEGER REFERENCES user_segments(id) ON DELETE SET NULL,
    time_period DATE NOT NULL,
    trend DECIMAL(5, 2), -- Percentage change from previous period
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_friction_driver ON friction_breakdown(hesitation_driver);
CREATE INDEX idx_friction_period ON friction_breakdown(time_period DESC);
CREATE INDEX idx_friction_segment ON friction_breakdown(segment_id);
```

##### Table: intent_classification
```sql
CREATE TABLE intent_classification (
    id SERIAL PRIMARY KEY,
    intent_type VARCHAR(50) NOT NULL, -- 'bookmarking', 'immediate_purchase', 'research', 'comparison'
    percentage DECIMAL(5, 2) NOT NULL,
    count INTEGER NOT NULL,
    segment_id INTEGER REFERENCES user_segments(id) ON DELETE SET NULL,
    time_period DATE NOT NULL,
    confidence_avg DECIMAL(5, 2),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_intent_type ON intent_classification(intent_type);
CREATE INDEX idx_intent_period ON intent_classification(time_period DESC);
```

##### Table: journey_funnel
```sql
CREATE TABLE journey_funnel (
    id SERIAL PRIMARY KEY,
    step_name VARCHAR(100) NOT NULL,
    step_order INTEGER NOT NULL,
    step_type VARCHAR(50) NOT NULL, -- 'wishlist', 'external_search', 'social_validation', 'abandon'
    percentage DECIMAL(5, 2) NOT NULL,
    count INTEGER NOT NULL,
    segment_id INTEGER REFERENCES user_segments(id) ON DELETE SET NULL,
    time_period DATE NOT NULL,
    drop_off_rate DECIMAL(5, 2),
    avg_time_to_next_step INTEGER, -- in minutes
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journey_step ON journey_funnel(step_order);
CREATE INDEX idx_journey_period ON journey_funnel(time_period DESC);
```

##### Table: opportunity_matrix
```sql
CREATE TABLE opportunity_matrix (
    id SERIAL PRIMARY KEY,
    opportunity_name VARCHAR(200) NOT NULL,
    description TEXT,
    implementation_effort INTEGER NOT NULL CHECK (implementation_effort BETWEEN 1 AND 10),
    estimated_conversion_lift INTEGER NOT NULL CHECK (estimated_conversion_lift BETWEEN 1 AND 10),
    quadrant VARCHAR(50) NOT NULL, -- 'quick_wins', 'major_projects', 'fill_ins', 'money_pit'
    priority INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'proposed', -- 'proposed', 'in_progress', 'completed', 'on_hold'
    estimated_cost DECIMAL(15, 2),
    estimated_timeline INTEGER, -- in weeks
    dependencies JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_opportunity_priority ON opportunity_matrix(priority);
CREATE INDEX idx_opportunity_status ON opportunity_matrix(status);
```

##### Table: product_catalog
```sql
CREATE TABLE product_catalog (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    price DECIMAL(10, 2),
    attributes JSONB, -- Size, color, material, etc.
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_brand ON product_catalog(brand);
CREATE INDEX idx_product_category ON product_catalog(category);
CREATE INDEX idx_product_active ON product_catalog(is_active);
```

##### Table: data_ingestion_logs
```sql
CREATE TABLE data_ingestion_logs (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50) NOT NULL, -- 'reddit', 'appstore', 'youtube'
    ingestion_type VARCHAR(50) NOT NULL, -- 'scheduled', 'webhook', 'manual'
    status VARCHAR(50) NOT NULL, -- 'success', 'partial', 'failed'
    records_processed INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_seconds INTEGER,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ingestion_source ON data_ingestion_logs(source);
CREATE INDEX idx_ingestion_status ON data_ingestion_logs(status);
CREATE INDEX idx_ingestion_time ON data_ingestion_logs(start_time DESC);
```

#### PostgreSQL Views

##### View: dashboard_kpi_summary
```sql
CREATE VIEW dashboard_kpi_summary AS
SELECT 
    time_period,
    MAX(CASE WHEN metric_name = 'total_signals' THEN metric_value END) as total_signals,
    MAX(CASE WHEN metric_name = 'intent_bookmarking' THEN metric_value END) as intent_bookmarking,
    MAX(CASE WHEN metric_name = 'intent_immediate' THEN metric_value END) as intent_immediate,
    MAX(CASE WHEN metric_name = 'information_leakage' THEN metric_value END) as information_leakage
FROM kpi_metrics
WHERE time_granularity = 'daily'
GROUP BY time_period
ORDER BY time_period DESC;
```

##### View: segment_performance
```sql
CREATE VIEW segment_performance AS
SELECT 
    us.segment_name,
    us.avg_wishlist_items,
    us.conversion_rate_30d,
    us.top_hesitation_factor,
    fb.hesitation_driver as primary_friction,
    fb.percentage as friction_percentage
FROM user_segments us
LEFT JOIN (
    SELECT DISTINCT ON (segment_id) segment_id, hesitation_driver, percentage
    FROM friction_breakdown
    ORDER BY segment_id, percentage DESC
) fb ON us.id = fb.segment_id;
```

### MongoDB Schema Design

#### Database: wishlist_ai

##### Collection: raw_conversations
```javascript
{
  _id: ObjectId("..."),
  id: "conv_1234567890",
  source: "reddit", // 'reddit', 'appstore', 'youtube'
  channel: "r/IndianFashionAddicts",
  text: "The size chart for Roadster jackets is really confusing...",
  author: {
    username: "masked_user_123",
    id: "user_456",
    reputation: 1250
  },
  metadata: {
    upvotes: 42,
    comments: 15,
    shares: 3,
    url: "https://reddit.com/r/IndianFashionAddicts/comments/abc123",
    platform_specific: {
      reddit: {
        subreddit: "r/IndianFashionAddicts",
        award_count: 2
      },
      appstore: {
        app_version: "4.5.0",
        device: "iPhone 14",
        rating: 2
      },
      youtube: {
        video_id: "abc123",
        view_count: 15000,
        like_count: 450
      }
    }
  },
  nlp_results: {
    processed_at: ISODate("2024-08-19T12:00:00Z"),
    sentiment: {
      label: "negative",
      confidence: 0.89,
      scores: {
        positive: 0.05,
        neutral: 0.06,
        negative: 0.89
      }
    },
    intent: {
      bookmarking: 0.72,
      immediate_purchase: 0.15,
      research: 0.08,
      comparison: 0.05
    },
    hesitation_drivers: {
      fit_sizing: 0.38,
      styling_wardrobe: 0.26,
      social_validation: 0.18,
      visual_reality: 0.11,
      price: 0.07
    },
    entities: [
      {
        text: "Roadster",
        label: "BRAND",
        confidence: 0.95,
        start: 20,
        end: 27
      },
      {
        text: "jacket",
        label: "CATEGORY",
        confidence: 0.92,
        start: 33,
        end: 38
      }
    ],
    keywords: ["size", "chart", "confusing", "fit"],
    language: "en"
  },
  segment_assignment: {
    user_segment: "Gen Z",
    confidence: 0.75
  },
  timestamps: {
    created_at: ISODate("2024-08-19T11:30:00Z"),
    ingested_at: ISODate("2024-08-19T11:35:00Z"),
    processed_at: ISODate("2024-08-19T11:36:00Z")
  },
  flags: {
    is_duplicate: false,
    is_spam: false,
    contains_pii: false,
    requires_review: false
  }
}

// Indexes
db.raw_conversations.createIndex({ "source": 1 })
db.raw_conversations.createIndex({ "nlp_results.hesitation_drivers.fit_sizing": 1 })
db.raw_conversations.createIndex({ "nlp_results.sentiment.label": 1 })
db.raw_conversations.createIndex({ "timestamps.ingested_at": -1 })
db.raw_conversations.createIndex({ "nlp_results.entities.label": 1, "nlp_results.entities.text": 1 })
db.raw_conversations.createIndex({ "segment_assignment.user_segment": 1 })
db.raw_conversations.createIndex({ "flags.is_duplicate": 1 })
```

##### Collection: user_journey_events
```javascript
{
  _id: ObjectId("..."),
  event_id: "event_9876543210",
  user_id: "user_456",
  session_id: "session_123",
  journey_type: "wishlist_to_purchase",
  steps: [
    {
      step_name: "add_to_wishlist",
      timestamp: ISODate("2024-08-19T10:00:00Z"),
      metadata: {
        product_id: "prod_123",
        product_name: "Roadster Jacket",
        price: 1499
      }
    },
    {
      step_name: "external_search",
      timestamp: ISODate("2024-08-19T10:15:00Z"),
      metadata: {
        search_query: "Roadster jacket try on",
        platform: "youtube",
        results_viewed: 5
      }
    },
    {
      step_name: "social_validation",
      timestamp: ISODate("2024-08-19T10:30:00Z"),
      metadata: {
        platform: "reddit",
        subreddit: "r/IndianFashionAddicts",
        action: "posted_question"
      }
    },
    {
      step_name: "purchase",
      timestamp: ISODate("2024-08-19T11:00:00Z"),
      metadata: {
        order_id: "order_789",
        final_price: 1199,
        discount_applied: 300
      }
    }
  ],
  outcome: "purchased", // 'purchased', 'abandoned', 'removed'
  time_to_conversion_minutes: 60,
  total_touchpoints: 4,
  external_platforms_visited: ["youtube", "reddit"],
  created_at: ISODate("2024-08-19T11:00:00Z")
}

// Indexes
db.user_journey_events.createIndex({ "user_id": 1 })
db.user_journey_events.createIndex({ "outcome": 1 })
db.user_journey_events.createIndex({ "steps.step_name": 1 })
db.user_journey_events.createIndex({ "created_at": -1 })
```

##### Collection: nlp_model_metrics
```javascript
{
  _id: ObjectId("..."),
  model_name: "sentiment_bert",
  model_version: "v1.2.0",
  metrics: {
    accuracy: 0.92,
    precision: 0.91,
    recall: 0.90,
    f1_score: 0.905,
    confusion_matrix: {
      true_positive: 1250,
      true_negative: 980,
      false_positive: 110,
      false_negative: 160
    }
  },
  performance: {
    avg_inference_time_ms: 125,
    throughput_per_second: 80,
    gpu_utilization: 0.75
  },
  training_data: {
    dataset_size: 50000,
    training_date: ISODate("2024-08-01T00:00:00Z"),
    data_sources: ["reddit", "appstore", "youtube"]
  },
  created_at: ISODate("2024-08-19T12:00:00Z")
}

// Indexes
db.nlp_model_metrics.createIndex({ "model_name": 1 })
db.nlp_model_metrics.createIndex({ "created_at": -1 })
```

##### Collection: aggregation_cache
```javascript
{
  _id: ObjectId("..."),
  cache_key: "friction_breakdown:gen_z:30d",
  aggregation_type: "friction_breakdown",
  filters: {
    segment: "Gen Z",
    time_range: "30d",
    source: "all"
  },
  data: {
    friction_types: [
      { name: "Fit & Size Inconsistency", percentage: 38.4, count: 1520 },
      { name: "Styling & Wardrobe Fit", percentage: 26.1, count: 1035 }
    ]
  },
  metadata: {
    record_count: 3958,
    generated_at: ISODate("2024-08-19T12:00:00Z"),
    ttl_seconds: 300
  },
  created_at: ISODate("2024-08-19T12:00:00Z"),
  expires_at: ISODate("2024-08-19T12:05:00Z")
}

// Indexes
db.aggregation_cache.createIndex({ "cache_key": 1 }, { unique: true })
db.aggregation_cache.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0 })
```

### Redis Data Structures

#### Key Naming Convention
```
{service}:{entity}:{identifier}:{attribute}
```

#### Dashboard Metrics Cache
```
# Key: dashboard:metrics:global
# Type: Hash
# TTL: 300 seconds (5 minutes)

HSET dashboard:metrics:global total_signals 92740
HSET dashboard:metrics:global intent_bookmarking 0.68
HSET dashboard:metrics:global intent_immediate 0.32
HSET dashboard:metrics:global primary_hesitation "fit_sizing"
HSET dashboard:metrics:global hesitation_percentage 0.384
HSET dashboard:metrics:global information_leakage 0.54
HSET dashboard:metrics:global last_updated "2024-08-19T12:00:00Z"
EXPIRE dashboard:metrics:global 300
```

#### Friction Breakdown Cache
```
# Key: dashboard:friction:{segment}:{time_range}
# Type: JSON string
# TTL: 600 seconds (10 minutes)

SET dashboard:friction:gen_z:30d '{"friction_types":[...],"snippets":[...]}'
EXPIRE dashboard:friction:gen_z:30d 600
```

#### Snippets Feed Cache
```
# Key: snippets:feed:{driver}:{page}
# Type: List
# TTL: 120 seconds (2 minutes)

LPUSH snippets:feed:fit_sizing:1 '{"id":"...","text":"..."}'
LPUSH snippets:feed:fit_sizing:1 '{"id":"...","text":"..."}'
EXPIRE snippets:feed:fit_sizing:1 120
```

#### Session Management
```
# Key: session:{session_id}
# Type: Hash
# TTL: 3600 seconds (1 hour)

HSET session:abc123 user_id "user_456"
HSET session:abc123 segment "Gen Z"
HSET session:abc123 filters '{"time_range":"30d","category":"all"}'
HSET session:abc123 created_at "2024-08-19T12:00:00Z"
EXPIRE session:abc123 3600
```

#### Rate Limiting
```
# Key: ratelimit:{user_id}:{endpoint}
# Type: String (counter)
# TTL: 60 seconds

INCR ratelimit:user_456:dashboard_metrics
EXPIRE ratelimit:user_456:dashboard_metrics 60
```

#### Real-time Metrics (Pub/Sub)
```
# Channel: metrics:updates
# Type: Pub/Sub

PUBLISH metrics:updates '{"type":"kpi_update","data":{...}}'
```

### Elasticsearch Schema Design

#### Index: conversations
```json
PUT /conversations
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "refresh_interval": "1s"
  },
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "source": { "type": "keyword" },
      "channel": { "type": "keyword" },
      "text": {
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" },
          "stemmed": { "type": "text", "analyzer": "english_stemmer" }
        }
      },
      "author": {
        "properties": {
          "username": { "type": "keyword" },
          "id": { "type": "keyword" }
        }
      },
      "metadata": {
        "properties": {
          "upvotes": { "type": "integer" },
          "comments": { "type": "integer" }
        }
      },
      "nlp_results": {
        "properties": {
          "sentiment": {
            "properties": {
              "label": { "type": "keyword" },
              "confidence": { "type": "float" }
            }
          },
          "hesitation_drivers": {
            "properties": {
              "fit_sizing": { "type": "float" },
              "styling_wardrobe": { "type": "float" },
              "social_validation": { "type": "float" },
              "visual_reality": { "type": "float" }
            }
          },
          "entities": {
            "type": "nested",
            "properties": {
              "text": { "type": "keyword" },
              "label": { "type": "keyword" },
              "confidence": { "type": "float" }
            }
          }
        }
      },
      "segment_assignment": {
        "properties": {
          "user_segment": { "type": "keyword" },
          "confidence": { "type": "float" }
        }
      },
      "timestamps": {
        "properties": {
          "ingested_at": { "type": "date" },
          "processed_at": { "type": "date" }
        }
      }
    }
  },
  "analysis": {
    "analyzer": {
      "english_stemmer": {
        "type": "custom",
        "tokenizer": "standard",
        "filter": ["lowercase", "english_stemmer"]
      }
    }
  }
}
```

#### Search Queries

##### Full-text Search with Filters
```json
GET /conversations/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "multi_match": {
            "query": "fit sizing roadster jacket",
            "fields": ["text", "text.stemmed"],
            "fuzziness": "AUTO"
          }
        }
      ],
      "filter": [
        { "term": { "source": "reddit" } },
        { "term": { "nlp_results.sentiment.label": "negative" } },
        { "range": { "nlp_results.hesitation_drivers.fit_sizing": { "gte": 0.3 } } },
        { "range": { "timestamps.ingested_at": { "gte": "now-30d" } } }
      ]
    }
  },
  "aggs": {
    "by_source": {
      "terms": { "field": "source", "size": 10 }
    },
    "by_sentiment": {
      "terms": { "field": "nlp_results.sentiment.label" }
    },
    "by_segment": {
      "terms": { "field": "segment_assignment.user_segment" }
    },
    "avg_hesitation": {
      "avg": { "field": "nlp_results.hesitation_drivers.fit_sizing" }
    }
  },
  "size": 20,
  "from": 0
}
```

##### Entity Aggregation
```json
GET /conversations/_search
{
  "query": {
    "nested": {
      "path": "nlp_results.entities",
      "query": {
        "bool": {
          "must": [
            { "match": { "nlp_results.entities.label": "BRAND" } }
          ]
        }
      }
    }
  },
  "aggs": {
    "top_brands": {
      "nested": {
        "path": "nlp_results.entities"
      },
      "aggs": {
        "brand_names": {
          "terms": {
            "field": "nlp_results.entities.text",
            "size": 20
          }
        }
      }
    }
  }
}
```

##### Time Series Aggregation
```json
GET /conversations/_search
{
  "size": 0,
  "query": {
    "range": {
      "timestamps.ingested_at": {
        "gte": "now-90d"
      }
    }
  },
  "aggs": {
    "daily_volume": {
      "date_histogram": {
        "field": "timestamps.ingested_at",
        "calendar_interval": "day",
        "format": "yyyy-MM-dd"
      },
      "aggs": {
        "by_sentiment": {
          "terms": {
            "field": "nlp_results.sentiment.label"
          }
        }
      }
    }
  }
}
```

### Database Backup & Recovery

#### PostgreSQL Backup
- **Full Backups:** Daily at 2 AM UTC
- **WAL Archiving:** Continuous
- **Retention:** 30 days
- **Tool:** pg_dump + WAL-G

#### MongoDB Backup
- **Full Backups:** Every 6 hours
- **Incremental Backups:** Every hour
- **Retention:** 7 days
- **Tool:** MongoDB Atlas Backup or mongodump

#### Redis Backup
- **RDB Snapshots:** Every 5 minutes
- **AOF Logging:** Continuous
- **Retention:** 24 hours
- **Tool:** Native Redis persistence

#### Elasticsearch Backup
- **Snapshots:** Daily at 3 AM UTC
- **Repository:** S3-compatible storage
- **Retention:** 30 days
- **Tool:** Elasticsearch Snapshot API

### Database Monitoring & Maintenance

#### Performance Monitoring
- **PostgreSQL:** pg_stat_statements, slow query log
- **MongoDB:** mongostat, profiler
- **Redis:** INFO command, slowlog
- **Elasticsearch:** _nodes/stats, _cat/indices

#### Index Maintenance
- **PostgreSQL:** REINDEX, ANALYZE weekly
- **MongoDB:** Index rebuild monthly
- **Elasticsearch:** Force merge indices weekly

#### Data Retention
- **Raw Conversations:** Retain for 1 year, then archive
- **Aggregated Metrics:** Retain for 2 years
- **Logs:** Retain for 90 days
- **Cache:** Auto-expire based on TTL

### Database Security

#### Access Control
- **PostgreSQL:** Row-level security (RLS) for segment-based access
- **MongoDB:** Role-based access control (RBAC)
- **Redis:** AUTH password + TLS
- **Elasticsearch:** X-Pack security + API keys

#### Encryption
- **At Rest:** All databases support TDE
- **In Transit:** TLS 1.3 for all connections
- **Backups:** Encrypted with AES-256

#### PII Handling
- Automatic PII detection in NLP pipeline
- Masking before storage
- Separate encrypted storage for PII if needed

### Database Scaling Strategy

#### PostgreSQL Scaling
- Read replicas for analytics queries
- Connection pooling with PgBouncer
- Partitioning by time for large tables

#### MongoDB Scaling
- Sharding by source/channel
- Replica sets for high availability
- Time-series collections for journey events

#### Redis Scaling
- Redis Cluster for horizontal scaling
- Read replicas for cache-heavy workloads
- Memory optimization with data structures

#### Elasticsearch Scaling
- Multiple data nodes
- Dedicated master nodes
- Hot-warm architecture for time-based data

---

## Data Flow

### 1. Data Ingestion Pipeline
```
External Sources (Reddit, App Store, YouTube)
    ↓
Data Ingestion Service (Scheduled Jobs + Webhooks)
    ↓
Raw Data Validation & Normalization
    ↓
MongoDB (Raw Conversations Collection)
    ↓
NLP Processing Queue
```

### 2. NLP Processing Pipeline
```
Raw Conversations (MongoDB)
    ↓
Text Preprocessing (Cleaning, Tokenization)
    ↓
Sentiment Analysis (BERT Model)
    ↓
Intent Classification (Multi-label Classifier)
    ↓
Entity Extraction (NER for Brands, Categories)
    ↓
Hesitation Driver Detection (Custom Classifier)
    ↓
Processed Data (MongoDB + Elasticsearch)
    ↓
Aggregation Service (PostgreSQL Metrics)
```

### 3. Real-time Dashboard Pipeline
```
User Dashboard Request
    ↓
API Gateway (Authentication & Rate Limiting)
    ↓
Analytics Service (Redis Cache Check)
    ↓
    ├─ Cache Hit → Return Cached Data
    └─ Cache Miss → Query PostgreSQL/Elasticsearch
    ↓
Aggregated Metrics Response
    ↓
Frontend Visualization (Recharts)
```

### 4. Database Flow Between Systems
```
External Sources
    ↓
Data Ingestion Service
    ↓
MongoDB (raw_conversations collection)
    ↓
NLP Processing Service
    ↓
MongoDB (update nlp_results field)
    ↓
Elasticsearch (index for search)
    ↓
Analytics Service
    ↓
PostgreSQL (aggregated metrics)
    ↓
Redis (cache for dashboard)
```

### 5. Query Flow
```
Frontend Request
    ↓
API Gateway
    ↓
Redis Cache Check
    ↓
    ├─ Hit → Return cached data
    └─ Miss → Query PostgreSQL/Elasticsearch
    ↓
PostgreSQL (for metrics/aggregations)
    ↓
Elasticsearch (for snippet search)
    ↓
MongoDB (for detailed conversation data)
    ↓
Response to Frontend
    ↓
Redis Cache Update
```

---

## Security

### Authentication & Authorization
- **Auth Provider:** JWT-based authentication
- **Role-Based Access Control (RBAC):**
  - Admin (Full access)
  - Product Manager (Read/Write dashboards)
  - Analyst (Read-only)
- **Session Management:** Redis-backed sessions

### Data Security
- **Encryption at Rest:** PostgreSQL TDE, MongoDB Encryption
- **Encryption in Transit:** TLS 1.3 for all API calls
- **API Security:** Rate limiting, API keys, CORS policies
- **PII Redaction:** Automatic PII detection and masking in NLP pipeline

### Access Control
- **PostgreSQL:** Row-level security (RLS) for segment-based access
- **MongoDB:** Role-based access control (RBAC)
- **Redis:** AUTH password + TLS
- **Elasticsearch:** X-Pack security + API keys

### Encryption
- **At Rest:** All databases support TDE
- **In Transit:** TLS 1.3 for all connections
- **Backups:** Encrypted with AES-256

### PII Handling
- Automatic PII detection in NLP pipeline
- Masking before storage
- Separate encrypted storage for PII if needed

---

## Scalability

### Horizontal Scaling
- **Stateless API Services:** Multiple instances behind load balancer
- **Database Sharding:** MongoDB sharding by source/channel
- **Read Replicas:** PostgreSQL read replicas for analytics queries

### Performance Optimization
- **Caching Strategy:**
  - Redis for frequently accessed metrics (TTL: 5 minutes)
  - CDN for static assets
  - Browser caching for dashboard state
- **Database Indexing:**
  - Elasticsearch indices for fast full-text search
  - PostgreSQL composite indexes for complex queries
- **Batch Processing:** NLP processing in batches to optimize GPU/CPU usage

### PostgreSQL Scaling
- Read replicas for analytics queries
- Connection pooling with PgBouncer
- Partitioning by time for large tables

### MongoDB Scaling
- Sharding by source/channel
- Replica sets for high availability
- Time-series collections for journey events

### Redis Scaling
- Redis Cluster for horizontal scaling
- Read replicas for cache-heavy workloads
- Memory optimization with data structures

### Elasticsearch Scaling
- Multiple data nodes
- Dedicated master nodes
- Hot-warm architecture for time-based data

---

## Monitoring & Observability

### Metrics Collection
- **Application Metrics:** Request latency, error rates, throughput
- **Business Metrics:** Data ingestion rate, NLP processing time, dashboard load time
- **Infrastructure Metrics:** CPU, memory, disk I/O, network

### Logging Strategy
- **Structured Logging:** JSON-formatted logs with correlation IDs
- **Log Levels:** ERROR, WARN, INFO, DEBUG
- **Centralized Logging:** ELK Stack aggregation

### Alerting
- **Critical Alerts:** Service downtime, data pipeline failures
- **Warning Alerts:** High latency, cache miss rate > threshold
- **Notification Channels:** PagerDuty, Slack, Email

### Performance Monitoring
- **PostgreSQL:** pg_stat_statements, slow query log
- **MongoDB:** mongostat, profiler
- **Redis:** INFO command, slowlog
- **Elasticsearch:** _nodes/stats, _cat/indices

### Index Maintenance
- **PostgreSQL:** REINDEX, ANALYZE weekly
- **MongoDB:** Index rebuild monthly
- **Elasticsearch:** Force merge indices weekly

### Data Retention
- **Raw Conversations:** Retain for 1 year, then archive
- **Aggregated Metrics:** Retain for 2 years
- **Logs:** Retain for 90 days
- **Cache:** Auto-expire based on TTL

---

## Deployment

### Development Environment
- Local Docker Compose setup
- Hot-reload for frontend/backend
- Mock data for NLP services

### Staging Environment
- Cloud-hosted (AWS/GCP)
- Production-like configuration
- Reduced scale for cost optimization

### Production Environment
- Multi-region deployment (AWS Mumbai + Singapore)
- Auto-scaling groups
- CDN for global distribution
- Disaster recovery with cross-region backups

### Infrastructure as Code
- **Docker Compose:** Local development
- **Kubernetes:** Production orchestration
- **Terraform:** Infrastructure provisioning
- **GitHub Actions:** CI/CD pipeline

### CI/CD Pipeline
1. **Code Commit:** Push to main branch
2. **Build:** Docker image build
3. **Test:** Unit tests, integration tests, E2E tests
4. **Security Scan:** Vulnerability scanning
5. **Deploy:** Staging environment
6. **Validation:** Smoke tests, performance tests
7. **Production Deploy:** Blue-green deployment
8. **Monitoring:** Health checks, rollback on failure

### Environment Configuration
```bash
# Production
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.myntra-growth.com
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Staging
NODE_ENV=staging
NEXT_PUBLIC_API_URL=https://api-staging.myntra-growth.com
NEXT_PUBLIC_ENABLE_ANALYTICS=true

# Development
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Disaster Recovery
- **Backup Strategy:** Automated daily backups, point-in-time recovery
- **Multi-region:** Active-active setup across regions
- **Failover:** Automatic failover with < 5 min RTO
- **Data Replication:** Cross-region replication for critical data

---

## Summary

This architecture provides a comprehensive, enterprise-grade solution for the Wishlist AI Discovery Engine with:

- **Frontend:** Next.js 14 with React, Tailwind CSS, Recharts, and Myntra brand compliance
- **Backend:** Microservices architecture with Python (ML/NLP) and Node.js (API Gateway)
- **Database:** Multi-database strategy (PostgreSQL, MongoDB, Redis, Elasticsearch) optimized for different use cases
- **Security:** JWT authentication, RBAC, encryption at rest and in transit, PII protection
- **Scalability:** Horizontal scaling, caching strategies, database sharding
- **Monitoring:** Comprehensive logging, metrics, and alerting
- **Deployment:** Containerized services with Kubernetes orchestration and CI/CD pipeline

The system is designed to handle large-scale semantic analysis of unstructured customer conversations while providing real-time insights through an interactive, enterprise-grade dashboard following Myntra's design guidelines.
