import { NextResponse, type NextRequest } from 'next/server';
import { ROLE_COOKIE_NAME } from '@/lib/role-cookie';

/**
 * UX-only redirects driven by the non-sensitive role-hint cookie
 * (FRONTEND-DESIGN.md §6.5). Real enforcement lives in the API's JWT guards
 * and the client-side useRequireAuth gate.
 */

const AUTH_PAGES = ['/login', '/register', '/forgot-password', '/reset-password'];
const STUDENT_PREFIXES = [
  '/dashboard',
  '/subjects',
  '/exams',
  '/exam',
  '/results',
  '/notifications',
  '/profile',
  '/community',
];

function matches(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get(ROLE_COOKIE_NAME)?.value;

  if (matches(pathname, AUTH_PAGES)) {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (role === 'student') return NextResponse.redirect(new URL('/dashboard', request.url));
    return NextResponse.next();
  }

  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (role === 'admin') return NextResponse.next();
    if (role === 'student') return NextResponse.redirect(new URL('/dashboard', request.url));
    const login = new URL('/login', request.url);
    login.searchParams.set('next', pathname);
    return NextResponse.redirect(login);
  }

  if (matches(pathname, STUDENT_PREFIXES)) {
    if (role === 'student') return NextResponse.next();
    if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    const login = new URL('/login', request.url);
    login.searchParams.set('next', pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/dashboard',
    '/dashboard/:path*',
    '/subjects',
    '/subjects/:path*',
    '/exams',
    '/exams/:path*',
    '/exam',
    '/results',
    '/results/:path*',
    '/notifications',
    '/profile',
    '/community',
    '/admin',
    '/admin/:path*',
  ],
};
