'use client';

import Link from 'next/link';
import { GraduationCap, Menu, Orbit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AuthNavDesktop, AuthNavMobile } from '@/components/layout/user-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Subjects', href: '/#subjects' },
  { label: 'Growth strategy', href: '/#strategy' },
  { label: 'Top students', href: '/#achievers' },
  { label: 'Collaborations', href: '/#collaborations' },
  { label: 'Stories', href: '/#testimonials' },
  { label: 'FAQ', href: '/#faq' },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 pt-3 sm:pt-4">
        <nav
          aria-label="Main"
          className={cn(
            'flex h-15 items-center justify-between gap-2 rounded-2xl border pr-2 pl-3 backdrop-blur-xl transition-all duration-300 sm:pl-4',
            scrolled
              ? 'border-slate-200/85 bg-white/90 shadow-xl shadow-slate-900/8'
              : 'border-white/65 bg-white/65 shadow-lg shadow-blue-950/5',
          )}
        >
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label={`${siteConfig.name} — home`}
          >
            <span className="relative flex size-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-800 via-blue-700 to-teal-600 text-white shadow-md shadow-blue-900/20">
              <Orbit className="absolute size-8 text-white/20" aria-hidden />
              <GraduationCap className="relative size-5" aria-hidden />
            </span>
            <span>
              <span className="block text-sm leading-tight font-semibold tracking-tight text-slate-950">
                {siteConfig.shortName}
              </span>
              <span className="block text-[9px] leading-tight font-semibold tracking-[0.16em] text-teal-700 uppercase">
                Growth orbit
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-0.5 lg:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:bg-blue-50/80 hover:text-blue-800"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <AuthNavDesktop />
          </div>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="lg:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="top"
              className="rounded-b-2xl border-white/60 bg-white/95 backdrop-blur-xl"
            >
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="flex flex-col gap-1 px-4 pt-10 pb-5">
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-900">
                  <Orbit className="size-4 text-teal-600" aria-hidden />
                  Navigate your NEET growth orbit
                </div>
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-blue-50"
                  >
                    {link.label}
                  </a>
                ))}
                <AuthNavMobile onNavigate={() => setMenuOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}
