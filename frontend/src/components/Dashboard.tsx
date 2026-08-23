'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { KPICards } from './KPICards';
import { TabNavigation } from './TabNavigation';
import { DiscoveryPanel } from './DiscoveryPanel';
import { ChatBot } from './ChatBot';
import { FrictionBarChart } from './FrictionBarChart';
import { IntentRadarChart } from './IntentRadarChart';
import { JourneyFlowChart } from './JourneyFlowChart';
import { OpportunityScatterPlot } from './OpportunityScatterPlot';
import { BehaviouralAnalysis } from './BehaviouralAnalysis';
import { SegmentsPanel } from './SegmentsPanel';
import { InsightsPanel } from './InsightsPanel';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { fetchMetrics, fetchFriction, fetchIntentMatrix, fetchJourney, fetchOpportunities, fetchBehaviouralAnalysis } from '@/services/api';
import { useDashboardStore } from '@/store/dashboardStore';
import { KPIMetrics } from '@/types';
import { journeyMock, opportunityMock } from '@/data/mockData';

function titleCase(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export function Dashboard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { tab, setTab, filters, setFilter, resetFilters } = useDashboardStore();

  const filterParams = {
    source: filters.source,
    sentiment: filters.sentiment,
    hesitation_driver: filters.hesitation_driver,
  };

  const { data: metrics, isLoading: metricsLoading, isError: metricsError } = useQuery({
    queryKey: ['metrics', filterParams],
    queryFn: () => fetchMetrics(filterParams),
  });

  const { data: frictionResponse } = useQuery({
    queryKey: ['friction', filterParams],
    queryFn: () => fetchFriction(filterParams),
    enabled: tab === 'friction',
  });

  const { data: intentResponse } = useQuery({
    queryKey: ['intent', filterParams],
    queryFn: () => fetchIntentMatrix(filterParams),
    enabled: tab === 'intent',
  });

  const { data: journeyResponse } = useQuery({
    queryKey: ['journey', filterParams],
    queryFn: () => fetchJourney(filterParams),
    enabled: tab === 'journey',
  });

  const { data: opportunityResponse } = useQuery({
    queryKey: ['opportunity', filterParams],
    queryFn: () => fetchOpportunities(filterParams),
    enabled: tab === 'opportunity',
  });

  const { data: behaviouralResponse } = useQuery({
    queryKey: ['behavioural', filterParams],
    queryFn: () => fetchBehaviouralAnalysis(filterParams),
    enabled: tab === 'behavioural',
  });

  const typedMetrics = (metrics as KPIMetrics) || {};

  // Build friction chart data from filtered friction API response, fall back to metrics
  const frictionApiData = (frictionResponse as any)?.friction_types;
  const frictionData = frictionApiData
    ? frictionApiData.map((item: any) => ({
        name: titleCase(item.name),
        count: item.count,
        percentage: item.percentage,
        color: item.color,
      }))
    : Object.entries(typedMetrics.hesitation_distribution || {}).map(([name, count]) => ({
        name: titleCase(name),
        count,
        percentage: (count / Math.max(Object.values(typedMetrics.hesitation_distribution || {}).reduce((a: number, b: number) => (a as number) + (b as number), 0) as number, 1)) * 100,
      }));

  // Build intent chart data from filtered intent API response, fall back to metrics
  const intentApiData = (intentResponse as any)?.intent_distribution;
  const intentDist = intentApiData
    ? Object.fromEntries(intentApiData.map((item: any) => [item.intent_type, item.count]))
    : (typedMetrics.intent_distribution || {});
  const intentPercentageDist = intentApiData
    ? Object.fromEntries(intentApiData.map((item: any) => [item.intent_type, item.percentage]))
    : {};
  const totalIntent = Object.values(intentDist).reduce((s: number, v) => s + (v as number), 0) || 1;
  const maxIntent = Math.max(...Object.values(intentDist), 1);
  const intentData = Object.entries(intentDist).map(([subject, a]) => ({
    subject: titleCase(subject),
    A: a,
    fullMark: maxIntent,
    percentage: intentPercentageDist[subject] ?? ((a as number) / totalIntent) * 100,
  }));

  // Journey data from filtered API, transform funnel_data to chart format, fall back to mock
  const journeyApiData = (journeyResponse as any)?.funnel_data;
  const journeyData = journeyApiData
    ? journeyApiData.map((item: any) => ({
        name: titleCase(item.step_name),
        users: item.count,
        percentage: item.percentage,
        drop_off_rate: item.drop_off_rate,
        cumulative_drop_off: item.cumulative_drop_off,
      }))
    : journeyMock;

  // Opportunity data from filtered API, transform to chart format, fall back to mock
  const opportunityApiData = (opportunityResponse as any)?.opportunities;
  const opportunityData = opportunityApiData?.length
    ? opportunityApiData.map((item: any) => ({
        x: item.effort_score,
        y: item.lift_score,
        z: item.estimated_impact || item.priority_score * 100,
        label: item.opportunity_name,
        description: item.description,
        quadrant: item.quadrant,
        priority_score: item.priority_score,
        related_friction: item.related_friction,
        friction_percentage: item.friction_percentage,
      }))
    : opportunityMock;

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="mb-3 h-12 w-12 mx-auto rounded-full bg-gradient-to-br from-myntra-pink to-myntra-orange animate-glow" />
          <p className="text-lg font-semibold bg-gradient-to-r from-myntra-pink to-myntra-orange bg-clip-text text-transparent">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Gradient header banner */}
      <header className="mb-6 rounded-2xl bg-gradient-to-r from-myntra-pink via-myntra-neon-pink to-myntra-orange p-6 shadow-lg animate-fade-in">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white md:text-3xl">Wishlist AI Dashboard</h1>
            <p className="text-sm text-white/90 mt-1">Discover why people hesitate to buy from their wishlist</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 backdrop-blur-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium text-white">Live Data</span>
          </div>
        </div>
      </header>

      {metricsLoading ? (
        <div className="mb-6 rounded-xl bg-white p-8 text-center shadow-md animate-shimmer">
          <p className="text-sm font-medium text-myntra-pink">Loading KPIs...</p>
        </div>
      ) : (
        <div className="mb-6 animate-fade-in">
          <KPICards metrics={metrics || {}} />
        </div>
      )}

      {metricsError && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 shadow-sm border-l-4 border-red-500">
          Failed to load KPIs. Check the API Gateway and browser console.
        </div>
      )}

      {/* Filter bar with vibrant styling */}
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        <select
          className="rounded-xl border-2 border-myntra-pink/20 bg-white px-3 py-2.5 text-sm font-medium text-myntra-text-dark shadow-sm transition hover:border-myntra-pink/50 focus:border-myntra-pink focus:outline-none focus:ring-2 focus:ring-myntra-pink/20"
          value={filters.source || ''}
          onChange={(e) => setFilter('source', e.target.value || null)}
        >
          <option value="">All Sources</option>
          <option value="appstore">App/Play Store</option>
          <option value="youtube">YouTube</option>
          <option value="reddit">Reddit</option>
        </select>

        <select
          className="rounded-xl border-2 border-myntra-orange/20 bg-white px-3 py-2.5 text-sm font-medium text-myntra-text-dark shadow-sm transition hover:border-myntra-orange/50 focus:border-myntra-orange focus:outline-none focus:ring-2 focus:ring-myntra-orange/20"
          value={filters.sentiment || ''}
          onChange={(e) => setFilter('sentiment', e.target.value || null)}
        >
          <option value="">All Sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>

        <select
          className="rounded-xl border-2 border-myntra-purple/20 bg-white px-3 py-2.5 text-sm font-medium text-myntra-text-dark shadow-sm transition hover:border-myntra-purple/50 focus:border-myntra-purple focus:outline-none focus:ring-2 focus:ring-myntra-purple/20"
          value={filters.hesitation_driver || ''}
          onChange={(e) => setFilter('hesitation_driver', e.target.value || null)}
        >
          <option value="">All Drivers</option>
          <option value="fit_sizing">Fit / Sizing</option>
          <option value="visual_reality">Visual / Reality</option>
          <option value="price_value">Price / Value</option>
          <option value="product_styling">Product Styling</option>
          <option value="social_validation">Social Validation</option>
        </select>

        <button
          onClick={resetFilters}
          className="rounded-xl bg-gradient-to-r from-myntra-pink to-myntra-orange px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          Reset Filters
        </button>
      </div>

      <TabNavigation active={tab} onChange={setTab} />

      {/* Full-width tabs: segments, insights, architecture */}
      {(tab === 'segments' || tab === 'insights' || tab === 'architecture') && (
        <main className="mt-6 animate-fade-in">
          {tab === 'segments' && <SegmentsPanel metrics={typedMetrics} />}
          {tab === 'insights' && <InsightsPanel metrics={typedMetrics} frictionData={frictionData} opportunityData={opportunityData} />}
          {tab === 'architecture' && <ArchitectureDiagram />}
        </main>
      )}

      {/* Standard full-width layout tabs */}
      {tab !== 'segments' && tab !== 'insights' && tab !== 'architecture' && (
      <main className="mt-6 animate-fade-in">
        <div className="rounded-2xl bg-white p-6 shadow-md border-t-4 border-myntra-pink">
          <h2 className="mb-4 text-xl font-bold text-myntra-text-dark flex items-center gap-2">
            <span className="inline-block h-5 w-1.5 rounded-full bg-gradient-to-b from-myntra-pink to-myntra-orange" />
            {tab === 'friction' && 'Friction Breakdown'}
            {tab === 'intent' && 'Intent Matrix'}
            {tab === 'journey' && 'Journey Tracker'}
            {tab === 'opportunity' && 'Opportunity Matrix'}
            {tab === 'behavioural' && 'Behavioural Analysis'}
          </h2>
          {tab === 'friction' && <FrictionBarChart data={frictionData} />}
          {tab === 'intent' && <IntentRadarChart data={intentData} />}
          {tab === 'journey' && <JourneyFlowChart data={journeyData} />}
          {tab === 'opportunity' && <OpportunityScatterPlot data={opportunityData} />}
          {tab === 'behavioural' && <BehaviouralAnalysis data={behaviouralResponse} />}
          {tab === 'discovery' && <DiscoveryPanel metrics={metrics} />}
        </div>
      </main>
      )}

      <ChatBot metrics={metrics} />
    </div>
  );
}
