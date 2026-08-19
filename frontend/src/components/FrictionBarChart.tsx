'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface FrictionBarChartProps {
  data: { name: string; count: number }[];
}

export function FrictionBarChart({ data }: FrictionBarChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 32 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#ff3f6c" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
