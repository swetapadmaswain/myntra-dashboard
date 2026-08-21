'use client';

export function ArchitectureDiagram() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-myntra-text-dark">Dashboard Architecture</h3>
      <p className="mb-6 text-sm text-myntra-text-light">Complete data pipeline from ingestion to dashboard visualization.</p>

      <div className="overflow-x-auto pb-4">
        <div className="flex items-stretch gap-0 min-w-max">
          {/* Level 0: Data Sources */}
          <Level title="Data Sources" subtitle="External feedback channels" color="bg-blue-500">
            <ArchNode title="App Store Reviews" subtitle="Google Play / iOS" color="bg-blue-400" small />
            <ArchNode title="Reddit Posts" subtitle="r/myntra & fashion" color="bg-blue-400" small />
            <ArchNode title="YouTube Comments" subtitle="Fashion reviews" color="bg-blue-400" small />
            <ArchNode title="Twitter/X" subtitle="Brand mentions" color="bg-blue-400" small />
          </Level>

          <HConnector />

          {/* Level 1: Data Ingestion */}
          <Level title="Data Ingestion" subtitle="Python · FastAPI · :8001" color="bg-indigo-500">
            <ArchNode title="API Collectors" subtitle="Reddit, YouTube, App Store" color="bg-indigo-400" small />
            <ArchNode title="Webhook Receivers" subtitle="Real-time ingestion" color="bg-indigo-400" small />
          </Level>

          <HConnector />

          {/* Level 2: Storage */}
          <Level title="Storage" subtitle="Data persistence layer" color="bg-green-500">
            <ArchNode title="MongoDB" subtitle="Raw conversations" color="bg-green-500" small />
            <ArchNode title="PostgreSQL" subtitle="User segments" color="bg-green-500" small />
            <ArchNode title="Elasticsearch" subtitle="Snippet search" color="bg-green-500" small />
            <ArchNode title="Redis" subtitle="Cache layer" color="bg-green-500" small />
          </Level>

          <HConnector />

          {/* Level 3: NLP Service */}
          <Level title="NLP Service" subtitle="Python · spaCy · :8002" color="bg-purple-500">
            <ArchNode title="Sentiment Analysis" subtitle="VADER / Transformer" color="bg-purple-400" small />
            <ArchNode title="Intent Classification" subtitle="Buy / Browse / Compare" color="bg-purple-400" small />
            <ArchNode title="Entity Extraction" subtitle="NER + product tags" color="bg-purple-400" small />
            <ArchNode title="Hesitation Driver" subtitle="Friction categorization" color="bg-purple-400" small />
          </Level>

          <HConnector />

          {/* Level 4: Analytics Service */}
          <Level title="Analytics Service" subtitle="Python · FastAPI · :8000" color="bg-orange-500">
            <ArchNode title="KPI Calculator" subtitle="Metrics aggregation" color="bg-orange-400" small />
            <ArchNode title="Friction Analyzer" subtitle="Breakdown & trends" color="bg-orange-400" small />
            <ArchNode title="Intent Analyzer" subtitle="Intent matrix" color="bg-orange-400" small />
            <ArchNode title="Journey Analyzer" subtitle="Funnel tracking" color="bg-orange-400" small />
            <ArchNode title="Opportunity Analyzer" subtitle="Priority matrix" color="bg-orange-400" small />
          </Level>

          <HConnector />

          {/* Level 5: API Gateway */}
          <Level title="API Gateway" subtitle="Node.js · Express · Zod · :3000" color="bg-red-500">
            <ArchNode title="Route Proxying" subtitle="Service orchestration" color="bg-red-400" small />
            <ArchNode title="Redis Cache" subtitle="Response caching" color="bg-red-400" small />
            <ArchNode title="Zod Validation" subtitle="Schema enforcement" color="bg-red-400" small />
          </Level>

          <HConnector />

          {/* Level 6: Frontend */}
          <Level title="Frontend (Next.js 14)" subtitle="React · TS · Tailwind · :3001" color="bg-pink-500">
            <ArchNode title="Dashboard" subtitle="Main analytics view" color="bg-pink-400" small />
            <ArchNode title="KPI Cards" subtitle="Live metrics" color="bg-pink-400" small />
            <ArchNode title="Charts" subtitle="Recharts visualizations" color="bg-pink-400" small />
            <ArchNode title="ChatBot" subtitle="Q&A assistant" color="bg-pink-400" small />
            <ArchNode title="Snippet Carousel" subtitle="Feedback browser" color="bg-pink-400" small />
          </Level>

          <HConnector />

          {/* Level 7: State Management */}
          <Level title="State Management" subtitle="Client-side state" color="bg-teal-500">
            <ArchNode title="Zustand Store" subtitle="Filters & tab state" color="bg-teal-500" small />
            <ArchNode title="React Query" subtitle="Data fetching & cache" color="bg-teal-500" small />
            <ArchNode title="Axios" subtitle="API client (/api proxy)" color="bg-teal-500" small />
          </Level>
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

function ArchNode({ title, subtitle, color, small }: { title: string; subtitle: string; color: string; small?: boolean }) {
  return (
    <div className={`${small ? 'px-3 py-2' : 'px-5 py-3'} rounded-lg ${color} text-white text-center shadow-md transition hover:scale-105`}>
      <div className={`${small ? 'text-xs' : 'text-sm'} font-semibold`}>{title}</div>
      <div className="text-[10px] opacity-90">{subtitle}</div>
    </div>
  );
}

function Level({ title, subtitle, color, children }: { title: string; subtitle: string; color: string; children: React.ReactNode }) {
  return (
    <div className="flex w-48 flex-col items-center gap-3">
      <div className={`w-full rounded-lg ${color} px-4 py-3 text-center text-white shadow-lg`}>
        <div className="text-sm font-bold">{title}</div>
        <div className="text-[10px] opacity-90">{subtitle}</div>
      </div>
      <div className="flex w-full flex-col items-center gap-2">{children}</div>
    </div>
  );
}

function HConnector() {
  return (
    <div className="flex items-center pt-12">
      <div className="h-0.5 w-6 bg-gray-300" />
      <div className="h-0 w-0 border-y-4 border-l-6 border-y-transparent border-l-gray-400" />
    </div>
  );
}

function StackCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-myntra-gray p-3">
      <h4 className="mb-2 text-sm font-semibold text-myntra-text-dark">{title}</h4>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-xs text-myntra-text-light">• {item}</li>
        ))}
      </ul>
    </div>
  );
}
