/**
 * Unified API Client Utility
 * Provides consistent data fetching patterns across the entire application
 * Replaces scattered fetch() calls with a centralized, type-safe client
 * 
 * REAL LOADING SYSTEM INTEGRATION:
 * - Automatically increments/decrements request counter on all API calls
 * - Supports AbortSignal for cleanup on unmount
 * - Can skip loading tracking for specific requests
 */

import { ApiResponse } from '@/types';
import { useLoading } from '@/hooks/use-loading';

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  skipLoading?: boolean;
}

/**
 * Extract data from API response wrapper or return raw data if already unwrapped
 */
function extractResponseData<T>(response: unknown): T {
  if (response && typeof response === 'object') {
    const obj = response as Record<string, unknown>;
    
    // If it's already wrapped in ApiResponse format
    if ('data' in obj && 'success' in obj) {
      return obj.data as T;
    }
    
    // If it's directly an array or object (raw response)
    if (Array.isArray(response) || !('success' in obj)) {
      return response as T;
    }
  }
  
  return response as T;
}

/**
 * Main API client with consistent error handling and response extraction
 * NOW INTEGRATED WITH REAL LOADING:
 * - Automatically increments request counter on start
 * - Automatically decrements on completion
 * - Supports AbortSignal for cleanup
 */
export async function apiCall<T = unknown>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    signal,
    skipLoading = false,
  } = config;

  // Start loading if not skipped
  let loading: ReturnType<typeof useLoading> | null = null;
  if (!skipLoading) {
    try {
      loading = useLoading() as ReturnType<typeof useLoading>;
      (loading as any).startLoading();
    } catch (err) {
      // useLoading might not be available in server context
      loading = null;
    }
  }

  // Build URL: handle http URLs, /api/ prefixed endpoints, and simple paths
  let url: string;
  if (endpoint.startsWith('http')) {
    url = endpoint;
  } else if (endpoint.startsWith('/api/')) {
    // Already has /api/ prefix, use as-is
    url = endpoint;
  } else if (endpoint.startsWith('/')) {
    // Path without /api prefix, add it
    url = `/api${endpoint}`;
  } else {
    // Simple path, add /api/ prefix
    url = `/api/${endpoint}`;
  }
  
  const requestConfig: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    requestConfig.body = JSON.stringify(body);
  }

  if (signal) {
    requestConfig.signal = signal;
  }

  try {
    const response = await fetch(url, requestConfig);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.statusText}`);
    }

    const data = await response.json();
    return extractResponseData<T>(data);
  } finally {
    // Stop loading after request completes (success or error)
    if (loading) {
      (loading as any).stopLoading();
    }
  }
}

/**
 * GET request - fetches data
 * REAL LOADING: Automatically triggers loading state for all requests
 */
export async function apiGet<T = unknown>(
  endpoint: string,
  signal?: AbortSignal,
  skipLoading?: boolean
): Promise<T> {
  return apiCall<T>(endpoint, { method: 'GET', signal, skipLoading });
}

/**
 * POST request - creates data
 * REAL LOADING: Automatically triggers loading state for all requests
 */
export async function apiPost<T = unknown>(
  endpoint: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
  skipLoading?: boolean
): Promise<T> {
  return apiCall<T>(endpoint, { method: 'POST', body, signal, skipLoading });
}

/**
 * PUT request - updates data
 * REAL LOADING: Automatically triggers loading state for all requests
 */
export async function apiPut<T = unknown>(
  endpoint: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
  skipLoading?: boolean
): Promise<T> {
  return apiCall<T>(endpoint, { method: 'PUT', body, signal, skipLoading });
}

/**
 * DELETE request - deletes data
 * REAL LOADING: Automatically triggers loading state for all requests
 */
export async function apiDelete<T = unknown>(
  endpoint: string,
  signal?: AbortSignal,
  skipLoading?: boolean
): Promise<T> {
  return apiCall<T>(endpoint, { method: 'DELETE', signal, skipLoading });
}

/**
 * PATCH request - partial updates
 * REAL LOADING: Automatically triggers loading state for all requests
 */
export async function apiPatch<T = unknown>(
  endpoint: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
  skipLoading?: boolean
): Promise<T> {
  return apiCall<T>(endpoint, { method: 'PATCH', body, signal, skipLoading });
}

/**
 * Parallel fetching utility for multiple endpoints
 */
export async function apiGetMultiple<T = unknown>(
  endpoints: string[]
): Promise<T[]> {
  return Promise.all(endpoints.map(endpoint => apiGet<T>(endpoint)));
}

/**
 * Utility hook wrapper for common fetch + error pattern
 * Used in components to simplify data fetching with error handling
 */
export async function fetchWithErrorHandling<T = unknown>(
  endpoint: string,
  onError?: (error: Error) => void,
  config?: RequestConfig
): Promise<T | null> {
  try {
    return await apiCall<T>(endpoint, config);
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error');
    console.error(`Failed to fetch ${endpoint}:`, err);
    onError?.(err);
    return null;
  }
}
