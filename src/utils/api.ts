/**
 * Centralized API configuration & robust request utility
 * Directs browser requests to Express on port 3001 with full CORS support,
 * with automatic fallback to /api proxy and bulletproof JSON response parsing.
 */

export const API_BASE =
  typeof window !== 'undefined' &&
  (window.location.port === '5173' || window.location.port === '3000' || window.location.port === '4173' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? `${window.location.protocol}//${window.location.hostname}:3001/api`
    : '/api';

export interface ApiResult<T = any> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
}

/**
 * Safe API request helper that:
 * 1. Connects directly to backend or uses proxy fallback
 * 2. Safely extracts response text and parses JSON without throwing SyntaxError
 * 3. Auto-includes Bearer tokens and cookies
 * 4. Normalizes error messages
 */
export async function safeApiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.slice(4) : endpoint;
  const normalizedEndpoint = cleanEndpoint.startsWith('/') ? cleanEndpoint : '/' + cleanEndpoint;

  const primaryUrl = `${API_BASE}${normalizedEndpoint}`;
  const fallbackUrl = `/api${normalizedEndpoint}`;

  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('cb_token') || sessionStorage.getItem('cb_token');
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const requestOptions: RequestInit = {
    credentials: 'include',
    ...options,
    headers: {
      ...defaultHeaders,
      ...((options.headers as Record<string, string>) || {})
    }
  };

  let response: Response | null = null;
  let fetchError: any = null;

  // 1. Try primary URL
  try {
    response = await fetch(primaryUrl, requestOptions);
  } catch (err) {
    fetchError = err;
    // 2. Try fallback if primary fails (e.g. proxy)
    try {
      response = await fetch(fallbackUrl, requestOptions);
      fetchError = null;
    } catch (fallbackErr) {
      // Both failed
    }
  }

  if (!response) {
    return {
      ok: false,
      status: 0,
      data: null as any,
      error:
        fetchError?.message ||
        'Unable to connect to the authentication server. Please check your connection.'
    };
  }

  // Safely parse body
  let data: any = null;
  try {
    const text = await response.text();
    if (text && text.trim().length > 0) {
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        data = { message: text };
      }
    } else {
      data = {};
    }
  } catch (readErr: any) {
    data = {};
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      data,
      error:
        data?.error ||
        data?.message ||
        `Server responded with error status ${response.status}`
    };
  }

  return {
    ok: true,
    status: response.status,
    data: data || {}
  };
}
