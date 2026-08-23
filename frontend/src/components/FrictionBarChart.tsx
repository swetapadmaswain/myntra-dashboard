'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface FrictionBarChartProps {
  data: { name: string; count: number; percentage?: number; color?: string }[];
}

const defaultColors: Record<string, string> = {
  'Fit Sizing': '#ff3f6c',
  'Product Styling': '#7c3aed',
  'Social Validation': '#ff6f00',
  'Visual Reality': '#ff2d8f',
  'Price Value': '#0891b2',
};

export function FrictionBarChart({ data }: FrictionBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-myntra-text-light">
        No friction data available.
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.count - a.count);
  const total = sorted.reduce((sum, d) => sum + d.count, 0);
  const top = sorted[0];

  return (
    <div>
      {/* Gradient stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-gradient-to-br from-myntra-pink to-myntra-neon-pink p-4 text-white shadow-md">
          <div className="text-xs font-medium text-white/80">Total Friction Signals</div>
          <div className="mt-1 text-2xl font-bold">{total.toLocaleString()}</div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white/60" style={{ width: '100%' }} />
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-myntra-orange to-amber-500 p-4 text-white shadow-md">
          <div className="text-xs font-medium text-white/80">Dominant Friction</div>
          <div className="mt-1 text-xl font-bold">{top.name}</div>
          <div className="mt-2 inline-flex rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white">
            {sorted.length} friction types
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-myntra-purple to-indigo-700 p-4 text-white shadow-md">
          <div className="text-xs font-medium text-white/80">Dominant Share</div>
          <div className="mt-1 text-2xl font-bold">{top.percentage?.toFixed(1) ?? ((top.count / total) * 100).toFixed(1)}%</div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white/60"
              style={{ width: `${top.percentage ?? ((top.count / total) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-xl bg-gradient-to-b from-white to-myntra-gray p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-myntra-text-dark">Friction Distribution</h3>
          <div className="flex items-center gap-2 text-xs text-myntra-text-light">
            <span className="inline-block h-2 w-2 rounded-full bg-myntra-pink" />
            Signal Count
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sorted} margin={{ top: 8, right: 16, left: 0, bottom: 40 }}>
              <defs>
                {sorted.map((d, i) => {
                  const color = d.color || defaultColors[d.name] || '#ff3f6c';
                  return (
                    <linearGradient key={i} id={`barGradient${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.5} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} tick={{ fontSize: 12, fill: '#282c3f', fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 12, fill: '#282c3f', fontWeight: 600 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  const pct = d.percentage ?? (total > 0 ? (d.count / total) * 100 : 0);
                  const color = d.color || defaultColors[d.name] || '#ff3f6c';
                  return (
                    <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs shadow-xl">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-semibold text-myntra-text-dark">{d.name}</span>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-myntra-text-light">Count: <span className="font-semibold text-myntra-text-dark">{d.count.toLocaleString()}</span></div>
                        <div className="text-myntra-text-light">Share: <span className="font-semibold text-myntra-text-dark">{pct.toFixed(1)}%</span></div>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {sorted.map((d, i) => (
                  <Cell key={i} fill={`url(#barGradient${i})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Animated horizontal bars */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-myntra-text-dark">Friction Breakdown</h3>
        {sorted.map((d, i) => {
          const pct = d.percentage ?? (total > 0 ? (d.count / total) * 100 : 0);
          const color = d.color || defaultColors[d.name] || '#ff3f6c';
          return (
            <div key={i} className="group">
              <div className="mb-1 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full transition-transform group-hover:scale-125"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-myntra-text-dark">{d.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-myntra-text-light">{d.count.toLocaleString()}</span>
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
