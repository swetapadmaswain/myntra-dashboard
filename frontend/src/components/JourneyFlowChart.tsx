'use client';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface JourneyFlowChartProps {
  data: { name: string; users: number }[];
}

export function JourneyFlowChart({ data }: JourneyFlowChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff3f6c" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#ff3f6c" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="users" stroke="#ff3f6c" fillOpacity={1} fill="url(#colorUsers)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
