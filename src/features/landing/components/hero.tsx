'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Target,
  TrendingUp,
} from 'lucide-react';
import { subjectVisual } from '@/lib/labels';
import { useLandingSummary } from '../hooks';
import { HeroCtas } from './auth-ctas';
import { HeroCarousel } from './hero-carousel';

const FALLBACK_SUBJECTS = [
  { id: 'phy', code: 'PHY', name: 'Physics' },
  { id: 'che', code: 'CHE', name: 'Chemistry' },
  { id: 'bot', code: 'BOT', name: 'Botany' },
  { id: 'zoo', code: 'ZOO', name: 'Zoology' },
];

function formatStat(value: number | undefined, fallback: string): string {
  if (!value) return fallback;
  return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  );
}

export function Hero() {
  const summaryQuery = useLandingSummary();
  const summary = summaryQuery.data;
  const subjects =
    summary && summary.subjects.length > 0 ? summary.subjects : FALLBACK_SUBJECTS;
  const stats = summary?.stats;

  const platformStats = [
    {
      label: 'Active students',
      value: formatStat(stats?.students, 'Growing'),
      icon: TrendingUp,
    },
    {
      label: 'Practice questions',
      value: formatStat(stats?.questions, 'Curated'),
      icon: Target,
    },
    {
      label: 'Study topics',
      value: formatStat(stats?.topics, 'Structured'),
      icon: BookOpen,
    },
    {
      label: 'Published exams',
      value: formatStat(stats?.exams, 'Timed'),
      icon: Clock3,
    },
  ];

  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-35"
        style={{
          backgroundImage:
            'linear-gradient(rgba(37,99,235,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,.08) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'linear-gradient(to bottom, black, transparent 90%)',
        }}
      />
      <div
        aria-hidden
        className="absolute top-20 left-[8%] -z-10 size-72 rounded-full bg-blue-300/25 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute top-44 right-[5%] -z-10 size-80 rounded-full bg-teal-300/25 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.06fr)_minmax(25rem,.94fr)] lg:gap-14">
          <div>
            <HeroCarousel />
            <HeroCtas align="start" />
            <Link
              href="/subjects"
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg px-1 text-sm font-semibold text-slate-600 transition hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            >
              Browse the free preparation library
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div
              aria-hidden
              className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-gradient-to-br from-blue-400/20 via-violet-300/15 to-teal-300/25 blur-2xl"
            />
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-white shadow-2xl shadow-blue-950/25">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <span className="relative flex size-2.5" aria-hidden>
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-xs font-semibold tracking-[0.16em] text-slate-300 uppercase">
                    Growth mission control
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-500">LIVE PREVIEW</span>
              </div>

              <div className="grid gap-6 p-5 sm:p-6">
                <div className="grid items-center gap-5 sm:grid-cols-[10rem_1fr]">
                  <div className="relative mx-auto flex size-40 items-center justify-center">
                    <div
                      className="absolute inset-0 rounded-full p-[10px]"
                      style={{
                        background:
                          'conic-gradient(#2dd4bf 0deg 262deg, rgba(255,255,255,.09) 262deg 360deg)',
                      }}
                    >
                      <div className="size-full rounded-full bg-slate-950" />
                    </div>
                    <div className="relative text-center">
                      <Activity className="mx-auto size-4 text-teal-300" aria-hidden />
                      <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">73%</p>
                      <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                        Weekly rhythm
                      </p>
                    </div>
                    <span className="absolute top-1 right-4 size-3 rounded-full border-2 border-slate-950 bg-blue-400" />
                    <span className="absolute right-0 bottom-10 size-2.5 rounded-full border-2 border-slate-950 bg-violet-400" />
                    <span className="absolute bottom-1 left-7 size-3 rounded-full border-2 border-slate-950 bg-teal-400" />
                  </div>

                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Today&apos;s focus orbit</p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">
                          One clear action for every subject.
                        </p>
                      </div>
                      <span className="rounded-full border border-teal-400/20 bg-teal-400/10 px-2 py-1 text-[10px] font-semibold text-teal-300">
                        +8% this week
                      </span>
                    </div>
                    <ul className="mt-4 grid grid-cols-2 gap-2">
                      {subjects.slice(0, 4).map((subject, index) => {
                        const visual = subjectVisual(subject.code);
                        return (
                          <li
                            key={subject.id}
                            className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2.5"
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className="size-2 rounded-full"
                                style={{ backgroundColor: visual.color }}
                                aria-hidden
                              />
                              <span className="truncate text-xs font-medium text-slate-200">
                                {subject.name}
                              </span>
                            </span>
                            <span className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
                              <CheckCircle2 className="size-3 text-emerald-400" aria-hidden />
                              {index % 2 === 0 ? 'Review ready' : 'Practice next'}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Seven-day consistency</p>
                      <p className="mt-1 text-[11px] text-slate-500">Small wins compound.</p>
                    </div>
                    <p className="font-mono text-xs text-teal-300">5 / 7 DAYS</p>
                  </div>
                  <div className="mt-4 grid grid-cols-7 items-end gap-2" aria-hidden>
                    {[42, 58, 48, 72, 82, 66, 92].map((height, index) => (
                      <div key={index} className="flex h-16 items-end rounded-md bg-white/5 p-1">
                        <span
                          className="w-full rounded-[3px] bg-gradient-to-t from-blue-600 to-teal-400"
                          style={{ height: `${height}%`, opacity: index > 4 ? 0.35 : 1 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <dl className="mt-12 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/70 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl lg:grid-cols-4">
          {platformStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`flex items-center gap-3 px-4 py-4 sm:px-6 ${
                  index > 0 ? 'border-l border-slate-200/70' : ''
                } ${index >= 2 ? 'border-t lg:border-t-0' : ''}`}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div>
                  <dd className="text-base font-semibold text-slate-900 tabular-nums">
                    {stat.value}
                  </dd>
                  <dt className="text-[11px] text-slate-500">{stat.label}</dt>
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
