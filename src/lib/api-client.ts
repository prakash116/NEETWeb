import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { authTokens } from '@/lib/auth-tokens';
import { env } from '@/lib/env';
import type { ApiEnvelope } from '@/types/api';
import type { AuthResponse } from '@/types/entities';

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/** Endpoints where a 401 is a real answer, not an expired access token. */
const NO_REFRESH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: 30_000,
});

http.interceptors.request.use((config) => {
  const token = authTokens.getAccessToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  else config.headers.delete('Authorization');
  return config;
});

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Rotate the refresh token (single-use server-side). Uses bare axios so the
 * call skips these interceptors — a failing refresh must never recurse.
 */
async function refreshSession(): Promise<boolean> {
  const refreshToken = authTokens.getRefreshToken();
  if (!refreshToken) return false;
  try {
    const response = await axios.post<ApiEnvelope<AuthResponse>>(
      `${env.apiUrl}/auth/refresh`,
      { refreshToken },
      { timeout: 15_000 },
    );
    authTokens.setSession(response.data.data.tokens);
    return true;
  } catch {
    return false;
  }
}

function toApiError(error: AxiosError<Partial<ApiEnvelope<unknown>>>): ApiError {
  const status = error.response?.status ?? 0;
  const fallback =
    status === 0
      ? 'Cannot reach the server. Check your connection and try again.'
      : 'Something went wrong. Please try again.';
  return new ApiError(error.response?.data?.message ?? fallback, status, error.response?.data);
}

http.interceptors.response.use(undefined, async (error: AxiosError<Partial<ApiEnvelope<unknown>>>) => {
  const original = error.config as (InternalAxiosRequestConfig & { retried?: boolean }) | undefined;
  const url = original?.url ?? '';
  const shouldRefresh =
    error.response?.status === 401 &&
    original !== undefined &&
    !original.retried &&
    !NO_REFRESH_PATHS.some((path) => url.includes(path));

  if (shouldRefresh) {
    refreshInFlight ??= refreshSession().finally(() => {
      refreshInFlight = null;
    });
    const refreshed = await refreshInFlight;
    if (refreshed) {
      original.retried = true;
      return http(original);
    }
    authTokens.clear();
    authTokens.emitSessionExpired();
  }

  throw toApiError(error);
});

/** Typed request helpers that unwrap the `{ success, message, data }` envelope. */
export const api = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await http.get<ApiEnvelope<T>>(url, config);
    return response.data.data;
  },
  async post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await http.post<ApiEnvelope<T>>(url, body, config);
    return response.data.data;
  },
  async patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await http.patch<ApiEnvelope<T>>(url, body, config);
    return response.data.data;
  },
  async put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await http.put<ApiEnvelope<T>>(url, body, config);
    return response.data.data;
  },
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await http.delete<ApiEnvelope<T>>(url, config);
    return response.data.data;
  },
};
