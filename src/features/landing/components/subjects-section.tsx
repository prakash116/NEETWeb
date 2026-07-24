'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  Atom,
  BookOpen,
  Calculator,
  FileText,
  FlaskConical,
  Leaf,
  PawPrint,
  type LucideIcon,
} from 'lucide-react';
import { subjectVisual } from '@/lib/labels';
import { useLandingSummary } from '../hooks';
import { Reveal } from './reveal';
import { SectionHeader } from './section-header';

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  PHY: Atom,
  CHE: FlaskConical,
  BOT: Leaf,
  ZOO: PawPrint,
  MTH: Calculator,
};

const FALLBACK_SUBJECTS = [
  {
    id: 'phy',
    code: 'PHY',
    name: 'Physics',
    description: 'Build intuition from mechanics to modern physics with focused reading.',
    icon: undefined as string | undefined,
  },
  {
    id: 'che',
    code: 'CHE',
    name: 'Chemistry',
    description: 'Connect physical, organic, and inorganic concepts chapter by chapter.',
    icon: undefined,
  },
  {
    id: 'bot',
    code: 'BOT',
    name: 'Botany',
    description: 'Trace plant systems, genetics, morphology, and ecology as one story.',
    icon: undefined,
  },
  {
    id: 'zoo',
    code: 'ZOO',
    name: 'Zoology',
    description: 'Understand human physiology, evolution, reproduction, and biodiversity.',
    icon: undefined,
  },
];

function cardSpan(index: number, total: number): string {
  if (total % 2 === 1 && index === total - 1) return 'lg:col-span-12';
  return index % 4 === 0 || index % 4 === 3 ? 'lg:col-span-5' : 'lg:col-span-7';
}

export function SubjectsSection() {
  const summaryQuery = useLandingSummary();
  const summary = summaryQuery.data;
  const subjects =
    summary && summary.subjects.length > 0 ? summary.subjects : FALLBACK_SUBJECTS;
  const topics = summary?.stats.topics ?? 0;

  return (
    <section
      id="subjects"
      className="scroll-mt-28 border-y border-slate-200/70 bg-white/80 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <SectionHeader
              align="left"
              eyebrow="Subject constellation"
              title="Every subject has a path. Follow it chapter by chapter."
              description={
                topics > 0
                  ? `${topics} active topics are arranged into a preparation library that moves from class-level foundations to focused NEET revision.`
                  : 'Move from class-level foundations to focused NEET revision with reading notes and downloadable preparation material.'
              }
            />
          </Reveal>
          <Reveal delay={0.08}>
            <Link
              href="/subjects"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-blue-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Open preparation library
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {subjects.map((subject, index) => {
            const visual = subjectVisual(subject.code);
            const Icon = SUBJECT_ICONS[subject.code.toUpperCase()] ?? BookOpen;
            const hasImage = Boolean(subject.icon && /^https?:\/\//.test(subject.icon));

            return (
              <Reveal
                key={subject.id}
                delay={(index % 4) * 0.06}
                className={cardSpan(index, subjects.length)}
              >
                <Link
                  href="/subjects"
                  className="group relative flex min-h-64 h-full flex-col overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42/0.05)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/8 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none sm:p-6"
                >
                  <div
                    aria-hidden
                    className="absolute -top-16 -right-12 size-48 rounded-full opacity-70 blur-3xl transition-transform duration-500 group-hover:scale-125"
                    style={{ backgroundColor: visual.tint }}
                  />
                  <div className="relative flex items-start justify-between gap-4">
                    {hasImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={subject.icon}
                        alt=""
                        className="size-12 rounded-2xl object-cover shadow-sm"
                      />
                    ) : (
                      <span
                        className="flex size-12 items-center justify-center rounded-2xl shadow-sm"
                        style={{ backgroundColor: visual.tint, color: visual.color }}
                      >
                        <Icon className="size-5" aria-hidden />
                      </span>
                    )}
                    <span className="font-mono text-xs text-slate-400 tabular-nums">
                      ORBIT {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="relative mt-8">
                    <p className="text-[11px] font-semibold tracking-[0.16em] uppercase" style={{ color: visual.color }}>
                      {subject.code}
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                      {subject.name}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                      {subject.description?.trim() ||
                        'Structured topic-wise reading for focused exam preparation.'}
                    </p>
                  </div>

                  <div className="relative mt-auto flex flex-wrap items-center gap-2 pt-7">
                    {['Topic tree', 'Study text', 'PDF notes'].map((label, itemIndex) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/85 px-2.5 py-1 text-[10px] font-medium text-slate-600"
                      >
                        {itemIndex === 2 ? (
                          <FileText className="size-3" aria-hidden />
                        ) : (
                          <span
                            className="size-1.5 rounded-full"
                            style={{ backgroundColor: visual.color }}
                            aria-hidden
                          />
                        )}
                        {label}
                      </span>
                    ))}
                    <span className="ml-auto flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition group-hover:border-transparent group-hover:bg-slate-950 group-hover:text-white">
                      <ArrowUpRight className="size-4" aria-hidden />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        {summaryQuery.isError ? (
          <p className="mt-5 text-center text-xs text-slate-500">
            Showing the core NEET curriculum while live subject data reconnects.
          </p>
        ) : null}
      </div>
    </section>
  );
}
