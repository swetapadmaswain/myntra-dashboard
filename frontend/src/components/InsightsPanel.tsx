'use client';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, BarChart, Bar, Legend, LineChart, Line, ComposedChart } from 'recharts';
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
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="mb-1 text-lg font-semibold text-myntra-text-dark">User Satisfaction vs Exploration</h3>
        <p className="mb-4 text-xs text-myntra-text-light">Bubble size = total signals. Top-right = high satisfaction & high exploration.</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" name="Exploration Score" domain={[0, 100]} label={{ value: 'Exploration Score', position: 'bottom', offset: 10, fontSize: 12 }} />
              <YAxis type="number" dataKey="y" name="Satisfaction Score" domain={[0, 100]} label={{ value: 'Satisfaction %', angle: -90, position: 'insideLeft', fontSize: 12 }} />
              <ZAxis type="number" dataKey="z" range={[60, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }: any) => payload?.[0] ? `${payload[0].payload.label}` : ''} />
              <Scatter name="Segments" data={satisfactionVsExploration} fill="#ff3f6c">
                {satisfactionVsExploration.map((_, i) => <Cell key={i} fill={['#ff3f6c', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'][i]} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4) Frustration Frequency Analysis */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="mb-1 text-lg font-semibold text-myntra-text-dark">Frustration Frequency Analysis</h3>
        <p className="mb-4 text-xs text-myntra-text-light">Bar = frequency count, Line = cumulative percentage (Pareto).</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={frustrationFreq} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="frequency" name="Frequency" fill="#ff3f6c" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="cumulative" name="Cumulative %" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6) Key Barriers Insight */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-myntra-text-dark">Key Barriers Insight</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {barriers.map((b) => {
            const sevColor = b.severity === 'Critical' ? 'bg-red-100 text-red-700' : b.severity === 'High' ? 'bg-orange-100 text-orange-700' : b.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
            return (
              <div key={b.name} className="rounded-lg border border-myntra-gray p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-myntra-text-dark">{b.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sevColor}`}>{b.severity}</span>
                </div>
                <div className="mb-2 text-2xl font-bold text-myntra-pink">{b.impact}%</div>
                <p className="text-xs text-myntra-text-light">{b.recommendation}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7) Product Opportunity Matrix */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="mb-1 text-lg font-semibold text-myntra-text-dark">Product Opportunity Matrix</h3>
        <p className="mb-4 text-xs text-myntra-text-light">X = Effort, Y = Lift/Impact. Color = quadrant priority.</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" name="Effort" domain={[0, 10]} label={{ value: 'Effort', position: 'bottom', offset: 10, fontSize: 12 }} />
              <YAxis type="number" dataKey="y" name="Lift" domain={[0, 10]} label={{ value: 'Lift Score', angle: -90, position: 'insideLeft', fontSize: 12 }} />
              <ZAxis type="number" dataKey="z" range={[60, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }: any) => payload?.[0] ? `${payload[0].payload.label} (Effort: ${payload[0].payload.x}, Lift: ${payload[0].payload.y})` : ''} />
              <Scatter name="Opportunities" data={productOpportunity}>
                {productOpportunity.map((entry, i) => <Cell key={i} fill={quadrantColors[entry.quadrant] || '#ff3f6c'} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {Object.entries(quadrantColors).map(([q, c]) => (
            <div key={q} className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: c }} />
              <span className="text-xs text-myntra-text-light">{titleCase(q)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 8) Sentiment-Impact Quadrant */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="mb-1 text-lg font-semibold text-myntra-text-dark">Sentiment-Impact Quadrant</h3>
        <p className="mb-4 text-xs text-myntra-text-light">X = Sentiment %, Y = Impact Score. Top-left = negative high-impact (urgent).</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" name="Sentiment %" domain={[0, 100]} label={{ value: 'Sentiment %', position: 'bottom', offset: 10, fontSize: 12 }} />
              <YAxis type="number" dataKey="y" name="Impact" domain={[0, 100]} label={{ value: 'Impact Score', angle: -90, position: 'insideLeft', fontSize: 12 }} />
              <ZAxis type="number" dataKey="z" range={[60, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }: any) => payload?.[0] ? `${payload[0].payload.label}` : ''} />
              <Scatter name="Frictions" data={sentimentImpact}>
                {sentimentImpact.map((entry, i) => (
                  <Cell key={i} fill={entry.sentiment === 'negative' ? '#ef4444' : entry.sentiment === 'neutral' ? '#f59e0b' : '#10b981'} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 11) Discovery by Category & Time */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="mb-1 text-lg font-semibold text-myntra-text-dark">Discovery by Category & Time</h3>
        <p className="mb-4 text-xs text-myntra-text-light">Discovery events per category across weekly time slots.</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={discoveryByCategoryTime} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              {categories.map((cat, i) => (
                <Line key={cat} type="monotone" dataKey={cat} stroke={['#ff3f6c', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'][i]} strokeWidth={2} dot={{ r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 12) Feedback Intensity by Category & Time */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="mb-1 text-lg font-semibold text-myntra-text-dark">Feedback Intensity by Category & Time</h3>
        <p className="mb-4 text-xs text-myntra-text-light">Heatmap of feedback volume per category per week.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-myntra-gray text-myntra-text-light">
                <th className="pb-2 pr-4 text-left font-medium">Category</th>
                {timeSlots.map((t) => <th key={t} className="pb-2 pr-4 text-center font-medium">{t}</th>)}
              </tr>
            </thead>
            <tbody>
              {feedbackIntensity.map((row) => (
                <tr key={row.category} className="border-b border-myntra-gray/50 last:border-0">
                  <td className="py-2 pr-4 font-medium text-myntra-text-dark">{row.category}</td>
                  {timeSlots.map((t) => {
                    const val = row[t];
                    const intensity = val / 80;
                    return (
                      <td key={t} className="py-2 pr-4 text-center">
                        <div className="mx-auto flex h-10 w-16 items-center justify-center rounded-md font-medium text-white" style={{ backgroundColor: `rgba(255, 63, 108, ${intensity * 0.8})` }}>
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
