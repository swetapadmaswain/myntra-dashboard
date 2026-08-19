# Wishlist AI Discovery Engine

Enterprise-grade Product Intelligence Dashboard for analyzing unstructured customer conversations from multi-channel sources (Reddit, App Store, YouTube) to identify purchase hesitation drivers for Myntra wishlist items.

## Architecture

For detailed architecture information, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Implementation Plan

For a detailed step-by-step implementation plan, see [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).

## Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Node.js 20+ (for local development)
- Python 3.11+ (for local development)

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/swetapadmaswain/myntra-dashboard.git
cd myntra-dashboard
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your actual API keys:
- REDDIT_CLIENT_ID
- REDDIT_CLIENT_SECRET
- YOUTUBE_API_KEY

### Start Services

Start all services using Docker Compose:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- MongoDB (port 27017)
- Redis (port 6379)
- Elasticsearch (port 9200)
- API Gateway (port 3000)
- Data Ingestion Service (port 8002)
- NLP Processing Service (port 8000)
- Analytics & Aggregation Service (port 8001)
- Frontend (port 3001)

### Initialize Databases

The databases will be automatically initialized on first startup. You can also manually initialize them:

**PostgreSQL:**
```bash
docker exec -i myntra-postgres psql -U myntra_user -d myntra_dashboard < database/init-postgres.sql
```

**MongoDB:**
```bash
docker exec -i myntra-mongodb mongosh myntra_dashboard -u myntra_user -p myntra_password < database/init-mongodb.js
```

**Redis:**
```bash
docker exec -i myntra-redis redis-cli < database/init-redis.lua
```

**Elasticsearch:**
```bash
curl -X PUT "localhost:9200/conversations" -H 'Content-Type: application/json' -d @database/init-elasticsearch.json
```

### Verify Services

Check service health:
```bash
docker-compose ps
```

Access services:
- Frontend: http://localhost:3001
- API Gateway: http://localhost:3000
- Elasticsearch: http://localhost:9200

### Stop Services

```bash
docker-compose down
```

To remove volumes as well:
```bash
docker-compose down -v
```

## Development

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Backend Development

**API Gateway (Node.js):**
```bash
cd backend/api-gateway
npm install
npm run dev
```

**Python Services:**
```bash
cd backend/data-ingestion  # or nlp-service or analytics-service
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

### Code Quality

**Linting:**
```bash
# Frontend
cd frontend && npm run lint

# Backend (Node.js)
cd backend/api-gateway && npm run lint

# Backend (Python)
cd backend/data-ingestion && black .
cd backend/nlp-service && black .
cd backend/analytics-service && black .
```

**Pre-commit Hooks:**
```bash
pip install pre-commit
pre-commit install
```

## Testing

**Frontend Tests:**
```bash
cd frontend
npm test
```

**Backend Tests:**
```bash
cd backend/data-ingestion && pytest
cd backend/nlp-service && pytest
cd backend/analytics-service && pytest
```

**E2E Tests:**
```bash
cd frontend
npx playwright test
```

## Project Structure

```
myntra-dashboard/
├── frontend/           # Next.js frontend application
├── backend/           # Backend microservices
│   ├── api-gateway/   # Node.js/Express API Gateway
│   ├── data-ingestion/ # Python/FastAPI Data Ingestion
│   ├── nlp-service/   # Python/FastAPI NLP Processing
│   └── analytics-service/ # Python/FastAPI Analytics
├── database/          # Database initialization scripts
├── ARCHITECTURE.md    # Complete system architecture
├── IMPLEMENTATION_PLAN.md # Step-by-step implementation plan
├── docker-compose.yml # Docker Compose configuration
└── .env.example       # Environment variables template
```

## Technology Stack

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Recharts
- Zustand
- TanStack Query

### Backend
- Node.js 20 + Express.js (API Gateway)
- Python 3.11 + FastAPI (ML/NLP Services)
- Celery (Task Queue)
- Redis (Message Broker)

### Database
- PostgreSQL 15+ (Relational)
- MongoDB 7+ (Document Store)
- Redis 7+ (Caching)
- Elasticsearch 8+ (Search & Analytics)

### Infrastructure
- Docker & Docker Compose
- Kubernetes (Production)
- GitHub Actions (CI/CD)
- Prometheus + Grafana (Monitoring)
- ELK Stack (Logging)

## License

Proprietary - Myntra Growth Team

## Support

For issues and questions, contact the Myntra Growth Team.
