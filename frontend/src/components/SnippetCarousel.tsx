'use client';

import { useEffect, useState } from 'react';
import { Snippet } from '@/types';

interface SnippetCarouselProps {
  snippets: Snippet[];
}

const sentimentColor: Record<string, string> = {
  positive: 'bg-green-100 text-green-700',
  neutral: 'bg-gray-100 text-gray-700',
  negative: 'bg-red-100 text-red-700',
};

function titleCase(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export function SnippetCarousel({ snippets }: SnippetCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [snippets]);

  if (!snippets.length) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-xl bg-white p-8 text-center text-myntra-text-light shadow-sm">
        No snippets found for the current filters.
      </div>
    );
  }

  const total = snippets.length;
  const goTo = (next: number) => setIndex((next + total) % total);

  return (
    <div className="flex h-[420px] flex-col rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-myntra-gray px-4 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-myntra-text-light">
          Recent Snippets
        </h3>
        <span className="text-xs font-medium text-myntra-text-light">
          {index + 1} / {total}
        </span>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {snippets.map((snippet, idx) => (
            <div key={idx} className="h-full w-full shrink-0 overflow-y-auto p-4">
              <p className="text-sm leading-relaxed text-myntra-text-dark">{snippet.text}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-myntra-gray px-2 py-0.5 text-xs font-medium text-myntra-text-light">
                  {snippet.source}
                </span>
                {snippet.sentiment && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      sentimentColor[snippet.sentiment] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {titleCase(snippet.sentiment)}
                  </span>
                )}
                {snippet.hesitation_driver && (
                  <span className="rounded-full bg-myntra-pink/10 px-2 py-0.5 text-xs font-medium text-myntra-pink">
                    {titleCase(snippet.hesitation_driver)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-myntra-gray px-4 py-3">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          className="rounded-lg border border-myntra-gray-2 px-3 py-1.5 text-xs font-medium text-myntra-text-dark transition hover:bg-myntra-gray"
        >
          Previous
        </button>

        <div className="flex items-center gap-1.5">
          {snippets.slice(0, 8).map((_, dot) => (
            <button
              key={dot}
              type="button"
              aria-label={`Go to snippet ${dot + 1}`}
              onClick={() => goTo(dot)}
              className={`h-1.5 rounded-full transition-all ${
                dot === index ? 'w-4 bg-myntra-pink' : 'w-1.5 bg-myntra-gray-2'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => goTo(index + 1)}
          className="rounded-lg border border-myntra-gray-2 px-3 py-1.5 text-xs font-medium text-myntra-text-dark transition hover:bg-myntra-gray"
        >
          Next
        </button>
      </div>
    </div>
  );
}
