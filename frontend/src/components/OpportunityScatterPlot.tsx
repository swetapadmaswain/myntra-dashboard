'use client';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from 'recharts';

interface Opportunity {
  x: number;
  y: number;
  z: number;
  label: string;
  description?: string;
  quadrant?: string;
  priority_score?: number;
  related_friction?: string;
  friction_percentage?: number;
}

interface OpportunityScatterPlotProps {
  data: Opportunity[];
}

const quadrantColors: Record<string, string> = {
  quick_wins: '#10b981',
  major_projects: '#3b82f6',
  strategic_bets: '#8b5cf6',
  fill_ins: '#9ca3af',
};

function titleCase(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function getQuadrant(x: number, y: number, q?: string) {
  if (q) return q;
  if (y < 7) return 'fill_ins';
  if (x <= 4) return 'quick_wins';
  if (x <= 7) return 'major_projects';
  return 'strategic_bets';
}

export function OpportunityScatterPlot({ data }: OpportunityScatterPlotProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 w-full items-center justify-center rounded-lg bg-myntra-gray p-4 text-sm text-myntra-text-light">
        No opportunity data available.
      </div>
    );
  }

  const chartData = data.map((d) => ({ ...d, quadrant: getQuadrant(d.x, d.y, d.quadrant) }));

  return (
    <div className="w-full">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 24, bottom: 24, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" dataKey="x" name="Effort" domain={[0, 10]} tick={{ fontSize: 12, fill: '#374151' }} label={{ value: 'Effort →', position: 'bottom', offset: 8, fontSize: 13, fill: '#6b7280' }} />
            <YAxis type="number" dataKey="y" name="Lift" domain={[0, 10]} tick={{ fontSize: 12, fill: '#374151' }} label={{ value: 'Lift →', angle: -90, position: 'insideLeft', offset: 8, fontSize: 13, fill: '#6b7280' }} />
            <ZAxis type="number" dataKey="z" range={[80, 400]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as Opportunity;
                const q = getQuadrant(d.x, d.y, d.quadrant);
                const color = quadrantColors[q] || '#ff3f6c';
                return (
                  <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                    <div className="mb-1 text-sm font-semibold text-gray-800" style={{ color }}>{d.label}</div>
                    <div className="mb-2 text-xs text-gray-600">{d.description || '—'}</div>
                    <div className="space-y-1 text-xs text-gray-500">
                      <div>Effort: <span className="font-medium text-gray-700">{d.x}/10</span></div>
                      <div>Lift: <span className="font-medium text-gray-700">{d.y}/10</span></div>
                      <div>Impact: <span className="font-medium text-gray-700">{d.z}</span></div>
                      <div>Priority: <span className="font-medium text-gray-700">{d.priority_score ?? '—'}</span></div>
                      <div>Quadrant: <span className="font-medium" style={{ color }}>{titleCase(q)}</span></div>
                      <div>Friction: <span className="font-medium text-gray-700">{d.related_friction ? titleCase(d.related_friction) : '—'}</span> {d.friction_percentage ? `(${d.friction_percentage}%)` : ''}</div>
                    </div>
                  </div>
                );
              }}
            />
            <ReferenceLine x={5} stroke="#9ca3af" strokeDasharray="5 5" />
            <ReferenceLine x={7} stroke="#9ca3af" strokeDasharray="5 5" />
            <ReferenceLine y={7} stroke="#9ca3af" strokeDasharray="5 5" />
            <Scatter name="Opportunities" data={chartData} fill="#ff3f6c">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={quadrantColors[entry.quadrant] || '#ff3f6c'} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-gray-200 text-gray-500">
            <tr>
              <th className="pb-2 pr-4 font-medium">Opportunity</th>
              <th className="pb-2 pr-4 font-medium">Effort</th>
              <th className="pb-2 pr-4 font-medium">Lift</th>
              <th className="pb-2 pr-4 font-medium">Impact</th>
              <th className="pb-2 pr-4 font-medium">Quadrant</th>
              <th className="pb-2 pr-4 font-medium">Friction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {chartData.map((d, i) => {
              const q = getQuadrant(d.x, d.y, d.quadrant);
              const color = quadrantColors[q] || '#ff3f6c';
              return (
                <tr key={i}>
                  <td className="py-2 pr-4">
                    <div className="font-medium text-gray-800">{d.label}</div>
                    <div className="text-[10px] text-gray-500">{d.description || '—'}</div>
                  </td>
                  <td className="py-2 pr-4 text-gray-700">{d.x}/10</td>
                  <td className="py-2 pr-4 text-gray-700">{d.y}/10</td>
                  <td className="py-2 pr-4 text-gray-700">{d.z}</td>
                  <td className="py-2 pr-4">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: color }}>{titleCase(q)}</span>
                  </td>
                  <td className="py-2 pr-4 text-gray-700">{d.related_friction ? titleCase(d.related_friction) : '—'} {d.friction_percentage ? `(${d.friction_percentage}%)` : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
