/**
 * Proxy Service
 * Handles proxying requests to downstream microservices with timeout and retry logic
 */

import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import settings from '../config/settings';
import logger from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export type ServiceName = 'nlp' | 'analytics' | 'ingestion';

const SERVICE_URLS: Record<ServiceName, string> = {
  nlp: settings.nlpServiceUrl,
  analytics: settings.analyticsServiceUrl,
  ingestion: settings.dataIngestionServiceUrl,
};

interface ProxyOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  params?: Record<string, unknown>;
  data?: unknown;
  headers?: Record<string, string>;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Proxy a request to a downstream microservice with retry and circuit-breaker-lite behavior.
 * Retries on network errors and 5xx responses; does not retry on 4xx.
 */
export async function proxyRequest<T = unknown>(
  service: ServiceName,
  options: ProxyOptions
): Promise<T> {
  const baseUrl = SERVICE_URLS[service];
  const url = `${baseUrl}${options.path}`;

  const config: AxiosRequestConfig = {
    method: options.method || 'GET',
    url,
    params: options.params,
    data: options.data,
    headers: options.headers,
    timeout: settings.proxyTimeoutMs,
  };

  let lastError: AxiosError | undefined;

  for (let attempt = 0; attempt <= settings.proxyMaxRetries; attempt++) {
    try {
      const response = await axios.request<T>(config);
      return response.data;
    } catch (error) {
      lastError = error as AxiosError;

      const status = lastError.response?.status;
      const isRetryable = !status || status >= 500;

      logger.warn(`Proxy request to ${service} failed (attempt ${attempt + 1})`, {
        service,
        url,
        status,
        error: lastError.message,
      });

      if (!isRetryable || attempt === settings.proxyMaxRetries) {
        break;
      }

      // Exponential backoff
      await sleep(2 ** attempt * 100);
    }
  }

  const status = lastError?.response?.status || 502;
  const message = lastError?.response?.data
    ? JSON.stringify(lastError.response.data)
    : lastError?.message || 'Downstream service unavailable';

  throw new AppError(
    `Failed to reach ${service} service: ${message}`,
    status >= 400 && status < 600 ? status : 502,
    'DOWNSTREAM_SERVICE_ERROR'
  );
}

export default proxyRequest;
