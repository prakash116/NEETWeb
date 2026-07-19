/**
 * Token holder shared by the axios client and the auth store.
 *
 * - Access token lives in memory only (never persisted, never logged).
 * - Refresh token persists in localStorage so the session survives reloads —
 *   the backend issues body tokens (no httpOnly cookie option), see
 *   FRONTEND-DESIGN.md §8.2.
 */

const REFRESH_TOKEN_KEY = 'neet.rt';

let accessToken: string | null = null;

type Listener = () => void;
const expiredListeners = new Set<Listener>();

export const authTokens = {
  getAccessToken(): string | null {
    return accessToken;
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setSession(tokens: { accessToken: string; refreshToken: string }): void {
    accessToken = tokens.accessToken;
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } catch {
      // Storage unavailable (private mode / quota) — session won't survive reloads.
    }
  },

  clear(): void {
    accessToken = null;
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // Ignore — nothing sensitive remains in memory either way.
    }
  },

  /** Fired when a refresh attempt fails and the session is gone for good. */
  onSessionExpired(listener: Listener): () => void {
    expiredListeners.add(listener);
    return () => expiredListeners.delete(listener);
  },

  emitSessionExpired(): void {
    for (const listener of expiredListeners) listener();
  },
};
