import { api } from '@/lib/api-client';
import type { AuthResponse } from '@/types/entities';
import type { LoginValues, RegisterPayload } from './schemas';

export function login(payload: LoginValues): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/login', payload);
}

/** Registration auto-logs-in: the backend returns a full token pair. */
export function register(payload: RegisterPayload): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/register', payload);
}

/**
 * Explicit rotation used by the session boot. (Expired-access-token refreshes
 * during normal requests are handled inside the axios interceptor.)
 */
export function refreshSession(refreshToken: string): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/refresh', { refreshToken });
}

export function logout(refreshToken: string): Promise<null> {
  return api.post<null>('/auth/logout', { refreshToken });
}
