'use client';

export function ArchitectureDiagram() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md border-t-4 border-myntra-pink">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h3 className="text-xl font-bold text-myntra-text-dark flex items-center gap-2">
            <span className="inline-block h-5 w-1.5 rounded-full bg-gradient-to-b from-myntra-pink to-myntra-orange" />
            Dashboard Architecture
          </h3>
          <p className="text-sm text-myntra-text-light mt-1">Complete data pipeline from ingestion to dashboard visualization.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://github.com/swetapadmaswain/myntra-dashboard.git"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-gradient-to-r from-myntra-pink to-myntra-orange px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:shadow-lg hover:scale-[1.02]"
          >
            Git Repo
          </a>
          <a
            href="http://localhost:8002/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border-2 border-myntra-pink/30 px-4 py-2 text-xs font-semibold text-myntra-pink transition hover:bg-myntra-pink/5"
          >
            Ingestion API
          </a>
          <a
            href="http://localhost:8001/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border-2 border-myntra-orange/30 px-4 py-2 text-xs font-semibold text-myntra-orange transition hover:bg-myntra-orange/5"
          >
            Analytics API
          </a>
        </div>
      </div>

      <div className="space-y-8">
        {/* Layer 1: Data Sources & Ingestion */}
        <div>
          <LayerHeader number="1" title="Data Sources & Ingestion" desc="Multi-source collectors → NLP enrichment → MongoDB" />
          <div className="flex min-w-max items-center gap-2 overflow-x-auto pb-2">
            <ArchNode title="App Store Reviews" desc="Google Play · iOS" color="from-blue-500 to-cyan-500" />
            <Arrow label="httpx" />
            <ArchNode title="YouTube Comments" desc="YouTube Data API v3" color="from-red-500 to-rose-500" />
            <Arrow label="httpx" />
            <ArchNode title="Reddit Posts" desc="Public JSON API" color="from-orange-500 to-amber-500" />
            <Arrow label="collect" />
            <ArchNode title="Data Ingestion" desc="FastAPI · :8002" color="from-indigo-500 to-purple-500" />
            <Arrow label="enrich" />
            <ArchNode title="NLP Service" desc="FastAPI · :8000" color="from-purple-500 to-fuchsia-500" />
            <Arrow label="store" />
            <ArchNode title="MongoDB" desc="Raw conversations" color="from-emerald-500 to-green-500" />
          </div>
        </div>

        {/* Layer 2: NLP Processing & Enrichment */}
        <div>
          <LayerHeader number="2" title="NLP Processing & Enrichment" desc="Sentiment · Intent · Hesitation · Entity extraction" />
          <div className="flex min-w-max items-center gap-2 overflow-x-auto pb-2">
            <ArchNode title="MongoDB" desc="Raw conversations" color="from-emerald-500 to-green-500" />
            <Arrow label="fetch" />
            <ArchNode title="NLP Pipeline" desc="spaCy · VADER · :8000" color="from-purple-500 to-fuchsia-500" />
            <Arrow label="sentiment" />
            <ArchNode title="Intent Classifier" desc="Bookmark · Research · Compare · Buy" color="from-violet-500 to-purple-500" />
            <Arrow label="friction" />
            <ArchNode title="Hesitation Driver" desc="Fit · Visual · Price · Style · Social" color="from-fuchsia-500 to-pink-500" />
            <Arrow label="entities" />
            <ArchNode title="NER + Tags" desc="Product & brand extraction" color="from-pink-500 to-rose-500" />
            <Arrow label="update" />
            <ArchNode title="MongoDB" desc="Enriched + processed=true" color="from-emerald-500 to-green-500" />
          </div>
        </div>

        {/* Layer 3: Analytics & Aggregation */}
        <div>
          <LayerHeader number="3" title="Analytics & Aggregation" desc="Real-time metric computation from enriched data" />
          <div className="flex min-w-max items-center gap-2 overflow-x-auto pb-2">
            <ArchNode title="MongoDB" desc="Processed conversations" color="from-emerald-500 to-green-500" />
            <Arrow label="aggregate" />
            <ArchNode title="Analytics Service" desc="FastAPI · :8001" color="from-orange-500 to-amber-500" />
            <Arrow label="compute" />
            <ArchNode title="KPI Calculator" desc="Total · Sentiment · Intent" color="from-amber-500 to-yellow-500" />
            <Arrow label="analyze" />
            <ArchNode title="Friction Analyzer" desc="Breakdown by type" color="from-orange-500 to-red-500" />
            <Arrow label="journey" />
            <ArchNode title="Journey + Behavioural" desc="Funnel · Drop-off" color="from-red-500 to-rose-500" />
            <Arrow label="cache" />
            <ArchNode title="Redis" desc="Cached metrics" color="from-red-400 to-orange-400" />
          </div>
        </div>

        {/* Layer 4: API Gateway & Frontend */}
        <div>
          <LayerHeader number="4" title="API Gateway & Frontend" desc="Express proxy → Next.js dashboard → Browser" />
          <div className="flex min-w-max items-center gap-2 overflow-x-auto pb-2">
            <ArchNode title="Analytics Service" desc="FastAPI · :8001" color="from-orange-500 to-amber-500" />
            <Arrow label="/analytics/*" />
            <ArchNode title="API Gateway" desc="Express · Helmet · CORS · :3000" color="from-rose-500 to-pink-500" />
            <Arrow label="/api/v1/*" />
            <ArchNode title="Next.js 14" desc="React · TypeScript · :3001" color="from-myntra-pink to-myntra-orange" />
            <Arrow label="render" />
            <ArchNode title="Dashboard UI" desc="9 tabs · Recharts · Zustand" color="from-myntra-neon-pink to-myntra-purple" />
            <Arrow label="display" />
            <ArchNode title="Browser" desc="User-facing dashboard" color="from-cyan-500 to-blue-500" />
          </div>
        </div>

        {/* Layer 5: Scheduling & Infrastructure */}
        <div>
          <LayerHeader number="5" title="Scheduling & Infrastructure" desc="Celery Beat periodic tasks · Docker Compose orchestration" />
          <div className="flex min-w-max items-center gap-2 overflow-x-auto pb-2">
            <ArchNode title="Celery Beat" desc="Periodic scheduler" color="from-amber-500 to-orange-500" />
            <Arrow label="trigger" />
            <ArchNode title="Ingestion Tasks" desc="App Store · YouTube · Reddit" color="from-indigo-500 to-purple-500" />
            <Arrow label="dedupe" />
            <ArchNode title="Deduplicator" desc="Content hash + URL" color="from-blue-500 to-cyan-500" />
            <Arrow label="enrich+store" />
            <ArchNode title="MongoDB" desc="Growing continuously" color="from-emerald-500 to-green-500" />
            <Arrow label="orchestrate" />
            <ArchNode title="Docker Compose" desc="9 containers · 1 network" color="from-sky-500 to-blue-500" />
          </div>
        </div>
      </div>

      {/* Tech Stack Summary */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StackCard title="Ingestion" items={['Python 3.11', 'FastAPI', 'httpx (Reddit)', 'YouTube Data API v3', 'google-play-scraper', 'Celery Beat']} />
        <StackCard title="NLP Processing" items={['spaCy NLP', 'VADER Sentiment', 'Custom intent classifier', 'Hesitation driver model', 'NER entity extraction']} />
        <StackCard title="Analytics" items={['FastAPI · :8001', 'KPI Calculator', 'Friction Analyzer', 'Journey Analyzer', 'Behavioural Analyzer', 'Redis caching']} />
        <StackCard title="Infrastructure" items={['MongoDB 7', 'PostgreSQL 15', 'Elasticsearch 8', 'Redis 7', 'Docker Compose', '9 containers']} />
      </div>

      {/* Frontend Stack */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StackCard title="Frontend" items={['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Recharts', 'Zustand', 'TanStack Query']} />
        <StackCard title="API Gateway" items={['Node.js · Express', 'Helmet security', 'CORS enabled', 'Redis caching', 'Swagger docs', 'Rate limiting']} />
        <StackCard title="Data Sources" items={['Google Play Store', 'Apple App Store', 'YouTube Comments', 'Reddit (public API)']} />
        <StackCard title="DevOps" items={['Docker Compose', 'GitHub Actions CI', '9-service network', 'Volume persistence', 'Health checks']} />
      </div>
    </div>
  );
}

