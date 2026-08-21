'use client';

export function ArchitectureDiagram() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-myntra-text-dark">Dashboard Architecture</h3>
      <p className="mb-6 text-sm text-myntra-text-light">Complete data pipeline from ingestion to dashboard visualization.</p>

      <div className="flex flex-col items-center">
        {/* Level 0: Data Sources */}
        <ArchNode title="Data Sources" subtitle="External feedback channels" color="bg-blue-500" />
        <Connector />
        <div className="flex gap-4">
          <ArchNode title="App Store Reviews" subtitle="Google Play / iOS" color="bg-blue-400" small />
          <ArchNode title="Reddit Posts" subtitle="r/myntra & fashion" color="bg-blue-400" small />
          <ArchNode title="YouTube Comments" subtitle="Fashion reviews" color="bg-blue-400" small />
          <ArchNode title="Twitter/X" subtitle="Brand mentions" color="bg-blue-400" small />
        </div>

        <Connector />
        {/* Level 1: Data Ingestion */}
        <ArchNode title="Data Ingestion Service" subtitle="Python · FastAPI · Port 8001" color="bg-indigo-500" />
        <div className="flex gap-8">
          <div className="flex flex-col items-center">
            <Connector />
            <ArchNode title="API Collectors" subtitle="Reddit, YouTube, App Store APIs" color="bg-indigo-400" small />
          </div>
          <div className="flex flex-col items-center">
            <Connector />
            <ArchNode title="Webhook Receivers" subtitle="Real-time ingestion" color="bg-indigo-400" small />
          </div>
        </div>

        <Connector />
        {/* Level 2: Storage */}
        <div className="flex gap-4">
          <ArchNode title="MongoDB" subtitle="Raw conversations" color="bg-green-500" />
          <ArchNode title="PostgreSQL" subtitle="User segments" color="bg-green-500" />
          <ArchNode title="Elasticsearch" subtitle="Snippet search" color="bg-green-500" />
          <ArchNode title="Redis" subtitle="Cache layer" color="bg-green-500" />
        </div>

        <Connector />
        {/* Level 3: NLP Service */}
        <ArchNode title="NLP Service" subtitle="Python · spaCy · Port 8002" color="bg-purple-500" />
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <Connector />
            <ArchNode title="Sentiment Analysis" subtitle="VADER / Transformer" color="bg-purple-400" small />
          </div>
          <div className="flex flex-col items-center">
            <Connector />
            <ArchNode title="Intent Classification" subtitle="Buy / Browse / Compare" color="bg-purple-400" small />
          </div>
          <div className="flex flex-col items-center">
            <Connector />
            <ArchNode title="Entity Extraction" subtitle="NER + product tags" color="bg-purple-400" small />
          </div>
          <div className="flex flex-col items-center">
            <Connector />
            <ArchNode title="Hesitation Driver" subtitle="Friction categorization" color="bg-purple-400" small />
          </div>
        </div>

        <Connector />
        {/* Level 4: Analytics Service */}
        <ArchNode title="Analytics Service" subtitle="Python · FastAPI · Port 8000" color="bg-orange-500" />
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex flex-col items-center">
            <Connector />
            <ArchNode title="KPI Calculator" subtitle="Metrics aggregation" color="bg-orange-400" small />
          </div>
          <div className="flex flex-col items-center">
            <Connector />
            <ArchNode title="Friction Analyzer" subtitle="Breakdown & trends" color="bg-orange-400" small />
          </div>
          <div className="flex flex-col items-center">
            <Connector />
            <ArchNode title="Intent Analyzer" subtitle="Intent matrix" color="bg-orange-400" small />
          </div>
          <div className="flex flex-col items-center">
            <Connector />
            <ArchNode title="Journey Analyzer" subtitle="Funnel tracking" color="bg-orange-400" small />
          </div>
          <div className="flex flex-col items-center">
            <Connector />
            <ArchNode title="Opportunity Analyzer" subtitle="Priority matrix" color="bg-orange-400" small />
          </div>
        </div>

        <Connector />
        {/* Level 5: API Gateway */}
        <ArchNode title="API Gateway" subtitle="Node.js · Express · Zod · Port 3000" color="bg-red-500" />
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <Connector />
            <ArchNode title="Route Proxying" subtitle="Service orchestration" color="bg-red-400" small />
          </div>
          <div className="flex flex-col items-center">
            <Connector />
            <ArchNode title="Redis Cache" subtitle="Response caching" color="bg-red-400" small />
          </div>
          <div className="flex flex-col items-center">
            <Connector />
            <ArchNode title="Zod Validation" subtitle="Schema enforcement" color="bg-red-400" small />
          </div>
        </div>

        <Connector />
        {/* Level 6: Frontend */}
        <ArchNode title="Frontend (Next.js 14)" subtitle="React · TypeScript · Tailwind · Port 3001" color="bg-pink-500" />
        <div className="flex flex-wrap justify-center gap-3">
          <div className="flex flex-col items-center">
            <Connector />
            <ArchNode title="Dashboard" subtitle="Main analytics view" color="bg-pink-400" small />
          </div>
          <div className="flex flex-col items-center">
            <Connector />
            <ArchNode title="KPI Cards" subtitle="Live metrics" color="bg-pink-400" small />
          </div>
          <div className="flex flex-col items-center">
            <Connector />
            <ArchNode title="Charts" subtitle="Recharts visualizations" color="bg-pink-400" small />
          </div>
          <div className="flex flex-col items-center">
            <Connector />
            <ArchNode title="ChatBot" subtitle="Q&A assistant" color="bg-pink-400" small />
          </div>
          <div className="flex flex-col items-center">
            <Connector />
            <ArchNode title="Snippet Carousel" subtitle="Feedback browser" color="bg-pink-400" small />
          </div>
        </div>

        <Connector />
        {/* Level 7: State Management */}
        <div className="flex gap-4">
          <ArchNode title="Zustand Store" subtitle="Filters & tab state" color="bg-teal-500" small />
          <ArchNode title="React Query" subtitle="Data fetching & cache" color="bg-teal-500" small />
          <ArchNode title="Axios" subtitle="API client (/api proxy)" color="bg-teal-500" small />
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

function Connector() {
  return <div className="my-2 h-6 w-0.5 bg-gray-300" />;
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
