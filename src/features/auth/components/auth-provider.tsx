'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { authTokens } from '@/lib/auth-tokens';
import { clearRoleCookie, setRoleCookie } from '@/lib/role-cookie';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthResponse } from '@/types/entities';
import { refreshSession } from '../api';

/**
 * Single-flight session boot, module-scoped so Strict Mode's double effect
 * (or any remount) can never fire two refresh calls. Refresh tokens are
 * single-use server-side — a duplicate call would consume the same token
 * twice, trip the reuse detection, and revoke the whole session. The rotated
 * pair is stored INSIDE the shared flight so it is never lost to an unmounted
 * effect.
 */
let bootPromise: Promise<AuthResponse | null> | null = null;

function bootSession(): Promise<AuthResponse | null> {
  bootPromise ??= (async () => {
    const refreshToken = authTokens.getRefreshToken();
    if (!refreshToken) return null;
    try {
      const session = await refreshSession(refreshToken);
      authTokens.setSession(session.tokens);
      return session;
    } catch {
      authTokens.clear();
      return null;
    }
  })();
  return bootPromise;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setGuest = useAuthStore((state) => state.setGuest);

  useEffect(() => {
    let cancelled = false;

    void bootSession().then((session) => {
      if (cancelled) return;
      if (session) {
        setRoleCookie(session.user.role);
        setAuthenticated(session.user);
      } else {
        clearRoleCookie();
        setGuest();
      }
    });

    const unsubscribe = authTokens.onSessionExpired(() => {
      clearRoleCookie();
      setGuest();
      toast.error('Your session expired. Please log in again.');
      router.replace('/login?expired=1');
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [router, setAuthenticated, setGuest]);

  return <>{children}</>;
}
