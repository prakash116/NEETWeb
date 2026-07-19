import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { authTokens } from '@/lib/auth-tokens';
import { clearRoleCookie, setRoleCookie } from '@/lib/role-cookie';
import { useAuthStore } from '@/stores/auth-store';
import type { UserRole } from '@/types/entities';
import { login, logout, register } from './api';

/** Only same-origin absolute paths are honored as post-login targets. */
function safeNextPath(next: string | null): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return null;
  return next;
}

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  return useMutation({
    mutationFn: login,
    onSuccess: ({ user, tokens }) => {
      authTokens.setSession(tokens);
      setRoleCookie(user.role);
      setAuthenticated(user);
      toast.success(`Welcome back, ${user.fullName.split(' ')[0]}!`);
      const fallback = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      router.replace(safeNextPath(searchParams.get('next')) ?? fallback);
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  return useMutation({
    mutationFn: register,
    onSuccess: ({ user, tokens }) => {
      authTokens.setSession(tokens);
      setRoleCookie(user.role);
      setAuthenticated(user);
      toast.success(
        user.studentId
          ? `Account created! Your student ID is ${user.studentId}.`
          : 'Account created!',
      );
      router.replace('/dashboard');
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setGuest = useAuthStore((state) => state.setGuest);

  return useMutation({
    mutationFn: async () => {
      const refreshToken = authTokens.getRefreshToken();
      if (refreshToken) {
        // Best-effort server-side revocation; local purge happens regardless.
        await logout(refreshToken).catch(() => undefined);
      }
    },
    onSettled: () => {
      authTokens.clear();
      clearRoleCookie();
      setGuest();
      queryClient.clear();
      router.replace('/login');
    },
  });
}

/**
 * Client-side gate for authenticated pages: redirects guests to /login and
 * wrong-role users to their own home. Middleware handles the cookie-hint
 * fast path; this is the authoritative client check after session boot.
 */
export function useRequireAuth(role?: UserRole) {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (status === 'guest') {
      router.replace('/login');
      return;
    }
    if (status === 'authenticated' && role && user && user.role !== role) {
      router.replace(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    }
  }, [status, user, role, router]);

  return { status, user };
}
