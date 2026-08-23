interface KPICardsProps {
  metrics: {
    total_signals?: number;
    bookmarking_intent?: number;
    immediate_purchase_intent?: number;
    primary_hesitation_driver?: string;
    primary_hesitation_percentage?: number;
    sentiment_distribution?: Record<string, number>;
    intent_distribution?: Record<string, number>;
    hesitation_distribution?: Record<string, number>;
  };
}

function titleCase(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export function KPICards({ metrics }: KPICardsProps) {
  const totalSentiment = Object.values(metrics.sentiment_distribution || {}).reduce((a, b) => a + b, 0);
  const positive = metrics.sentiment_distribution?.positive || 0;
  const negative = metrics.sentiment_distribution?.negative || 0;
  const avgSentiment = totalSentiment
    ? (((positive - negative) / totalSentiment) * 100).toFixed(1)
    : '0.0';

  const topFriction = metrics.primary_hesitation_driver
    ? `${titleCase(metrics.primary_hesitation_driver)} (${metrics.primary_hesitation_percentage?.toFixed(1)}%)`
    : '—';

  const intents = metrics.intent_distribution || {};
  const totalIntent = Object.values(intents).reduce((a, b) => a + b, 0);
  const topIntentEntry = totalIntent
    ? Object.entries(intents).sort((a, b) => b[1] - a[1])[0]
    : null;
  const topIntent = topIntentEntry
    ? `${titleCase(topIntentEntry[0])} (${((topIntentEntry[1] / totalIntent) * 100).toFixed(1)}%)`
    : '—';

  const cards = [
    { label: 'Total Snippets', value: metrics.total_signals ?? 0, sub: 'Analyzed conversations', icon: '📊' },
    { label: 'Avg Sentiment', value: avgSentiment, sub: 'Net sentiment score', icon: '💭' },
    { label: 'Top Friction', value: topFriction, sub: 'Why people hold back', icon: '⚡' },
    { label: 'Top Intent', value: topIntent, sub: 'Dominant buyer intent', icon: '🎯' },
  ];

  const cardStyles = [
    { gradient: 'from-myntra-pink to-myntra-neon-pink', bg: 'bg-myntra-pink/5', border: 'border-myntra-pink/30', text: 'text-myntra-pink' },
    { gradient: 'from-myntra-orange to-amber-500', bg: 'bg-myntra-orange/5', border: 'border-myntra-orange/30', text: 'text-myntra-orange' },
    { gradient: 'from-myntra-purple to-indigo-600', bg: 'bg-myntra-purple/5', border: 'border-myntra-purple/30', text: 'text-myntra-purple' },
    { gradient: 'from-cyan-600 to-blue-600', bg: 'bg-cyan-600/5', border: 'border-cyan-600/30', text: 'text-cyan-700' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`group relative overflow-hidden rounded-2xl bg-white p-5 shadow-md transition hover:shadow-xl hover:scale-[1.02] border-b-4 ${cardStyles[i].border}`}
        >
          {/* Gradient accent bar */}
          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${cardStyles[i].gradient}`} />

          {/* Icon badge */}
          <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${cardStyles[i].gradient} text-lg shadow-sm`}>
            {card.icon}
          </div>

          <p className="text-sm font-medium text-myntra-text-light">{card.label}</p>
          <p className={`mt-1 text-2xl font-bold ${cardStyles[i].text}`}>
            {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
          </p>
          <p className="mt-1 text-xs text-myntra-text-light">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
