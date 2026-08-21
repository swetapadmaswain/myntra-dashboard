import axios from 'axios';
import { Snippet } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Network error';
    return Promise.reject(message);
  }
);

export async function fetchSnippets(params: {
  page?: number;
  limit?: number;
  hesitation_driver?: string | null;
  sentiment?: string | null;
}): Promise<{ snippets: Snippet[]; total: number; page: number; limit: number }> {
  return (await api.get('/snippets', { params })).data;
}

export async function searchSnippets(body: {
  query: string;
  filters?: Record<string, any>;
  page?: number;
  limit?: number;
}): Promise<{ snippets: Snippet[]; total: number; page: number; limit: number }> {
  return (await api.post('/snippets/search', body)).data;
}

export async function fetchMetrics(): Promise<any> {
  return (await api.get('/dashboard/metrics')).data;
}

export async function fetchFriction(): Promise<any> {
  return (await api.get('/dashboard/friction-breakdown')).data;
}

export async function fetchIntentMatrix(): Promise<any> {
  return (await api.get('/dashboard/intent-matrix')).data;
}

export async function fetchJourney(): Promise<any> {
  return (await api.get('/dashboard/journey-tracker')).data;
}

export async function fetchOpportunities(): Promise<any> {
  return (await api.get('/dashboard/opportunity-matrix')).data;
}
