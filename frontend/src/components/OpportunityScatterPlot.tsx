'use client';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface OpportunityScatterPlotProps {
  data: { x: number; y: number; z: number; label: string }[];
}

const colors = ['#ff3f6c', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'];

export function OpportunityScatterPlot({ data }: OpportunityScatterPlotProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="x" name="Impact" />
          <YAxis type="number" dataKey="y" name="Effort" />
          <ZAxis type="number" dataKey="z" range={[80, 400]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Opportunities" data={data} fill="#ff3f6c">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
