'use client';

export function ArchitectureDiagram() {
  return (
    <div className="rounded-xl bg-slate-900 p-6 text-white shadow-sm">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h3 className="text-xl font-bold text-white">Dashboard Architecture</h3>
          <p className="text-sm text-slate-400">Complete data pipeline from ingestion to dashboard visualization.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://github.com/swetapadmaswain/myntra-dashboard.git"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            Git Repo
          </a>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            API Docs
          </a>
        </div>
      </div>

      <div className="space-y-8">
        {/* Layer 1: Data Ingestion */}
        <div>
          <LayerHeader number="1" title="Data Ingestion" desc="External feedback collection and persistence" />
          <div className="flex min-w-max items-center gap-2 overflow-x-auto pb-2">
            <ArchNode title="App Store Reviews" desc="Google Play / iOS" topBorder="border-t-blue-400" />
            <Arrow label="JSON" />
            <ArchNode title="Reddit Posts" desc="r/myntra &amp; fashion" topBorder="border-t-blue-400" />
            <Arrow label="JSON" />
            <ArchNode title="YouTube Comments" desc="Fashion reviews" topBorder="border-t-blue-400" />
            <Arrow label="JSON" />
            <ArchNode title="Twitter/X" desc="Brand mentions" topBorder="border-t-blue-400" />
            <Arrow label="webhook" />
            <ArchNode title="Ingestion Service" desc="Python · FastAPI · :8001" topBorder="border-t-indigo-400" />
            <Arrow label="upsert" />
            <ArchNode title="MongoDB" desc="Raw conversations" topBorder="border-t-emerald-400" />
            <Arrow label="index" />
            <ArchNode title="Elasticsearch" desc="Snippet search" topBorder="border-t-emerald-400" />
          </div>
        </div>

        {/* Layer 2: Processing & Classification */}
        <div>
          <LayerHeader number="2" title="Processing &amp; Classification" desc="NLP enrichment and structured analytics" />
          <div className="flex min-w-max items-center gap-2 overflow-x-auto pb-2">
            <ArchNode title="MongoDB" desc="Raw conversations" topBorder="border-t-emerald-400" />
            <Arrow label="sample &amp; classify" />
            <ArchNode title="NLP Service" desc="Python · spaCy · :8002" topBorder="border-t-purple-400" />
            <Arrow label="sentiment + intent" />
            <ArchNode title="Entity Extraction" desc="NER + product tags" topBorder="border-t-purple-400" />
            <Arrow label="frictions" />
            <ArchNode title="Hesitation Driver" desc="Friction categorization" topBorder="border-t-purple-400" />
            <Arrow label="aggregate" />
            <ArchNode title="Analytics Service" desc="Python · FastAPI · :8000" topBorder="border-t-orange-400" />
            <Arrow label="JSON metrics" />
            <ArchNode title="JSON Builder" desc="Computed metrics payload" topBorder="border-t-cyan-400" />
          </div>
        </div>

        {/* Layer 3: API &amp; Serving */}
        <div>
          <LayerHeader number="3" title="API &amp; Serving" desc="FastAPI → API Gateway → Next.js → Browser" />
          <div className="flex min-w-max items-center gap-2 overflow-x-auto pb-2">
            <ArchNode title="FastAPI" desc="Docker · :8000" topBorder="border-t-orange-400" />
            <Arrow label="/api/v1/*" />
            <ArchNode title="API Gateway" desc="Node.js · Express · Zod · :3000" topBorder="border-t-rose-400" />
            <Arrow label="proxy + cache" />
            <ArchNode title="JSON Response" desc="Validated dashboard data" topBorder="border-t-cyan-400" />
            <Arrow label="/api proxy" />
            <ArchNode title="Next.js 14" desc="Docker / :3001" topBorder="border-t-pink-400" />
            <Arrow label="React render" />
            <ArchNode title="Dashboard UI" desc="8 tabs · 12+ charts" topBorder="border-t-pink-400" />
          </div>
        </div>

        {/* Layer 4: Scheduling &amp; CI/CD */}
        <div>
          <LayerHeader number="4" title="Scheduling &amp; CI/CD" desc="GitHub Actions cron + auto-deploy on git push" />
          <div className="flex min-w-max items-center gap-2 overflow-x-auto pb-2">
            <ArchNode title="GitHub Actions" desc="Cron: 0 */6 * * *" topBorder="border-t-amber-400" />
            <Arrow label="HTTP POST" />
            <ArchNode title="Ingest Endpoint" desc="Background thread" topBorder="border-t-indigo-400" />
            <Arrow label="batch 200/req" />
            <ArchNode title="Scrapers" desc="Multi-source collectors" topBorder="border-t-blue-400" />
            <Arrow label="upsert" />
            <ArchNode title="MongoDB Atlas" desc="Grows continuously" topBorder="border-t-emerald-400" />
            <Arrow label="build" />
            <ArchNode title="Docker Compose" desc="Multi-service deploy" topBorder="border-t-sky-400" />
          </div>
        </div>
      </div>

      {/* Tech Stack Summary */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StackCard title="Ingestion" items={['Python 3.11', 'FastAPI', 'PRAW / YouTube API', 'Async collectors']} />
        <StackCard title="Processing" items={['spaCy NLP', 'VADER Sentiment', 'Custom classifiers', 'Entity extraction']} />
        <StackCard title="Infrastructure" items={['MongoDB', 'PostgreSQL', 'Elasticsearch', 'Redis', 'Docker Compose']} />
        <StackCard title="Frontend" items={['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Recharts', 'Zustand']} />
      </div>
    </div>
  );
}

function ArchNode({ title, desc, topBorder }: { title: string; desc: string; topBorder: string }) {
  return (
    <div className={`min-w-[140px] flex-shrink-0 rounded-lg border border-slate-700 border-t-4 bg-slate-800 p-3 text-center shadow-md transition hover:scale-105 ${topBorder}`}>
      <div className="text-xs font-bold text-white">{title}</div>
      <div className="mt-0.5 text-[10px] text-slate-400">{desc}</div>
    </div>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center px-1">
      <span className="mb-1 whitespace-nowrap text-[9px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <div className="flex items-center">
        <div className="h-0.5 w-5 bg-slate-500" />
        <div className="h-0 w-0 border-y-[5px] border-l-[6px] border-y-transparent border-l-slate-500" />
      </div>
    </div>
  );
}

function LayerHeader({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="mb-2">
      <span className="text-xs font-extrabold uppercase tracking-wider text-pink-400">Layer {number}:</span>{' '}
      <span className="text-sm font-bold text-white">{title}</span>
      <span className="text-sm text-slate-500"> — {desc}</span>
    </div>
  );
}

function StackCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-3">
      <h4 className="mb-2 text-sm font-bold text-white">{title}</h4>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-xs text-slate-400">• {item}</li>
        ))}
      </ul>
    </div>
  );
}
