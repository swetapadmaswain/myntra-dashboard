'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, AreaChart, Area } from 'recharts';

interface BehaviouralAnalysisProps {
  data: any;
}

const SOURCE_COLORS: Record<string, string> = {
  youtube: '#ff3f6c',
  appstore: '#9333ea',
  reddit: '#282c3f',
  unknown: '#535766',
};

function titleCase(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatPct(v: number) {
  return Number(v || 0).toFixed(1);
}

function formatNumber(n: number) {
  return Number(n || 0).toLocaleString();
}

export function BehaviouralAnalysis({ data }: BehaviouralAnalysisProps) {
  if (!data || !data.summary) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-myntra-text-light">
        No behavioural data available.
      </div>
    );
  }

  const summary = data.summary;
  const funnel = data.funnel || [];
  const sources = data.source_conversion_rates || [];
  const hourly = data.hourly_activity || [];
  const sentimentByIntent = data.sentiment_by_intent || [];
  const topUsers = data.top_hesitant_users || [];
  const matrix = data.intent_friction_matrix || [];

  const paddedHourly = Array.from({ length: 24 }, (_, i) => {
    const found = hourly.find((h: any) => h.hour === i);
    return { hour: `${i}:00`, count: found ? found.count : 0 };
  });

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <SummaryCard label="Active Users" value={formatNumber(summary.active_users)} />
        <SummaryCard label="Sessions" value={formatNumber(summary.total_sessions)} />
        <SummaryCard label="Avg Actions / Session" value={summary.avg_actions_per_session} />
        <SummaryCard label="Bounce Rate" value={`${formatPct(summary.bounce_rate)}%`} />
        <SummaryCard label="Conversion Rate" value={`${formatPct(summary.conversion_rate)}%`} />
        <SummaryCard label="Purchase Intent" value={`${formatPct(summary.purchase_intent_rate)}%`} />
      </div>

      {/* Funnel */}
      <div className="rounded-xl bg-myntra-gray p-4">
        <h3 className="mb-3 text-sm font-semibold text-myntra-text-dark">Journey Funnel</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel} margin={{ top: 8, right: 16, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="step" angle={-20} textAnchor="end" height={60} tick={{ fontSize: 11, fill: '#374151' }} tickFormatter={(v) => titleCase(v)} />
              <YAxis tick={{ fontSize: 12, fill: '#374151' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-lg">
                      <div className="font-semibold text-myntra-text-dark">{titleCase(d.step)}</div>
                      <div className="text-myntra-text-light">Count: <span className="font-medium text-myntra-text-dark">{d.count}</span></div>
                      <div className="text-myntra-text-light">Share: <span className="font-medium text-myntra-text-dark">{formatPct(d.percentage)}%</span></div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {funnel.map((_item: any, i: number) => (
                  <Cell key={i} fill="#ff3f6c" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Source conversion rates */}
        <div className="rounded-xl bg-myntra-gray p-4">
          <h3 className="mb-3 text-sm font-semibold text-myntra-text-dark">Purchase Intent by Source</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sources} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="source" tick={{ fontSize: 12, fill: '#374151' }} />
                <YAxis tick={{ fontSize: 12, fill: '#374151' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-lg">
                        <div className="font-semibold text-myntra-text-dark">{titleCase(d.source)}</div>
                        <div className="text-myntra-text-light">Total: {formatNumber(d.total)}</div>
                        <div className="text-myntra-text-light">Purchase: {formatNumber(d.immediate_purchase)}</div>
                        <div className="text-myntra-text-light">Rate: {formatPct(d.conversion_rate)}%</div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="conversion_rate" radius={[4, 4, 0, 0]}>
                  {sources.map((s: any, i: number) => (
                    <Cell key={i} fill={SOURCE_COLORS[s.source] || '#535766'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly activity */}
        <div className="rounded-xl bg-myntra-gray p-4">
          <h3 className="mb-3 text-sm font-semibold text-myntra-text-dark">Activity by Hour</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={paddedHourly} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHour" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#374151' }} interval={3} />
                <YAxis tick={{ fontSize: 12, fill: '#374151' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-lg">
                        <div className="font-semibold text-myntra-text-dark">{d.hour}</div>
                        <div className="text-myntra-text-light">Signals: <span className="font-medium text-myntra-text-dark">{d.count}</span></div>
                      </div>
                    );
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="#9333ea" fillOpacity={1} fill="url(#colorHour)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sentiment by intent */}
      <div className="rounded-xl bg-myntra-gray p-4">
        <h3 className="mb-3 text-sm font-semibold text-myntra-text-dark">Sentiment by Intent</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-myntra-gray-2 text-myntra-text-light">
              <tr>
                <th className="pb-2 pr-4 font-medium">Intent</th>
                <th className="pb-2 pr-4 font-medium">Positive</th>
                <th className="pb-2 pr-4 font-medium">Neutral</th>
                <th className="pb-2 pr-4 font-medium">Negative</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-myntra-gray-2">
              {sentimentByIntent.length === 0 && (
                <tr>
                  <td className="py-2 pr-4 text-myntra-text-light" colSpan={4}>No sentiment data.</td>
                </tr>
              )}
              {sentimentByIntent.map((row: any, i: number) => (
                <tr key={i}>
                  <td className="py-2 pr-4 font-medium text-myntra-text-dark">{titleCase(row.intent)}</td>
                  <td className="py-2 pr-4 text-myntra-text-light">{formatNumber(row.positive)} ({formatPct(row.positive_pct)}%)</td>
                  <td className="py-2 pr-4 text-myntra-text-light">{formatNumber(row.neutral)} ({formatPct(row.neutral_pct)}%)</td>
                  <td className="py-2 pr-4 text-myntra-text-light">{formatNumber(row.negative)} ({formatPct(row.negative_pct)}%)</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top hesitant users */}
      <div className="rounded-xl bg-myntra-gray p-4">
        <h3 className="mb-3 text-sm font-semibold text-myntra-text-dark">Top Hesitant Shoppers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-myntra-gray-2 text-myntra-text-light">
              <tr>
                <th className="pb-2 pr-4 font-medium">User</th>
                <th className="pb-2 pr-4 font-medium">Signals</th>
                <th className="pb-2 pr-4 font-medium">Top Friction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-myntra-gray-2">
              {topUsers.length === 0 && (
                <tr>
                  <td className="py-2 pr-4 text-myntra-text-light" colSpan={3}>No user data.</td>
                </tr>
              )}
              {topUsers.map((u: any, i: number) => (
                <tr key={i}>
                  <td className="py-2 pr-4 font-medium text-myntra-text-dark">{u.author}</td>
                  <td className="py-2 pr-4 text-myntra-text-light">{formatNumber(u.count)}</td>
                  <td className="py-2 pr-4 text-myntra-text-light">{titleCase(u.top_friction)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intent-Friction Matrix */}
      <div className="rounded-xl bg-myntra-gray p-4">
        <h3 className="mb-3 text-sm font-semibold text-myntra-text-dark">Intent-Friction Correlation</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-myntra-gray-2 text-myntra-text-light">
              <tr>
                <th className="pb-2 pr-4 font-medium">Intent</th>
                <th className="pb-2 pr-4 font-medium">Friction</th>
                <th className="pb-2 pr-4 font-medium">Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-myntra-gray-2">
              {matrix.length === 0 && (
                <tr>
                  <td className="py-2 pr-4 text-myntra-text-light" colSpan={3}>No correlation data.</td>
                </tr>
              )}
              {matrix.map((m: any, i: number) => (
                <tr key={i}>
                  <td className="py-2 pr-4 font-medium text-myntra-text-dark">{titleCase(m.intent)}</td>
                  <td className="py-2 pr-4 text-myntra-text-light">{titleCase(m.friction)}</td>
                  <td className="py-2 pr-4 text-myntra-text-light">{formatNumber(m.count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <div className="text-xs text-myntra-text-light">{label}</div>
      <div className="text-lg font-semibold text-myntra-text-dark">{value}</div>
    </div>
  );
}
