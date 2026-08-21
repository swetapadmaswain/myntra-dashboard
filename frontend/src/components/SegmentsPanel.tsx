'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';
import { KPIMetrics } from '@/types';

const COLORS = ['#ff3f6c', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

function titleCase(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

const segmentData = [
  { name: 'Bargain Hunters', value: 32, color: '#ff3f6c' },
  { name: 'Brand Loyalists', value: 25, color: '#10b981' },
  { name: 'Browse Researchers', value: 22, color: '#f59e0b' },
  { name: 'Impulse Buyers', value: 13, color: '#3b82f6' },
  { name: 'Wishlist Savers', value: 8, color: '#8b5cf6' },
];

const segmentCharacteristics = [
  { segment: 'Bargain Hunters', traits: 'Price-sensitive, discount-driven', avgSession: '8.2 min', conversionRate: '3.2%', topBarrier: 'Price / Value' },
  { segment: 'Brand Loyalists', traits: 'Repeat visitors, brand-focused', avgSession: '12.5 min', conversionRate: '7.8%', topBarrier: 'Visual / Reality' },
  { segment: 'Browse Researchers', traits: 'High page views, low cart adds', avgSession: '15.3 min', conversionRate: '1.5%', topBarrier: 'Fit / Sizing' },
  { segment: 'Impulse Buyers', traits: 'Quick sessions, high cart-to-buy', avgSession: '3.1 min', conversionRate: '12.4%', topBarrier: 'Social Validation' },
  { segment: 'Wishlist Savers', traits: 'Save for later, long return cycle', avgSession: '6.7 min', conversionRate: '2.1%', topBarrier: 'Price / Value' },
];

const behavioralPatterns = [
  { segment: 'Bargain Hunters', browsing: 65, comparing: 90, purchasing: 30, wishlisting: 45, reviewing: 20 },
  { segment: 'Brand Loyalists', browsing: 40, comparing: 30, purchasing: 75, wishlisting: 35, reviewing: 60 },
  { segment: 'Browse Researchers', browsing: 95, comparing: 85, purchasing: 15, wishlisting: 70, reviewing: 50 },
  { segment: 'Impulse Buyers', browsing: 30, comparing: 10, purchasing: 88, wishlisting: 25, reviewing: 15 },
  { segment: 'Wishlist Savers', browsing: 55, comparing: 60, purchasing: 20, wishlisting: 92, reviewing: 30 },
];

const segmentImpact = [
  { segment: 'Bargain Hunters', users: 3200, revenueImpact: 45, frictionScore: 78 },
  { segment: 'Brand Loyalists', users: 2500, revenueImpact: 82, frictionScore: 35 },
  { segment: 'Browse Researchers', users: 2200, revenueImpact: 18, frictionScore: 85 },
  { segment: 'Impulse Buyers', users: 1300, revenueImpact: 65, frictionScore: 42 },
  { segment: 'Wishlist Savers', users: 800, revenueImpact: 12, frictionScore: 68 },
];

const frustrationTypes = ['Fit / Sizing', 'Visual / Reality', 'Price / Value', 'Styling / Wardrobe', 'Social Validation'];
const crosstabSegments = ['Bargain Hunters', 'Brand Loyalists', 'Browse Researchers', 'Impulse Buyers', 'Wishlist Savers'];
const crosstabData: Record<string, number[]> = {
  'Bargain Hunters': [30, 25, 85, 20, 15],
  'Brand Loyalists': [45, 60, 20, 15, 30],
  'Browse Researchers': [70, 55, 40, 35, 25],
  'Impulse Buyers': [15, 20, 30, 10, 50],
  'Wishlist Savers': [35, 30, 65, 20, 10],
};

interface SegmentsPanelProps {
  metrics: KPIMetrics | null;
}

export function SegmentsPanel({ metrics }: SegmentsPanelProps) {
  const total = segmentData.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="space-y-6">
      {/* User Segment Distribution */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-myntra-text-dark">User Segment Distribution</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={segmentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(e: any) => `${e.name}: ${((e.value / total) * 100).toFixed(0)}%`}>
                  {segmentData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center space-y-2">
            {segmentData.map((s) => (
              <div key={s.name} className="flex items-center justify-between rounded-lg border border-myntra-gray px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-sm font-medium text-myntra-text-dark">{s.name}</span>
                </div>
                <span className="text-sm text-myntra-text-light">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Segment Characteristics */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-myntra-text-dark">Segment Characteristics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-myntra-gray text-left text-myntra-text-light">
                <th className="pb-2 pr-4 font-medium">Segment</th>
                <th className="pb-2 pr-4 font-medium">Traits</th>
                <th className="pb-2 pr-4 font-medium">Avg Session</th>
                <th className="pb-2 pr-4 font-medium">Conversion</th>
                <th className="pb-2 pr-4 font-medium">Top Barrier</th>
              </tr>
            </thead>
            <tbody>
              {segmentCharacteristics.map((row) => (
                <tr key={row.segment} className="border-b border-myntra-gray/50 last:border-0">
                  <td className="py-2 pr-4 font-medium text-myntra-text-dark">{row.segment}</td>
                  <td className="py-2 pr-4 text-myntra-text-light">{row.traits}</td>
                  <td className="py-2 pr-4 text-myntra-text-light">{row.avgSession}</td>
                  <td className="py-2 pr-4 text-myntra-text-light">{row.conversionRate}</td>
                  <td className="py-2 pr-4 text-myntra-text-light">{row.topBarrier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Behavioral Patterns by Segment */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-myntra-text-dark">Behavioral Patterns by Segment</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={behavioralPatterns}>
              <PolarGrid />
              <PolarAngleAxis dataKey="segment" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Browsing" dataKey="browsing" stroke="#ff3f6c" fill="#ff3f6c" fillOpacity={0.15} />
              <Radar name="Comparing" dataKey="comparing" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
              <Radar name="Purchasing" dataKey="purchasing" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
              <Radar name="Wishlisting" dataKey="wishlisting" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
              <Radar name="Reviewing" dataKey="reviewing" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Segment Impact */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-myntra-text-dark">User Segment Impact</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={segmentImpact} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="segment" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenueImpact" name="Revenue Impact %" fill="#ff3f6c" radius={[4, 4, 0, 0]} />
              <Bar dataKey="frictionScore" name="Friction Score" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segment × Frustration Crosstab */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-myntra-text-dark">Segment × Frustration Crosstab</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-myntra-gray text-left text-myntra-text-light">
                <th className="pb-2 pr-4 font-medium">Segment</th>
                {frustrationTypes.map((f) => (
                  <th key={f} className="pb-2 pr-4 text-center font-medium">{f}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {crosstabSegments.map((seg) => (
                <tr key={seg} className="border-b border-myntra-gray/50 last:border-0">
                  <td className="py-2 pr-4 font-medium text-myntra-text-dark">{seg}</td>
                  {crosstabData[seg].map((val, i) => {
                    const intensity = val / 100;
                    const bg = `rgba(255, 63, 108, ${intensity * 0.8})`;
                    return (
                      <td key={i} className="py-2 pr-4 text-center">
                        <div className="mx-auto flex h-10 w-16 items-center justify-center rounded-md font-medium text-white" style={{ backgroundColor: bg }}>
                          {val}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-myntra-text-light">Values represent frustration frequency score (0-100). Darker = higher frustration.</p>
      </div>
    </div>
  );
}
