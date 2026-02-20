import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@/constants';
import { getAuthToken, getAuthCookie, clearAllAuth } from '@/utils/storage';
import { ApiError } from '@/types';

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth state listener for notifying context when 401 occurs
type AuthInvalidatedCallback = () => void;
let onAuthInvalidated: AuthInvalidatedCallback | null = null;

// Flag to indicate if auth system is ready to handle 401s
// During initial hydration, we should NOT auto-logout on 401
let isAuthReady = false;

// Grace period timestamp - 401s are ignored until this time passes
// Used to prevent logout immediately after login
let graceUntil = 0;

// Register callback to be notified when auth is invalidated due to 401
export function setAuthInvalidatedCallback(callback: AuthInvalidatedCallback | null): void {
  onAuthInvalidated = callback;
}

// Called by AuthContext when hydration is complete and 401 handling is safe
export function setAuthReady(ready: boolean): void {
  isAuthReady = ready;
}

// Set a grace period during which 401s will not trigger logout
// Used after login to prevent race conditions with stale requests
export function setAuthGracePeriod(durationMs: number): void {
  graceUntil = Date.now() + durationMs;
}

// Flag to prevent multiple simultaneous auth clear operations
let isHandling401 = false;

// Request interceptor: send Bearer token and, if present, lasalva_auth cookie (fallback so backend runs same email path as web)
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const cookie = await getAuthCookie();
    if (cookie) {
      config.headers.Cookie = `lasalva_auth=${cookie}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    
    const status = error.response?.status;
    const config = error.config;

    // Handle 429 Rate Limit with exponential backoff
    if (status === 429 && config) {
      const retryCount = (config as any).__retryCount ?? 0;
      if (retryCount < MAX_RETRIES) {
        (config as any).__retryCount = retryCount + 1;
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, retryCount);
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return api(config);
      }
    }

    // Handle 401 Unauthorized: try token refresh once, then clear and reject
    if (status === 401 && config) {
      const retry401 = (config as InternalAxiosRequestConfig & { __retry401?: boolean }).__retry401;
      if (!retry401) {
        try {
          const { refreshAuthToken } = await import('@/services/auth');
          const newToken = await refreshAuthToken();
          if (newToken) {
            (config as InternalAxiosRequestConfig & { __retry401?: boolean }).__retry401 = true;
            return api(config);
          }
        } catch (refreshError) {
          console.warn('[API] Token refresh failed:', refreshError);
        }
      }

      // Token refresh failed or was already attempted
      // ONLY clear auth if:
      // 1. Auth system is ready (hydration complete)
      // 2. Not in grace period (just after login)
      // 3. Not already handling a 401
      const inGracePeriod = Date.now() < graceUntil;
      if (isAuthReady && !inGracePeriod && !isHandling401) {
        isHandling401 = true;
        try {
          // Double-check we still have a token before clearing
          // This prevents clearing during hydration race conditions
          const currentToken = await getAuthToken();
          if (currentToken) {
            await clearAllAuth();
            // Notify auth context that auth was invalidated
            if (onAuthInvalidated) {
              onAuthInvalidated();
            }
          }
        } catch (clearError) {
          console.warn('[API] Failed to clear auth:', clearError);
        } finally {
          // Reset flag after a delay to prevent rapid-fire clears
          setTimeout(() => {
            isHandling401 = false;
          }, 1000);
        }
      } else if (inGracePeriod) {
        console.warn('[API] 401 ignored - in grace period after login');
      }

      const apiError: ApiError = {
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Session expired. Please log in again.',
        code: 'UNAUTHORIZED',
        status: 401,
      };
      return Promise.reject(apiError);
    }

    // Handle other errors
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';

    const apiError: ApiError = {
      message,
      code: error.code,
      status,
    };

    return Promise.reject(apiError);
  }
);

// Helper for multipart form data requests
// Note: Don't set Content-Type header manually - fetch will set it automatically
// with the correct boundary when using FormData
export async function uploadFormData(
  endpoint: string,
  formData: FormData,
  method: 'POST' | 'PUT' = 'PUT'
): Promise<any> {
  const token = await getAuthToken();
  const cookie = await getAuthCookie();
  
  // Build headers - DO NOT set Content-Type for multipart/form-data
  // The browser/React Native will set it automatically with the correct boundary
  const headers: Record<string, string> = {};
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (cookie) {
    headers.Cookie = `lasalva_auth=${cookie}`;
  }
  
  const fullUrl = `${API_URL}/api${endpoint}`;
  let response: Response;
  try {
    response = await fetch(fullUrl, {
      method,
      headers,
      body: formData,
    });
  } catch (networkError: any) {
    throw {
      message: `Network error: ${networkError?.message || 'Please check your connection.'}`,
      status: 0,
    } as ApiError;
  }
  
  // Get the response text first to debug parsing issues
  const responseText = await response.text();
  
  // Try to parse as JSON
  let data: any;
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch (parseError: any) {
    throw {
      message: `Invalid JSON response: ${responseText.substring(0, 100)}...`,
      status: response.status,
    } as ApiError;
  }
  
  if (!response.ok) {
    throw {
      message: data.message || data.error || 'Upload failed',
      status: response.status,
    } as ApiError;
  }
  
  // Handle both wrapped and unwrapped response formats
  if (data.profile) {
    return data.profile;
  }
  if (data.staff) {
    return data.staff;
  }
  return data;
}

export default api;
