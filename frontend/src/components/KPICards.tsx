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
    { label: 'Total Snippets', value: metrics.total_signals ?? 0, sub: 'Analyzed conversations' },
    { label: 'Avg Sentiment', value: avgSentiment, sub: 'Net sentiment score' },
    { label: 'Top Friction', value: topFriction, sub: 'Why people hold back' },
    { label: 'Top Intent', value: topIntent, sub: 'Dominant buyer intent' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-myntra-text-light">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold text-myntra-text-dark">{card.value}</p>
          <p className="mt-1 text-xs text-myntra-text-light">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
