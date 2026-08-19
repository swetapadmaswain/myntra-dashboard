interface KPICardsProps {
  metrics: {
    total_snippets?: number;
    avg_sentiment_score?: number;
    top_friction_driver?: string;
    top_intent?: string;
    snippet_growth_rate?: number;
  };
}

export function KPICards({ metrics }: KPICardsProps) {
  const cards = [
    { label: 'Total Snippets', value: metrics.total_snippets ?? 0, sub: 'All sources' },
    { label: 'Avg Sentiment', value: (metrics.avg_sentiment_score ?? 0).toFixed(2), sub: '-1 to +1' },
    { label: 'Top Friction', value: metrics.top_friction_driver ?? '—', sub: 'Most reported' },
    { label: 'Top Intent', value: metrics.top_intent ?? '—', sub: 'Dominant intent' },
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
