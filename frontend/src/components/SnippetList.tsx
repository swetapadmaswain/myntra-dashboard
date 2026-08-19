import { Snippet } from '@/types';

interface SnippetListProps {
  snippets: Snippet[];
}

const sentimentColor: Record<string, string> = {
  positive: 'bg-green-100 text-green-700',
  neutral: 'bg-gray-100 text-gray-700',
  negative: 'bg-red-100 text-red-700',
};

export function SnippetList({ snippets }: SnippetListProps) {
  if (!snippets.length) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-myntra-text-light shadow-sm">
        No snippets found for the current filters.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {snippets.map((snippet, idx) => (
        <div key={idx} className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-myntra-text-dark">{snippet.text}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-myntra-text-light">Source: {snippet.source}</span>
            {snippet.sentiment && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sentimentColor[snippet.sentiment] || 'bg-gray-100'}`}>
                {snippet.sentiment}
              </span>
            )}
            {snippet.hesitation_driver && (
              <span className="rounded-full bg-myntra-pink/10 px-2 py-0.5 text-xs font-medium text-myntra-pink">
                {snippet.hesitation_driver}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
