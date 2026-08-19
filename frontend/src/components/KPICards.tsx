interface KPICardsProps {
  metrics: {
    total_signals?: number;
    bookmarking_intent?: number;
    immediate_purchase_intent?: number;
    primary_hesitation_driver?: string;
    primary_hesitation_percentage?: number;
    sentiment_distribution?: Record<string, number>;
  };
}

export function KPICards({ metrics }: KPICardsProps) {
  const totalSentiment = Object.values(metrics.sentiment_distribution || {}).reduce((a, b) => a + b, 0);
  const negative = metrics.sentiment_distribution?.negative || 0;
  const negativePct = totalSentiment ? ((negative / totalSentiment) * 100).toFixed(1) : '0';
  const driver = metrics.primary_hesitation_driver
    ? `${metrics.primary_hesitation_driver} (${metrics.primary_hesitation_percentage?.toFixed(1)}%)`
    : '—';

  const cards = [
    { label: 'Total Signals', value: metrics.total_signals ?? 0, sub: 'All sources' },
    { label: 'Bookmarking Intent', value: `${(metrics.bookmarking_intent ?? 0).toFixed(1)}%`, sub: 'Wishlist intent' },
    { label: 'Primary Hesitation', value: driver, sub: 'Top driver' },
    { label: 'Negative Sentiment', value: `${negativePct}%`, sub: `${negative} mentions` },
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
