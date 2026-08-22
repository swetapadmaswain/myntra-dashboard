'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface FrictionBarChartProps {
  data: { name: string; count: number; percentage?: number; color?: string }[];
}

const defaultColors: Record<string, string> = {
  'Fit / Sizing': '#ff3f6c',
  'Styling / Wardrobe': '#ff905a',
  'Social Validation': '#282c3f',
  'Visual / Reality': '#535766',
  'Price / Value': '#3b82f6',
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
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-myntra-gray p-3">
          <div className="text-xs text-myntra-text-light">Total friction signals</div>
          <div className="text-xl font-semibold text-myntra-text-dark">{total}</div>
        </div>
        <div className="rounded-lg bg-myntra-gray p-3">
          <div className="text-xs text-myntra-text-light">Dominant friction</div>
          <div className="text-lg font-semibold text-myntra-text-dark">{top.name}</div>
        </div>
        <div className="rounded-lg bg-myntra-gray p-3">
          <div className="text-xs text-myntra-text-light">Dominant share</div>
          <div className="text-xl font-semibold text-myntra-text-dark">{top.percentage?.toFixed(1) ?? ((top.count / total) * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} margin={{ top: 8, right: 16, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} tick={{ fontSize: 12, fill: '#374151' }} />
            <YAxis tick={{ fontSize: 12, fill: '#374151' }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                const pct = d.percentage ?? (total > 0 ? (d.count / total) * 100 : 0);
                return (
                  <div className="rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-lg">
                    <div className="font-semibold text-myntra-text-dark">{d.name}</div>
                    <div className="text-myntra-text-light">Count: <span className="font-medium text-myntra-text-dark">{d.count}</span></div>
                    <div className="text-myntra-text-light">Share: <span className="font-medium text-myntra-text-dark">{pct.toFixed(1)}%</span></div>
                  </div>
                );
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {sorted.map((d, i) => (
                <Cell key={i} fill={d.color || defaultColors[d.name] || '#ff3f6c'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-myntra-gray text-myntra-text-light">
            <tr>
              <th className="pb-2 pr-4 font-medium">Friction</th>
              <th className="pb-2 pr-4 font-medium">Count</th>
              <th className="pb-2 pr-4 font-medium">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-myntra-gray">
            {sorted.map((d, i) => {
              const pct = d.percentage ?? (total > 0 ? (d.count / total) * 100 : 0);
              return (
                <tr key={i}>
                  <td className="py-2 pr-4 font-medium text-myntra-text-dark">{d.name}</td>
                  <td className="py-2 pr-4 text-myntra-text-light">{d.count}</td>
                  <td className="py-2 pr-4 text-myntra-text-light">{pct.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
