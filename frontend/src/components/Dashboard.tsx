'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { KPICards } from './KPICards';
import { TabNavigation } from './TabNavigation';
import { SnippetCarousel } from './SnippetCarousel';
import { DiscoveryPanel } from './DiscoveryPanel';
import { ChatBot } from './ChatBot';
import { FrictionBarChart } from './FrictionBarChart';
import { IntentRadarChart } from './IntentRadarChart';
import { JourneyFlowChart } from './JourneyFlowChart';
import { OpportunityScatterPlot } from './OpportunityScatterPlot';
import { SegmentsPanel } from './SegmentsPanel';
import { InsightsPanel } from './InsightsPanel';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { fetchMetrics, fetchSnippets, fetchFriction, fetchIntentMatrix, fetchJourney, fetchOpportunities } from '@/services/api';
import { useDashboardStore } from '@/store/dashboardStore';
import { KPIMetrics } from '@/types';
import { journeyMock, opportunityMock, snippetMock } from '@/data/mockData';

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

  const { data: snippetsData, isLoading: snippetsLoading, isError: snippetsError } = useQuery({
    queryKey: ['snippets', filters],
    queryFn: () =>
      fetchSnippets({
        page: filters.page,
        limit: filters.limit,
        sentiment: filters.sentiment,
        hesitation_driver: filters.hesitation_driver,
      }),
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

  const typedMetrics = (metrics as KPIMetrics) || {};

  // Build friction chart data from filtered friction API response, fall back to metrics
  const frictionApiData = (frictionResponse as any)?.friction_types;
  const frictionData = frictionApiData
    ? frictionApiData.map((item: any) => ({
        name: titleCase(item.name),
        count: item.count,
      }))
    : Object.entries(typedMetrics.hesitation_distribution || {}).map(([name, count]) => ({
        name: titleCase(name),
        count,
      }));

  // Build intent chart data from filtered intent API response, fall back to metrics
  const intentApiData = (intentResponse as any)?.intent_distribution;
  const intentDist = intentApiData
    ? Object.fromEntries(intentApiData.map((item: any) => [item.intent_type, item.count]))
    : (typedMetrics.intent_distribution || {});
  const maxIntent = Math.max(...Object.values(intentDist), 1);
  const intentData = Object.entries(intentDist).map(([subject, a]) => ({
    subject: titleCase(subject),
    A: a,
    fullMark: maxIntent,
  }));

  // Journey data from filtered API, transform funnel_data to chart format, fall back to mock
  const journeyApiData = (journeyResponse as any)?.funnel_data;
  const journeyData = journeyApiData
    ? journeyApiData.map((item: any) => ({
        name: titleCase(item.step_name),
        users: item.count,
      }))
    : journeyMock;

  // Opportunity data from filtered API, transform to chart format, fall back to mock
  const opportunityApiData = (opportunityResponse as any)?.opportunities;
  const opportunityData = opportunityApiData
    ? opportunityApiData.map((item: any) => ({
        x: item.effort_score,
        y: item.lift_score,
        z: item.estimated_impact || item.priority_score * 100,
        label: item.opportunity_name,
      }))
    : opportunityMock;

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-myntra-gray">
        <p className="text-myntra-text-light">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-myntra-gray p-4 md:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-myntra-text-dark">Wishlist AI Dashboard</h1>
          <p className="text-sm text-myntra-text-light">Discover why people hesitate to buy from their wishlist</p>
        </div>
      </header>

      {metricsLoading ? (
        <div className="mb-6 rounded-xl bg-white p-8 text-center shadow-sm">Loading KPIs...</div>
      ) : (
        <div className="mb-6">
          <KPICards metrics={metrics || {}} />
        </div>
      )}

      {metricsError && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          Failed to load KPIs. Check the API Gateway and browser console.
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        <select
          className="rounded-lg border border-myntra-gray-2 bg-white px-3 py-2 text-sm"
          value={filters.source || ''}
          onChange={(e) => setFilter('source', e.target.value || null)}
        >
          <option value="">All sources</option>
          <option value="appstore">App/Play Store</option>
          <option value="youtube">YouTube</option>
          <option value="reddit">Reddit</option>
        </select>

        <select
          className="rounded-lg border border-myntra-gray-2 bg-white px-3 py-2 text-sm"
          value={filters.sentiment || ''}
          onChange={(e) => setFilter('sentiment', e.target.value || null)}
        >
          <option value="">All sentiments</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>

        <select
          className="rounded-lg border border-myntra-gray-2 bg-white px-3 py-2 text-sm"
          value={filters.hesitation_driver || ''}
          onChange={(e) => setFilter('hesitation_driver', e.target.value || null)}
        >
          <option value="">All drivers</option>
          <option value="fit_sizing">Fit / Sizing</option>
          <option value="visual_reality">Visual / Reality</option>
          <option value="price_value">Price / Value</option>
          <option value="styling_wardrobe">Styling / Wardrobe</option>
          <option value="social_validation">Social Validation</option>
        </select>

        <button
          onClick={resetFilters}
          className="rounded-lg border border-myntra-pink px-3 py-2 text-sm font-medium text-myntra-pink hover:bg-myntra-pink hover:text-white"
        >
          Reset
        </button>
      </div>

      <TabNavigation active={tab} onChange={setTab} />

      {/* Full-width tabs: segments, insights, architecture */}
      {(tab === 'segments' || tab === 'insights' || tab === 'architecture') && (
        <main className="mt-6">
          {tab === 'segments' && <SegmentsPanel metrics={typedMetrics} />}
          {tab === 'insights' && <InsightsPanel metrics={typedMetrics} frictionData={frictionData} opportunityData={opportunityData} />}
          {tab === 'architecture' && <ArchitectureDiagram />}
        </main>
      )}

      {/* Standard 2/3 + 1/3 layout tabs */}
      {tab !== 'segments' && tab !== 'insights' && tab !== 'architecture' && (
      <main className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-myntra-text-dark">
              {tab === 'friction' && 'Friction Breakdown'}
              {tab === 'intent' && 'Intent Matrix'}
              {tab === 'journey' && 'Journey Tracker'}
              {tab === 'opportunity' && 'Opportunity Matrix'}
            </h2>
            {tab === 'friction' && <FrictionBarChart data={frictionData} />}
            {tab === 'intent' && <IntentRadarChart data={intentData} />}
            {tab === 'journey' && <JourneyFlowChart data={journeyData} />}
            {tab === 'opportunity' && <OpportunityScatterPlot data={opportunityData} />}
            {tab === 'discovery' && <DiscoveryPanel metrics={metrics} />}
          </div>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          {snippetsLoading ? (
            <div className="flex h-[420px] items-center justify-center rounded-xl bg-white p-8 text-center shadow-sm">
              Loading snippets...
            </div>
          ) : (
            <SnippetCarousel snippets={snippetsData?.snippets || snippetMock} />
          )}
        </div>
      </main>
      )}

      <ChatBot metrics={metrics} />
    </div>
  );
}
