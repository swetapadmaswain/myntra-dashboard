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

export async function fetchMetrics(filters?: {
  source?: string | null;
  sentiment?: string | null;
  hesitation_driver?: string | null;
}): Promise<any> {
  return (await api.get('/dashboard/metrics', { params: filters })).data;
}

export async function fetchFriction(filters?: {
  source?: string | null;
  sentiment?: string | null;
  hesitation_driver?: string | null;
}): Promise<any> {
  return (await api.get('/dashboard/friction-breakdown', { params: filters })).data;
}

export async function fetchIntentMatrix(filters?: {
  source?: string | null;
  sentiment?: string | null;
  hesitation_driver?: string | null;
}): Promise<any> {
  return (await api.get('/dashboard/intent-matrix', { params: filters })).data;
}

export async function fetchJourney(filters?: {
  source?: string | null;
  sentiment?: string | null;
  hesitation_driver?: string | null;
}): Promise<any> {
  return (await api.get('/dashboard/journey-tracker', { params: filters })).data;
}

export async function fetchOpportunities(filters?: {
  source?: string | null;
  sentiment?: string | null;
  hesitation_driver?: string | null;
}): Promise<any> {
  return (await api.get('/dashboard/opportunity-matrix', { params: filters })).data;
}
