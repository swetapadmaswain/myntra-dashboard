'use client';

import { KPIMetrics } from '@/types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#ff3f6c', '#0f172a', '#94969f', '#d4d5d9', '#282c3f', '#e6335b'];

function titleCase(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function toPieData(distribution?: Record<string, number>) {
  return Object.entries(distribution || {})
    .map(([name, value]) => ({ name: titleCase(name), value }))
    .filter((d) => d.value > 0);
}

function MetricCard({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm text-myntra-text-light">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-myntra-text-dark">{value}</p>
      <p className="mt-1 text-xs text-myntra-text-light">{sub}</p>
    </div>
  );
}

export function DiscoveryPanel({ metrics }: { metrics?: KPIMetrics }) {
  const m = metrics || ({} as KPIMetrics);
  const total = m.total_signals || 0;
  const sentimentData = toPieData(m.sentiment_distribution);
  const intentData = toPieData(m.intent_distribution);
  const hesitationData = toPieData(m.hesitation_distribution);

  const topHesitation = m.primary_hesitation_driver
    ? {
        name: titleCase(m.primary_hesitation_driver),
        pct: m.primary_hesitation_percentage || 0,
      }
    : null;

  const opportunityAreas = Object.entries(m.hesitation_distribution || {})
    .map(([key, count]) => {
      const pct = total ? (count / total) * 100 : 0;
      let priority = 'Low';
      if (pct >= 25) priority = 'Critical';
      else if (pct >= 15) priority = 'High';
      else if (pct >= 5) priority = 'Medium';
      return {
        name: titleCase(key),
        count,
        pct,
        priority,
      };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Wishlist as Bookmark"
          value={`${(m.bookmarking_intent || 0).toFixed(1)}%`}
          sub="Save without immediate purchase plan"
        />
        <MetricCard
          label="Immediate Purchase Intent"
          value={`${(m.immediate_purchase_intent || 0).toFixed(1)}%`}
          sub="Ready to buy now"
        />
        <MetricCard
          label="Top Purchase Blocker"
          value={topHesitation ? `${topHesitation.name} (${topHesitation.pct.toFixed(1)}%)` : '—'}
          sub="Why people hold back"
        />
        <MetricCard
          label="Information Leakage"
          value={m.information_leakage || 0}
          sub="Mentions of off-platform research"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-myntra-text-dark">Sentiment Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sentimentData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {sentimentData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-myntra-text-dark">Purchase vs Bookmarking Intent</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={intentData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {intentData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-myntra-text-dark">Hesitation Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={hesitationData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {hesitationData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-myntra-text-dark">Discovery Insights</h3>
        <ul className="space-y-3 text-sm text-myntra-text-dark">
          <li>
            <span className="font-semibold">Why add to wishlist?</span>{' '}
            {(m.immediate_purchase_intent || 0).toFixed(1)}% show immediate purchase intent, while{' '}
            {(m.bookmarking_intent || 0).toFixed(1)}% use it as a pure bookmarking tool.
          </li>
          <li>
            <span className="font-semibold">What prevents purchase?</span>{' '}
            {topHesitation
              ? `${topHesitation.name} is the dominant blocker at ${topHesitation.pct.toFixed(1)}% of conversations.`
              : 'No dominant hesitation driver detected.'}
          </li>
          <li>
            <span className="font-semibold">What uncertainties remain?</span>{' '}
            {opportunityAreas.slice(0, 3).map((a) => a.name).join(', ')} are the most cited concerns.
          </li>
          <li>
            <span className="font-semibold">How do users compare?</span>{' '}
            The intent split shows whether shoppers are in active purchase mode or still evaluating alternatives.
          </li>
          <li>
            <span className="font-semibold">What role do fit, price, styling, reviews, etc. play?</span>{' '}
            The hesitation breakdown quantifies the relative influence of each product concern.
          </li>
        </ul>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-myntra-text-dark">Opportunity Areas</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-myntra-text-light">
                <th className="pb-2 font-medium">Area</th>
                <th className="pb-2 font-medium">Mentions</th>
                <th className="pb-2 font-medium">Share</th>
                <th className="pb-2 font-medium">Fix Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-myntra-gray">
              {opportunityAreas.map((area) => (
                <tr key={area.name}>
                  <td className="py-3 text-myntra-text-dark">{area.name}</td>
                  <td className="py-3">{area.count}</td>
                  <td className="py-3">{area.pct.toFixed(1)}%</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        area.priority === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : area.priority === 'High'
                          ? 'bg-orange-100 text-orange-700'
                          : area.priority === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {area.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
