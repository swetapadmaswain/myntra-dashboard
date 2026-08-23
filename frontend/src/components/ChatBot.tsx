'use client';

import { useEffect, useRef, useState } from 'react';
import { KPIMetrics } from '@/types';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

interface ChatBotProps {
  metrics?: KPIMetrics;
}

function titleCase(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatAnswer(template: string, metrics: KPIMetrics | undefined) {
  if (!metrics) return template;
  const total = metrics.total_signals || 1;
  const sentimentEntries = Object.entries(metrics.sentiment_distribution || {});
  const topSentiment = sentimentEntries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'neutral';
  const topHesitation = titleCase(metrics.primary_hesitation_driver || 'hesitation');
  const topIntentEntry = Object.entries(metrics.intent_distribution || {}).sort(
    (a, b) => b[1] - a[1]
  )[0];
  const topIntent = topIntentEntry ? titleCase(topIntentEntry[0]) : 'purchase intent';
  const topIntentPct = topIntentEntry
    ? ((topIntentEntry[1] / total) * 100).toFixed(1)
    : '0.0';

  return template
    .replace('{total}', String(metrics.total_signals))
    .replace('{bookmark}', (metrics.bookmarking_intent || 0).toFixed(1))
    .replace('{immediate}', (metrics.immediate_purchase_intent || 0).toFixed(1))
    .replace('{hesitation}', topHesitation)
    .replace('{hesitationPct}', (metrics.primary_hesitation_percentage || 0).toFixed(1))
    .replace('{intent}', topIntent)
    .replace('{intentPct}', topIntentPct)
    .replace('{sentiment}', titleCase(topSentiment))
    .replace('{informationLeakage}', String(metrics.information_leakage || 0));
}

const QUESTIONS = [
  'Why do users add fashion products to their wishlist?',
  'What prevents wishlisted products from eventually being purchased?',
  'What uncertainties remain after users have identified a product they like?',
  'What causes users to postpone a purchase?',
  'How do users compare multiple shortlisted products?',
  'What information do users seek outside Myntra before purchasing?',
  'What role do fit, size, styling, price, reviews, occasion and social validation play?',
  'When do users use the wishlist as genuine purchase intent versus simply as a bookmarking mechanism?',
  'How do these behaviors differ across user segments?',
  'What unmet needs emerge consistently across user conversations?',
];

const ANSWERS: Record<string, string> = {
  'why do users add fashion products to their wishlist':
    'Most wishlist adds come from genuine purchase intent. In the current data, {immediate}% of signals show immediate purchase intent, while only {bookmark}% are pure bookmarking.',
  'what prevents wishlisted products from eventually being purchased':
    'The biggest blocker is **{hesitation}** ({hesitationPct}% of hesitation signals). Concerns around how the item will look or fit in reality outweigh price and delivery issues.',
  'what uncertainties remain after users have identified a product they like':
    'Users still worry about fit, sizing, material quality, return policies, and whether the product matches the images. The dominant uncertainty right now is **{hesitation}**.',
  'what causes users to postpone a purchase':
    'Postponement is driven by unresolved hesitation — especially **{hesitation}** ({hesitationPct}%) — plus waiting for discounts, salary cycles, or needing a second opinion.',
  'how do users compare multiple shortlisted products':
    'They compare on visual appeal, price, size availability, reviews, and return flexibility. The intent split shows {intent} leading at {intentPct}%, suggesting most comparisons end in a strong favorite rather than a saved tie.',
  'what information do users seek outside myntra before purchasing':
    'Off-platform research includes fit videos, styling reels, review blogs, and price comparisons. We currently capture {informationLeakage} explicit off-platform mentions in this dataset.',
  'what role do fit, size, styling, price, reviews, occasion and social validation play':
    'These are the core purchase-decision factors. The hesitation breakdown shows visual/fit and sizing concerns dominate, while price, reviews, and occasion act as tie-breakers or validation signals.',
  'when do users use the wishlist as genuine purchase intent versus simply as a bookmarking mechanism':
    'Right now {immediate}% of signals are immediate purchase intent and {bookmark}% are bookmarking — so most wishlist usage leans toward near-term purchase rather than passive saving.',
  'how do these behaviors differ across user segments':
    'Segment-level differences are not yet exposed in this dataset, but the patterns suggest bargain-sensitive users wait for discounts, while fit/style-sensitive users hesitate until they can validate the product visually.',
  'what unmet needs emerge consistently across user conversations':
    'The clearest unmet need is confidence before checkout: better virtual try-on, detailed fit guidance, honest review summaries, and flexible returns for products flagged under **{hesitation}**.',
};

function findAnswer(text: string, metrics: KPIMetrics | undefined) {
  const normalized = text.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  if (!normalized) return null;
  for (const key of Object.keys(ANSWERS)) {
    const keyNorm = key.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    if (normalized === keyNorm || normalized.includes(keyNorm) || keyNorm.includes(normalized)) {
      return formatAnswer(ANSWERS[key], metrics);
    }
  }
  return null;
}

export function ChatBot({ metrics }: ChatBotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: 'Hi! I can answer questions about wishlist behavior. Pick a question below or type your own.',
    },
  ]);
  const [input, setInput] = useState('');
  const [selected, setSelected] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    const answer = findAnswer(userMsg, metrics);
    setTimeout(() => {
      if (answer) {
        setMessages((prev) => [...prev, { role: 'bot', text: answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: "I'm not sure I can answer that. Try asking one of these:",
          },
        ]);
      }
    }, 300);
    setInput('');
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-3 flex w-[400px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-myntra-gray-2 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-myntra-pink px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-myntra-pink">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 1-3.09-3.146L2.25 12l1.846-.708a4.5 4.5 0 0 1 3.146-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 1 3.09 3.146L14.75 12l-1.846.708a4.5 4.5 0 0 1-3.146 3.09Z"
                  />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">Wishlist AI</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-white/90 hover:text-white"
              aria-label="Close chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex h-[380px] flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === 'user'
                      ? 'ml-auto rounded-br-none bg-myntra-pink text-white'
                      : 'mr-auto rounded-bl-none bg-myntra-gray text-myntra-text-dark'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-myntra-gray p-3">
              <div className="mb-2">
                <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-myntra-text-light">
                  Choose a question
                </label>
                <select
                  value={selected}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      send(value);
                      setSelected('');
                    }
                  }}
                  className="w-full rounded-lg border border-myntra-gray-2 bg-white px-3 py-2 text-xs text-myntra-text-dark outline-none focus:border-myntra-pink"
                >
                  <option value="">Select a question…</option>
                  {QUESTIONS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send(input)}
                  placeholder="Ask a question…"
                  className="flex-1 rounded-full border border-myntra-gray-2 bg-white px-3 py-2 text-sm outline-none focus:border-myntra-pink"
                />
                <button
                  type="button"
                  onClick={() => send(input)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-myntra-pink text-white transition hover:bg-myntra-pink-dark"
                  aria-label="Send"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="group flex h-14 items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-6 text-white shadow-xl shadow-blue-500/40 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 active:scale-95 animate-glow"
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 1-3.09-3.146L2.25 12l1.846-.708a4.5 4.5 0 0 1 3.146-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 1 3.09 3.146L14.75 12l-1.846.708a4.5 4.5 0 0 1-3.146 3.09Z" />
          </svg>
        </span>
        <span className="text-base font-bold tracking-wide">Ask AI</span>
        {open ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0L4.5 13.5M12 21V3" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.015-7.01.063-1.584.233-2.707 1.626-2.707 3.228v6.741Z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
