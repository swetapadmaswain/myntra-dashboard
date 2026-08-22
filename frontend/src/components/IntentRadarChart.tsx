'use client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface IntentRadarChartProps {
  data: { subject: string; A: number; fullMark: number; percentage?: number }[];
}

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

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-myntra-gray p-3">
          <div className="text-xs text-myntra-text-light">Total intent signals</div>
          <div className="text-xl font-semibold text-myntra-text-dark">{total}</div>
        </div>
        <div className="rounded-lg bg-myntra-gray p-3">
          <div className="text-xs text-myntra-text-light">Dominant intent</div>
          <div className="text-lg font-semibold text-myntra-text-dark">{top.subject}</div>
        </div>
        <div className="rounded-lg bg-myntra-gray p-3">
          <div className="text-xs text-myntra-text-light">Dominant share</div>
          <div className="text-xl font-semibold text-myntra-text-dark">{top.percentage?.toFixed(1) ?? ((top.A / total) * 100).toFixed(1)}%</div>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#374151' }} />
            <PolarRadiusAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                const pct = d.percentage ?? (total > 0 ? (d.A / total) * 100 : 0);
                return (
                  <div className="rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-lg">
                    <div className="font-semibold text-myntra-text-dark">{d.subject}</div>
                    <div className="text-myntra-text-light">Count: <span className="font-medium text-myntra-text-dark">{d.A}</span></div>
                    <div className="text-myntra-text-light">Share: <span className="font-medium text-myntra-text-dark">{pct.toFixed(1)}%</span></div>
                  </div>
                );
              }}
            />
            <Radar name="Intent" dataKey="A" stroke="#ff3f6c" fill="#ff3f6c" fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-myntra-gray text-myntra-text-light">
            <tr>
              <th className="pb-2 pr-4 font-medium">Intent</th>
              <th className="pb-2 pr-4 font-medium">Count</th>
              <th className="pb-2 pr-4 font-medium">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-myntra-gray">
            {sorted.map((d, i) => {
              const pct = d.percentage ?? (total > 0 ? (d.A / total) * 100 : 0);
              return (
                <tr key={i}>
                  <td className="py-2 pr-4 font-medium text-myntra-text-dark">{d.subject}</td>
                  <td className="py-2 pr-4 text-myntra-text-light">{d.A}</td>
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