function ArchNode({ title, desc, color }: { title: string; desc: string; color: string }) {
  return (
    <div className={`min-w-[140px] flex-shrink-0 rounded-xl bg-gradient-to-br ${color} p-3 text-center shadow-md transition hover:scale-105 hover:shadow-lg`}>
      <div className="text-xs font-bold text-white">{title}</div>
      <div className="mt-0.5 text-[10px] text-white/80">{desc}</div>
    </div>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center px-1">
      <span className="mb-1 whitespace-nowrap text-[9px] font-semibold uppercase tracking-wide text-myntra-pink">{label}</span>
      <div className="flex items-center">
        <div className="h-0.5 w-5 bg-gradient-to-r from-myntra-pink to-myntra-orange" />
        <div className="h-0 w-0 border-y-[5px] border-l-[6px] border-y-transparent border-l-myntra-orange" />
      </div>
    </div>
  );
}

function LayerHeader({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="mb-2">
      <span className="text-xs font-extrabold uppercase tracking-wider text-myntra-pink">Layer {number}:</span>{' '}
      <span className="text-sm font-bold text-myntra-text-dark">{title}</span>
      <span className="text-sm text-myntra-text-light"> — {desc}</span>
    </div>
  );
}

function StackCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border-2 border-myntra-gray bg-white p-3 transition hover:border-myntra-pink/30 hover:shadow-sm">
      <h4 className="mb-2 text-sm font-bold text-myntra-text-dark">{title}</h4>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-1.5 text-xs text-myntra-text-light">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gradient-to-r from-myntra-pink to-myntra-orange" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
