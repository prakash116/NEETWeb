import Link from 'next/link';
import { ArrowUpRight, GraduationCap, Orbit } from 'lucide-react';
import { siteConfig } from '@/config/site';

const LINK_GROUPS = [
  {
    title: 'Explore',
    links: [
      { label: 'Subjects', href: '/#subjects' },
      { label: 'Growth strategy', href: '/#strategy' },
      { label: 'Top students', href: '/#achievers' },
      { label: 'Collaborations', href: '/#collaborations' },
    ],
  },
  {
    title: 'Experience',
    links: [
      { label: 'Student stories', href: '/#testimonials' },
      { label: 'Questions & answers', href: '/#faq' },
      { label: 'Log in', href: '/login' },
      { label: 'Create account', href: '/register' },
    ],
  },
  {
    title: 'Preparation',
    links: [
      { label: 'Class-wise library', href: '/subjects' },
      { label: 'Physics', href: '/subjects' },
      { label: 'Chemistry', href: '/subjects' },
      { label: 'Biology', href: '/subjects' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-slate-950 text-white">
      <div
        aria-hidden
        className="absolute -top-48 left-1/3 size-96 rounded-full bg-blue-700/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-7">
        <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.15fr_1.85fr]">
          <div className="max-w-md">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
              aria-label={`${siteConfig.name} — home`}
            >
              <span className="relative flex size-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 to-teal-500 text-white">
                <Orbit className="absolute size-9 text-white/20" aria-hidden />
                <GraduationCap className="relative size-5" aria-hidden />
              </span>
              <span>
                <span className="block text-base leading-tight font-semibold">
                  {siteConfig.shortName}
                </span>
                <span className="mt-0.5 block text-[10px] font-semibold tracking-[0.17em] text-teal-300 uppercase">
                  Student growth orbit
                </span>
              </span>
            </Link>
            <p className="mt-5 text-sm leading-6 text-slate-400">
              A focused NEET preparation system for reading, practising, measuring, and improving
              one topic at a time.
            </p>
            <Link
              href="/subjects"
              className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-blue-200 transition hover:text-white focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:outline-none"
            >
              Enter the public subject library
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {LINK_GROUPS.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="text-xs font-semibold tracking-[0.14em] text-slate-300 uppercase">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-400 transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2">
              <span className="relative flex size-2" aria-hidden>
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>
              Public preparation library online
            </span>
            <span>Made for focused NEET aspirants.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
