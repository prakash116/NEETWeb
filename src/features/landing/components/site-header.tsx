'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { AuthNavDesktop, AuthNavMobile } from '@/components/layout/user-menu';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Subjects', href: '#subjects' },
  { label: 'How it works', href: '#how-it-works' },
];

/** Floating glassmorphism navbar; gains opacity and a shadow once scrolled. */
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
      <div className="mx-auto max-w-6xl px-4 pt-3 sm:pt-4">
        <nav
          aria-label="Main"
          className={cn(
            'flex h-14 items-center justify-between gap-2 rounded-2xl border pr-2 pl-4 backdrop-blur-xl transition-all duration-300',
            scrolled
              ? 'border-slate-200/80 bg-white/85 shadow-lg shadow-slate-900/5'
              : 'border-white/60 bg-white/60',
          )}
        >
          <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.name} — home`}>
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="size-5" aria-hidden />
            </span>
            <span className="text-base font-semibold tracking-tight text-foreground">
              {siteConfig.shortName}
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white/80 hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <AuthNavDesktop />
          </div>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="top"
              className="rounded-b-2xl border-white/60 bg-white/90 backdrop-blur-xl"
            >
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="flex flex-col gap-1 px-4 pt-10 pb-5">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-white"
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
