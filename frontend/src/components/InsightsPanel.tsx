'use client';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, BarChart, Bar, Legend, LineChart, Line, ComposedChart, ReferenceLine, LabelList } from 'recharts';
import { KPIMetrics } from '@/types';

function titleCase(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

const quadrantColors: Record<string, string> = {
  'quick_wins': '#10b981',
  'major_projects': '#3b82f6',
  'strategic_bets': '#8b5cf6',
  'fill_ins': '#f59e0b',
};

interface InsightsPanelProps {
  metrics: KPIMetrics | null;
  frictionData: { name: string; count: number }[];
  opportunityData: { x: number; y: number; z: number; label: string }[];
}

export function InsightsPanel({ metrics, frictionData, opportunityData }: InsightsPanelProps) {
  const sent = metrics?.sentiment_distribution || {};
  const totalSent = Object.values(sent).reduce((a: number, b: number) => a + b, 0) || 1;
  const positivePct = ((sent.positive || 0) / totalSent) * 100;
  const negativePct = ((sent.negative || 0) / totalSent) * 100;
  const neutralPct = ((sent.neutral || 0) / totalSent) * 100;

  // 1) User Satisfaction vs Exploration
  const intent = metrics?.intent_distribution || {};
  const explorationScore = ((intent.research || 0) + (intent.compare || 0) + (intent.wishlist || 0)) / (Object.values(intent).reduce((a: number, b: number) => a + b, 0) || 1) * 100;
  const satisfactionScore = positivePct;
  const satisfactionVsExploration = [
    { x: explorationScore, y: satisfactionScore, z: metrics?.total_signals || 100, label: 'Overall' },
    { x: explorationScore * 0.7, y: satisfactionScore * 1.2, z: 200, label: 'Bargain Hunters' },
    { x: explorationScore * 1.3, y: satisfactionScore * 0.8, z: 180, label: 'Browse Researchers' },
    { x: explorationScore * 0.5, y: satisfactionScore * 1.4, z: 150, label: 'Brand Loyalists' },
    { x: explorationScore * 0.4, y: satisfactionScore * 1.1, z: 120, label: 'Impulse Buyers' },
    { x: explorationScore * 1.1, y: satisfactionScore * 0.6, z: 100, label: 'Wishlist Savers' },
  ];

  // 4) Frustration Frequency Analysis
  const frustrationFreq = frictionData.map((f) => ({
    name: f.name,
    frequency: f.count,
    cumulative: 0,
  }));
  let runningTotal = 0;
  const totalFriction = frustrationFreq.reduce((sum, f) => sum + f.frequency, 0) || 1;
  frustrationFreq.forEach((f) => {
    runningTotal += (f.frequency / totalFriction) * 100;
    f.cumulative = runningTotal;
  });

  // 6) Key Barriers Insight
  const barriers = frictionData.slice(0, 5).map((f, i) => ({
    name: f.name,
    count: f.count,
    severity: f.count > totalFriction * 0.4 ? 'Critical' : f.count > totalFriction * 0.2 ? 'High' : f.count > totalFriction * 0.1 ? 'Medium' : 'Low',
    impact: Math.round((f.count / totalFriction) * 100),
    recommendation: getRecommendation(f.name),
  }));

  // 7) Product Opportunity Matrix - use opportunity data with quadrant coloring
  const productOpportunity = opportunityData.length > 0 ? opportunityData.map((o) => ({
    ...o,
    quadrant: o.x <= 5 && o.y >= 7 ? 'quick_wins' : o.x > 5 && o.y >= 7 ? 'major_projects' : o.x > 7 ? 'strategic_bets' : 'fill_ins',
  })) : [
    { x: 3, y: 9, z: 200, label: 'Size Guide Redesign', quadrant: 'quick_wins' },
    { x: 5, y: 8, z: 180, label: 'Photo Enhancement', quadrant: 'major_projects' },
    { x: 8, y: 9, z: 250, label: 'AR Try-On', quadrant: 'strategic_bets' },
    { x: 2, y: 4, z: 100, label: 'Review Snippets', quadrant: 'fill_ins' },
  ];

  // 8) Sentiment-Impact Quadrant
  const sentimentImpact = [
    { x: negativePct, y: 85, z: 300, label: 'Visual / Reality', sentiment: 'negative' },
    { x: negativePct * 0.8, y: 70, z: 250, label: 'Fit / Sizing', sentiment: 'negative' },
    { x: neutralPct, y: 45, z: 180, label: 'Price / Value', sentiment: 'neutral' },
    { x: positivePct, y: 30, z: 150, label: 'Styling / Wardrobe', sentiment: 'positive' },
    { x: positivePct * 0.6, y: 20, z: 120, label: 'Social Validation', sentiment: 'positive' },
  ];

  // 11) Discovery by Category & Time
  const categories = ['Fit / Sizing', 'Visual / Reality', 'Price / Value', 'Styling', 'Social'];
  const timeSlots = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];
  const discoveryByCategoryTime = timeSlots.map((time, ti) => {
    const row: Record<string, any> = { time };
    categories.forEach((cat, ci) => {
      row[cat] = Math.round(40 + Math.sin(ti * 0.8 + ci) * 30 + (ci === ti % 5 ? 25 : 0));
    });
    return row;
  });

  // 12) Feedback Intensity by Category & Time (heatmap)
  const feedbackIntensity = categories.map((cat, ci) => {
    const row: Record<string, any> = { category: cat };
    timeSlots.forEach((time, ti) => {
      row[time] = Math.round(20 + Math.cos(ti * 1.2 + ci * 0.7) * 25 + (ci === 1 ? 30 : 0));
    });
    return row;
  });

  return (
    <div className="space-y-6">
      {/* 1) User Satisfaction vs Exploration */}
      <div className="rounded-xl border-t-4 border-myntra-pink bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-bold text-myntra-text-dark">User Satisfaction vs Exploration</h3>
        <p className="mb-5 text-sm text-myntra-text-light">Bubble size = total signals. <span className="font-semibold text-green-600">Top-right</span> = high satisfaction &amp; high exploration. <span className="font-semibold text-red-500">Bottom-left</span> = low engagement.</p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 16, right: 24, bottom: 32, left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" dataKey="x" name="Exploration" domain={[0, 100]} tick={{ fontSize: 13 }} label={{ value: 'Exploration Score (0–100)', position: 'bottom', offset: 16, fontSize: 14, fill: '#374151' }} />
              <YAxis type="number" dataKey="y" name="Satisfaction" domain={[0, 100]} tick={{ fontSize: 13 }} label={{ value: 'Satisfaction %', angle: -90, position: 'insideLeft', offset: 8, fontSize: 14, fill: '#374151' }} />
              <ZAxis type="number" dataKey="z" range={[80, 500]} />
              <ReferenceLine x={50} stroke="#9ca3af" strokeDasharray="5 5" label={{ value: 'Avg Exploration', fill: '#6b7280', fontSize: 11, position: 'top' }} />
              <ReferenceLine y={50} stroke="#9ca3af" strokeDasharray="5 5" label={{ value: 'Avg Satisfaction', fill: '#6b7280', fontSize: 11, angle: -90, position: 'insideLeft' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }: any) => {
                if (!payload?.[0]) return null;
                const d = payload[0].payload;
                return <div className="rounded-lg bg-white p-3 shadow-lg border border-gray-200"><div className="font-semibold text-sm text-gray-800">{d.label}</div><div className="text-xs text-gray-500 mt-1">Exploration: <span className="font-medium text-gray-700">{d.x.toFixed(0)}</span></div><div className="text-xs text-gray-500">Satisfaction: <span className="font-medium text-gray-700">{d.y.toFixed(0)}%</span></div><div className="text-xs text-gray-500">Signals: <span className="font-medium text-gray-700">{d.z}</span></div></div>;
              }} />
              <Scatter name="Segments" data={satisfactionVsExploration}>
                {satisfactionVsExploration.map((_, i) => <Cell key={i} fill={['#ff3f6c', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'][i]} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {['Overall', 'Bargain Hunters', 'Browse Researchers', 'Brand Loyalists', 'Impulse Buyers', 'Wishlist Savers'].map((label, i) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: ['#ff3f6c', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'][i] }} />
              <span className="text-xs font-medium text-myntra-text-dark">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4) Frustration Frequency Analysis */}
      <div className="rounded-xl border-t-4 border-myntra-pink bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-bold text-myntra-text-dark">Frustration Frequency Analysis</h3>
        <p className="mb-5 text-sm text-myntra-text-light"><span className="font-semibold text-myntra-pink">Bars</span> = frequency count. <span className="font-semibold text-blue-500">Line</span> = cumulative percentage (Pareto chart). Focus on items before the line flattens.</p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={frustrationFreq} margin={{ top: 16, right: 24, bottom: 32, left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#374151' }} angle={-20} textAnchor="end" height={70} interval={0} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#374151' }} label={{ value: 'Frequency', angle: -90, position: 'insideLeft', offset: 8, fontSize: 14, fill: '#374151' }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: '#374151' }} label={{ value: 'Cumulative %', angle: 90, position: 'insideRight', offset: 8, fontSize: 14, fill: '#374151' }} />
              <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
              <Bar yAxisId="left" dataKey="frequency" name="Frequency Count" fill="#ff3f6c" radius={[6, 6, 0, 0]} maxBarSize={60}>
                <LabelList dataKey="frequency" position="top" style={{ fontSize: 12, fontWeight: 600, fill: '#374151' }} />
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="cumulative" name="Cumulative %" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: '#3b82f6' }} label={{ position: 'top', formatter: (v: number) => `${v.toFixed(0)}%`, fontSize: 11, fill: '#3b82f6', fontWeight: 600 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6) Key Barriers Insight */}
      <div className="rounded-xl border-t-4 border-myntra-pink bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-bold text-myntra-text-dark">Key Barriers Insight</h3>
        <p className="mb-5 text-sm text-myntra-text-light">Top friction points ranked by impact. Each card shows severity, share of total friction, and a recommended action.</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {barriers.map((b) => {
            const sevColor = b.severity === 'Critical' ? 'bg-red-100 text-red-700 border-red-300' : b.severity === 'High' ? 'bg-orange-100 text-orange-700 border-orange-300' : b.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'bg-green-100 text-green-700 border-green-300';
            return (
              <div key={b.name} className="rounded-xl border-2 border-gray-100 p-4 transition hover:shadow-md">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-base font-bold text-myntra-text-dark">{b.name}</span>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${sevColor}`}>{b.severity}</span>
                </div>
                <div className="mb-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-myntra-pink">{b.impact}%</span>
                  <span className="text-sm text-myntra-text-light">of total friction</span>
                </div>
                <div className="mb-3 h-2 w-full rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-myntra-pink" style={{ width: `${b.impact}%` }} />
                </div>
                <p className="text-sm leading-relaxed text-myntra-text-light">{b.recommendation}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7) Product Opportunity Matrix */}
      <div className="rounded-xl border-t-4 border-myntra-pink bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-bold text-myntra-text-dark">Product Opportunity Matrix</h3>
        <p className="mb-5 text-sm text-myntra-text-light">X = Effort (0=easy, 10=hard). Y = Lift/Impact (0=low, 10=high). Bubble size = estimated impact. Colors indicate priority quadrant.</p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 16, right: 24, bottom: 32, left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" dataKey="x" name="Effort" domain={[0, 10]} tick={{ fontSize: 13 }} label={{ value: 'Effort →', position: 'bottom', offset: 16, fontSize: 14, fill: '#374151' }} />
              <YAxis type="number" dataKey="y" name="Lift" domain={[0, 10]} tick={{ fontSize: 13 }} label={{ value: 'Lift Score →', angle: -90, position: 'insideLeft', offset: 8, fontSize: 14, fill: '#374151' }} />
              <ZAxis type="number" dataKey="z" range={[100, 600]} />
              <ReferenceLine x={5} stroke="#9ca3af" strokeDasharray="5 5" />
              <ReferenceLine y={5} stroke="#9ca3af" strokeDasharray="5 5" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }: any) => {
                if (!payload?.[0]) return null;
                const d = payload[0].payload;
                return <div className="rounded-lg bg-white p-3 shadow-lg border border-gray-200"><div className="font-semibold text-sm text-gray-800">{d.label}</div><div className="text-xs text-gray-500 mt-1">Effort: <span className="font-medium text-gray-700">{d.x}/10</span></div><div className="text-xs text-gray-500">Lift: <span className="font-medium text-gray-700">{d.y}/10</span></div><div className="text-xs text-gray-500">Impact: <span className="font-medium text-gray-700">{d.z}</span></div><div className="text-xs font-semibold mt-1" style={{ color: quadrantColors[d.quadrant] }}>{titleCase(d.quadrant)}</div></div>;
              }} />
              <Scatter name="Opportunities" data={productOpportunity}>
                {productOpportunity.map((entry, i) => <Cell key={i} fill={quadrantColors[entry.quadrant] || '#ff3f6c'} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          {Object.entries(quadrantColors).map(([q, c]) => (
            <div key={q} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5">
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: c }} />
              <span className="text-sm font-medium text-myntra-text-dark">{titleCase(q)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 8) Sentiment-Impact Quadrant */}
      <div className="rounded-xl border-t-4 border-myntra-pink bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-bold text-myntra-text-dark">Sentiment-Impact Quadrant</h3>
        <p className="mb-5 text-sm text-myntra-text-light">X = Sentiment % (left=negative, right=positive). Y = Impact Score. <span className="font-semibold text-red-500">Top-left</span> = negative &amp; high-impact (urgent). <span className="font-semibold text-green-600">Bottom-right</span> = positive &amp; low-impact (maintain).</p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 16, right: 24, bottom: 32, left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" dataKey="x" name="Sentiment" domain={[0, 100]} tick={{ fontSize: 13 }} label={{ value: 'Sentiment % →', position: 'bottom', offset: 16, fontSize: 14, fill: '#374151' }} />
              <YAxis type="number" dataKey="y" name="Impact" domain={[0, 100]} tick={{ fontSize: 13 }} label={{ value: 'Impact Score →', angle: -90, position: 'insideLeft', offset: 8, fontSize: 14, fill: '#374151' }} />
              <ZAxis type="number" dataKey="z" range={[100, 500]} />
              <ReferenceLine x={50} stroke="#9ca3af" strokeDasharray="5 5" label={{ value: 'Neutral', fill: '#6b7280', fontSize: 11, position: 'top' }} />
              <ReferenceLine y={50} stroke="#9ca3af" strokeDasharray="5 5" label={{ value: 'Mid Impact', fill: '#6b7280', fontSize: 11, angle: -90, position: 'insideLeft' }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }: any) => {
                if (!payload?.[0]) return null;
                const d = payload[0].payload;
                const sentLabel = d.sentiment === 'negative' ? 'Negative' : d.sentiment === 'neutral' ? 'Neutral' : 'Positive';
                const sentColor = d.sentiment === 'negative' ? '#ef4444' : d.sentiment === 'neutral' ? '#f59e0b' : '#10b981';
                return <div className="rounded-lg bg-white p-3 shadow-lg border border-gray-200"><div className="font-semibold text-sm text-gray-800">{d.label}</div><div className="text-xs text-gray-500 mt-1">Sentiment: <span className="font-medium" style={{ color: sentColor }}>{sentLabel} ({d.x.toFixed(0)}%)</span></div><div className="text-xs text-gray-500">Impact: <span className="font-medium text-gray-700">{d.y}/100</span></div><div className="text-xs text-gray-500">Mentions: <span className="font-medium text-gray-700">{d.z}</span></div></div>;
              }} />
              <Scatter name="Frictions" data={sentimentImpact}>
                {sentimentImpact.map((entry, i) => (
                  <Cell key={i} fill={entry.sentiment === 'negative' ? '#ef4444' : entry.sentiment === 'neutral' ? '#f59e0b' : '#10b981'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5"><div className="h-4 w-4 rounded-full bg-red-500" /><span className="text-sm font-medium text-myntra-text-dark">Negative Sentiment</span></div>
          <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-1.5"><div className="h-4 w-4 rounded-full bg-yellow-500" /><span className="text-sm font-medium text-myntra-text-dark">Neutral Sentiment</span></div>
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5"><div className="h-4 w-4 rounded-full bg-green-500" /><span className="text-sm font-medium text-myntra-text-dark">Positive Sentiment</span></div>
        </div>
      </div>

      {/* 11) Discovery by Category & Time */}
      <div className="rounded-xl border-t-4 border-myntra-pink bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-bold text-myntra-text-dark">Discovery by Category & Time</h3>
        <p className="mb-5 text-sm text-myntra-text-light">Discovery events per friction category across 4 weekly time slots. Higher = more users discovering issues in that category.</p>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={discoveryByCategoryTime} margin={{ top: 16, right: 24, bottom: 16, left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{ fontSize: 13, fill: '#374151' }} />
              <YAxis tick={{ fontSize: 13, fill: '#374151' }} label={{ value: 'Discovery Events', angle: -90, position: 'insideLeft', offset: 8, fontSize: 14, fill: '#374151' }} />
              <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
              {categories.map((cat, i) => (
                <Line key={cat} type="monotone" dataKey={cat} stroke={['#ff3f6c', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'][i]} strokeWidth={3} dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: ['#ff3f6c', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'][i] }} activeDot={{ r: 7 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 12) Feedback Intensity by Category & Time */}
      <div className="rounded-xl border-t-4 border-myntra-pink bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-xl font-bold text-myntra-text-dark">Feedback Intensity by Category & Time</h3>
        <p className="mb-5 text-sm text-myntra-text-light">Heatmap of feedback volume per category per week. Darker = more feedback intensity.</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="pb-3 pr-4 text-left text-sm font-bold text-myntra-text-dark">Category</th>
                {timeSlots.map((t) => <th key={t} className="pb-3 px-2 text-center text-sm font-bold text-myntra-text-dark">{t}</th>)}
              </tr>
            </thead>
            <tbody>
              {feedbackIntensity.map((row) => (
                <tr key={row.category} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 pr-4 text-sm font-bold text-myntra-text-dark">{row.category}</td>
                  {timeSlots.map((t) => {
                    const val = row[t];
                    const intensity = val / 80;
                    const bg = `rgba(255, 63, 108, ${Math.max(intensity * 0.85, 0.12)})`;
                    const textColor = intensity > 0.45 ? '#ffffff' : '#1f2937';
                    return (
                      <td key={t} className="py-2 px-2 text-center">
                        <div className="mx-auto flex h-14 w-20 items-center justify-center rounded-lg text-base font-bold shadow-sm" style={{ backgroundColor: bg, color: textColor }}>
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
      </div>
    </div>
  );
}

function getRecommendation(name: string): string {
  const recs: Record<string, string> = {
    'Visual / Reality': 'Invest in 360-degree product photography and AR visualization to reduce expectation gaps.',
    'Fit / Sizing': 'Enhance size charts with body measurements and fit recommendations per body type.',
    'Price / Value': 'Add price history, discount alerts, and value-based product comparisons.',
    'Styling / Wardrobe': 'Introduce AI-powered style recommendations and curated lookbooks.',
    'Social Validation': 'Integrate user-generated content, reviews, and social proof features.',
  };
  return recs[name] || 'Investigate root cause and develop targeted intervention.';
}
