'use client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface IntentRadarChartProps {
  data: { subject: string; A: number; fullMark: number }[];
}

export function IntentRadarChart({ data }: IntentRadarChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
          <PolarRadiusAxis />
          <Tooltip />
          <Radar name="Intent" dataKey="A" stroke="#ff3f6c" fill="#ff3f6c" fillOpacity={0.4} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
