'use client';

import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { AuthNavDesktop } from '@/components/layout/user-menu';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

const LINKS = [
  { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
  { key: 'subjects', label: 'Subjects', href: '/subjects' },
  { key: 'exams', label: 'Exams', href: '/exams' },
  { key: 'community', label: 'Community', href: '/community' },
] as const;

type AppHeaderActive = (typeof LINKS)[number]['key'];

/**
 * Glass navigation bar for authenticated student pages (interim shell until
 * the full sidebar layout ships with M2). Mobile navigation lives in the
 * avatar dropdown.
 */
export function AppHeader({ active }: { active?: AppHeaderActive }) {
  return (
    <header className="sticky top-0 z-40 px-4 pt-3 sm:pt-4">
      <div className="mx-auto max-w-6xl">
        <nav
          aria-label="App"
          className="flex h-14 items-center justify-between gap-2 rounded-2xl border border-white/60 bg-white/70 pr-2 pl-4 shadow-lg shadow-slate-900/5 backdrop-blur-xl"
        >
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label={`${siteConfig.name} — home`}
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="size-5" aria-hidden />
            </span>
            <span className="text-base font-semibold tracking-tight text-foreground">
              {siteConfig.shortName}
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                aria-current={active === link.key ? 'page' : undefined}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active === link.key
                    ? 'bg-white/90 text-foreground shadow-sm'
                    : 'text-slate-600 hover:bg-white/80 hover:text-foreground',
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <AuthNavDesktop />
          </div>
        </nav>
      </div>
    </header>
  );
}
