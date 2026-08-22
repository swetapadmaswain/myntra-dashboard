'use client';
import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface JourneyItem {
  name: string;
  users: number;
  percentage?: number;
  drop_off_rate?: number;
  cumulative_drop_off?: number;
}

interface JourneyFlowChartProps {
  data: JourneyItem[];
}

export function JourneyFlowChart({ data }: JourneyFlowChartProps) {
  if (!data || data.length === 0 || data.every((d) => !d.users)) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-myntra-text-light">
        No journey data available.
      </div>
    );
  }

  const total = data[0].users;
  const last = data[data.length - 1];
  const conversion = total > 0 ? (last.users / total) * 100 : 0;

  const enriched = useMemo(() => {
    return data.map((d, i) => {
      const prev = data[i - 1];
      const drop = d.drop_off_rate ?? (prev ? ((prev.users - d.users) / prev.users) * 100 : 0);
      const cumDrop = d.cumulative_drop_off ?? ((1 - d.users / total) * 100);
      const pct = d.percentage ?? (d.users / total) * 100;
      return { ...d, drop, cumDrop, pct };
    });
  }, [data, total]);

  return (
    <div>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-myntra-gray p-3">
          <div className="text-xs text-myntra-text-light">Total sessions</div>
          <div className="text-xl font-semibold text-myntra-text-dark">{total}</div>
        </div>
        <div className="rounded-lg bg-myntra-gray p-3">
          <div className="text-xs text-myntra-text-light">Completion rate</div>
          <div className="text-xl font-semibold text-myntra-text-dark">{conversion.toFixed(1)}%</div>
        </div>
        <div className="rounded-lg bg-myntra-gray p-3">
          <div className="text-xs text-myntra-text-light">Total drop-off</div>
          <div className="text-xl font-semibold text-myntra-text-dark">{total - last.users}</div>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff3f6c" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#ff3f6c" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#374151' }} />
            <YAxis tick={{ fontSize: 12, fill: '#374151' }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                const pct = total > 0 ? (d.users / total) * 100 : 0;
                return (
                  <div className="rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-lg">
                    <div className="font-semibold text-myntra-text-dark">{d.name}</div>
                    <div className="text-myntra-text-light">Users: <span className="font-medium text-myntra-text-dark">{d.users}</span></div>
                    <div className="text-myntra-text-light">Conversion: <span className="font-medium text-myntra-text-dark">{pct.toFixed(1)}%</span></div>
                  </div>
                );
              }}
            />
            <Area type="monotone" dataKey="users" stroke="#ff3f6c" fillOpacity={1} fill="url(#colorUsers)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-myntra-gray text-myntra-text-light">
            <tr>
              <th className="pb-2 pr-4 font-medium">Step</th>
              <th className="pb-2 pr-4 font-medium">Users</th>
              <th className="pb-2 pr-4 font-medium">Conversion</th>
              <th className="pb-2 pr-4 font-medium">Step drop-off</th>
              <th className="pb-2 pr-4 font-medium">Cumulative drop-off</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-myntra-gray">
            {enriched.map((d, i) => (
              <tr key={i}>
                <td className="py-2 pr-4 font-medium text-myntra-text-dark">{d.name}</td>
                <td className="py-2 pr-4 text-myntra-text-light">{d.users}</td>
                <td className="py-2 pr-4 text-myntra-text-light">{d.pct.toFixed(1)}%</td>
                <td className="py-2 pr-4 text-myntra-text-light">{d.drop.toFixed(1)}%</td>
                <td className="py-2 pr-4 text-myntra-text-light">{d.cumDrop.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
