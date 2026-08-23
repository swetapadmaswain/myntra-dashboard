'use client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface IntentRadarChartProps {
  data: { subject: string; A: number; fullMark: number; percentage?: number }[];
}

const INTENT_COLORS = [
  '#ff3f6c',
  '#5b21b6',
  '#0891b2',
  '#059669',
  '#d97706',
  '#dc2626',
];

export function IntentRadarChart({ data }: IntentRadarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-myntra-text-light">
        No intent data available.
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + (d.A || 0), 0);
  const sorted = [...data].sort((a, b) => b.A - a.A);
  const top = sorted[0];
  const maxCount = Math.max(...data.map((d) => d.A), 1);

  return (
    <div>
      {/* Stat cards with gradient backgrounds */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-br from-myntra-pink to-purple-600 p-4 text-white shadow-md">
          <div className="text-xs font-medium text-white/80">Total Intent Signals</div>
          <div className="mt-1 text-2xl font-bold">{total.toLocaleString()}</div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white/60" style={{ width: '100%' }} />
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 p-4 text-white shadow-md">
          <div className="text-xs font-medium text-white/80">Dominant Intent</div>
          <div className="mt-1 text-xl font-bold">{top.subject}</div>
          <div className="mt-2 inline-flex rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
            {sorted.length} intent types
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 p-4 text-white shadow-md">
          <div className="text-xs font-medium text-white/80">Dominant Share</div>
          <div className="mt-1 text-2xl font-bold">{top.percentage?.toFixed(1) ?? ((top.A / total) * 100).toFixed(1)}%</div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white/60"
              style={{ width: `${top.percentage ?? ((top.A / total) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Radar chart with gradient + colored grid */}
      <div className="mb-6 rounded-xl bg-gradient-to-b from-white to-myntra-gray p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-myntra-text-dark">Intent Distribution Radar</h3>
          <div className="flex items-center gap-2 text-xs text-myntra-text-light">
            <span className="inline-block h-2 w-2 rounded-full bg-myntra-pink" />
            Signal Strength
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} outerRadius="75%">
              <defs>
                <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ff3f6c" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#5b21b6" stopOpacity={0.5} />
                </linearGradient>
                <linearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff3f6c" />
                  <stop offset="100%" stopColor="#5b21b6" />
                </linearGradient>
              </defs>
              <PolarGrid stroke="#d4d5d9" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 12, fill: '#282c3f', fontWeight: 600 }}
              />
              <PolarRadiusAxis
                tick={{ fontSize: 10, fill: '#94969f' }}
                axisLine={false}
                tickCount={5}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  const pct = d.percentage ?? (total > 0 ? (d.A / total) * 100 : 0);
                  return (
                    <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs shadow-xl">
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: INTENT_COLORS[data.findIndex((x) => x.subject === d.subject) % INTENT_COLORS.length] }}
                        />
                        <span className="font-semibold text-myntra-text-dark">{d.subject}</span>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-myntra-text-light">
                          Count: <span className="font-semibold text-myntra-text-dark">{d.A.toLocaleString()}</span>
                        </div>
                        <div className="text-myntra-text-light">
                          Share: <span className="font-semibold text-myntra-text-dark">{pct.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Radar
                name="Intent"
                dataKey="A"
                stroke="url(#radarStroke)"
                fill="url(#radarGradient)"
                fillOpacity={0.6}
                strokeWidth={2}
                dot={{ r: 4, fill: '#ff3f6c', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#5b21b6', strokeWidth: 2, stroke: '#fff' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Animated horizontal bars instead of plain table */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-myntra-text-dark">Intent Breakdown</h3>
        {sorted.map((d, i) => {
          const pct = d.percentage ?? (total > 0 ? (d.A / total) * 100 : 0);
          const color = INTENT_COLORS[i % INTENT_COLORS.length];
          return (
            <div key={i} className="group">
              <div className="mb-1 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full transition-transform group-hover:scale-125"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-myntra-text-dark">{d.subject}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-myntra-text-light">{d.A.toLocaleString()}</span>
                  <span className="font-semibold text-myntra-text-dark">{pct.toFixed(1)}%</span>
                </div>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-myntra-gray">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                    boxShadow: `0 0 8px ${color}66`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
