interface KPICardsProps {
  metrics: {
    total_signals?: number;
    bookmarking_intent?: number;
    immediate_purchase_intent?: number;
    primary_hesitation_driver?: string;
    primary_hesitation_percentage?: number;
    sentiment_distribution?: Record<string, number>;
    intent_distribution?: Record<string, number>;
  };
}

export function KPICards({ metrics }: KPICardsProps) {
  const totalSentiment = Object.values(metrics.sentiment_distribution || {}).reduce((a, b) => a + b, 0);
  const neutral = metrics.sentiment_distribution?.neutral || 0;
  const neutralPct = totalSentiment ? ((neutral / totalSentiment) * 100).toFixed(1) : '0';
  const driver = metrics.primary_hesitation_driver
    ? `${metrics.primary_hesitation_driver} (${metrics.primary_hesitation_percentage?.toFixed(1)}%)`
    : '—';

  const cards = [
    { label: 'Total Signals', value: metrics.total_signals ?? 0, sub: 'Processed snippets' },
    { label: 'Wishlist Intent', value: `${(metrics.bookmarking_intent ?? 0).toFixed(1)}%`, sub: 'Bookmarking users' },
    { label: 'Top Hesitation', value: driver, sub: 'Why people hold back' },
    { label: 'Neutral Sentiment', value: `${neutralPct}%`, sub: `${neutral} mentions` },
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
