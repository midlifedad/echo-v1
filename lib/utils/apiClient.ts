/**
 * API Client Utility
 * Provides fetch wrapper with automatic CSRF token inclusion
 */

import { getCSRFTokenFromCookies } from '@/lib/middleware/csrf';

/**
 * HTTP methods
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API request options
 */
interface ApiRequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  method?: HttpMethod;
  body?: unknown;
  skipCSRF?: boolean;
}

/**
 * API response wrapper
 */
interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  status: number;
  headers: Headers;
}

/**
 * Fetch wrapper with automatic CSRF token inclusion
 *
 * @param url - API endpoint URL
 * @param options - Request options
 * @returns Promise resolving to API response
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    skipCSRF = false,
    ...restOptions
  } = options;

  // Prepare headers
  const requestHeaders = new Headers(headers);

  // Add Content-Type for JSON requests
  if (body && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  // Add CSRF token for state-changing methods
  const stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (stateChangingMethods.includes(method) && !skipCSRF) {
    const csrfToken = getCSRFTokenFromCookies();
    if (csrfToken) {
      requestHeaders.set('x-csrf-token', csrfToken);
    } else {
      console.warn('CSRF token not found in cookies. Request may be rejected.');
    }
  }

  // Prepare request body
  const requestBody = body ? JSON.stringify(body) : undefined;

  try {
    // Make the request
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: requestBody,
      ...restOptions,
    });

    // Parse response
    let data: T | undefined;
    let error: ApiResponse<T>['error'];

    const contentType = response.headers.get('Content-Type');
    if (contentType?.includes('application/json')) {
      const json = await response.json();

      if (response.ok) {
        data = json;
      } else {
        error = {
          message: json.message || json.error || 'Request failed',
          code: json.code,
          details: json.details,
        };
      }
    } else {
      if (!response.ok) {
        error = {
          message: response.statusText || 'Request failed',
          code: `HTTP_${response.status}`,
        };
      }
    }

    return {
      data,
      error,
      status: response.status,
      headers: response.headers,
    };
  } catch (err) {
    console.error('API request failed:', err);

    return {
      error: {
        message: err instanceof Error ? err.message : 'Network error',
        code: 'NETWORK_ERROR',
        details: err,
      },
      status: 0,
      headers: new Headers(),
    };
  }
}

/**
 * Convenience methods for common HTTP verbs
 */

export async function apiGet<T = unknown>(
  url: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'GET' });
}

export async function apiPost<T = unknown>(
  url: string,
  body?: unknown,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'POST', body });
}

export async function apiPut<T = unknown>(
  url: string,
  body?: unknown,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'PUT', body });
}

export async function apiDelete<T = unknown>(
  url: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'DELETE' });
}

export async function apiPatch<T = unknown>(
  url: string,
  body?: unknown,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'PATCH', body });
}

/**
 * Helper to check if response was successful
 */
export function isSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { data: T } {
  return response.status >= 200 && response.status < 300 && !response.error;
}

/**
 * Helper to extract data or throw error
 */
export function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (isSuccess(response) && response.data !== undefined) {
    return response.data;
  }

  throw new Error(
    response.error?.message || `Request failed with status ${response.status}`
  );
}
