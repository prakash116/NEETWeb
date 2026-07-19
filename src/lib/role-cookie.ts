import type { UserRole } from '@/types/entities';

/**
 * Non-sensitive role hint for middleware UX redirects (FRONTEND-DESIGN.md
 * §6.5). Contains no token — real enforcement is the API's JWT guards.
 */
export const ROLE_COOKIE_NAME = 'ne_role';

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

export function setRoleCookie(role: UserRole): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${ROLE_COOKIE_NAME}=${role}; path=/; max-age=${THIRTY_DAYS_SECONDS}; samesite=lax`;
}

export function clearRoleCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${ROLE_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}
