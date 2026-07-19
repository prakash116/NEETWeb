import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { siteConfig } from '@/config/site';

const LINK_GROUPS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Subjects', href: '#subjects' },
      { label: 'How it works', href: '#how-it-works' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Log in', href: '/login' },
      { label: 'Create account', href: '/register' },
    ],
  },
  {
    title: 'Subjects',
    links: [
      { label: 'Physics', href: '#subjects' },
      { label: 'Chemistry', href: '#subjects' },
      { label: 'Botany', href: '#subjects' },
      { label: 'Zoology', href: '#subjects' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.name} — home`}>
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="size-5" aria-hidden />
              </span>
              <span className="text-base font-semibold tracking-tight text-foreground">
                {siteConfig.shortName}
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Structured NEET preparation with timed exams, topic-wise practice, and honest
              analytics.
            </p>
          </div>

          {LINK_GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.label}`}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-600 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">Made for NEET aspirants.</p>
        </div>
      </div>
    </footer>
  );
}
