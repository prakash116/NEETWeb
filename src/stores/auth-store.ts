import { create } from 'zustand';
import type { AuthUser } from '@/types/entities';

/**
 * 'booting' until the silent-refresh attempt on app load settles; guards show
 * a loader during boot instead of bouncing users to /login prematurely.
 */
export type AuthStatus = 'booting' | 'authenticated' | 'guest';

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  setAuthenticated: (user: AuthUser) => void;
  setGuest: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'booting',
  user: null,
  setAuthenticated: (user) => set({ status: 'authenticated', user }),
  setGuest: () => set({ status: 'guest', user: null }),
}));
