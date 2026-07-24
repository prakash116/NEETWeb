import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { Reveal } from './reveal';
import { SectionHeader } from './section-header';

interface GrowthStage {
  number: string;
  title: string;
  description: string;
  outcome: string;
  icon: LucideIcon;
  accent: string;
  tint: string;
}

interface WeeklyPlanItem {
  days: string;
  label: string;
  detail: string;
  color: string;
}

const GROWTH_STAGES: GrowthStage[] = [
  {
    number: '01',
    title: 'Study',
    description: 'Build one concept at a time with structured topic notes and preparation PDFs.',
    outcome: 'Understand the idea',
    icon: BookOpenCheck,
    accent: '#2563eb',
    tint: '#eff6ff',
  },
  {
    number: '02',
    title: 'Practice',
    description: 'Turn understanding into recall through focused questions and timed exam conditions.',
    outcome: 'Apply it under pressure',
    icon: Target,
    accent: '#ea580c',
    tint: '#fff7ed',
  },
  {
    number: '03',
    title: 'Diagnose',
    description: 'Review accuracy, skipped questions, timing, and topic-level performance after each attempt.',
    outcome: 'Find the real gap',
    icon: BarChart3,
    accent: '#7c3aed',
    tint: '#f5f3ff',
  },
  {
    number: '04',
    title: 'Improve',
    description: 'Return to weak topics with a smaller, clearer target and measure the change next time.',
    outcome: 'Close the gap',
    icon: Sparkles,
    accent: '#0d9488',
    tint: '#f0fdfa',
  },
];

const WEEKLY_PLAN: WeeklyPlanItem[] = [
  {
    days: 'Mon–Tue',
    label: 'Study',
    detail: 'Choose one topic cluster and build clear notes.',
    color: '#2563eb',
  },
  {
    days: 'Wed–Thu',
    label: 'Practice',
    detail: 'Solve focused questions, then add timed sets.',
    color: '#ea580c',
  },
  {
    days: 'Friday',
    label: 'Diagnose',
    detail: 'Review errors, time spent, and skipped concepts.',
    color: '#7c3aed',
  },
  {
    days: 'Saturday',
    label: 'Improve',
    detail: 'Revisit the weakest topic and test it again.',
    color: '#0d9488',
  },
  {
    days: 'Sunday',
    label: 'Reset',
    detail: 'Record progress and choose the next focused goal.',
    color: '#475569',
  },
];

export function GrowthStrategySection() {
  return (
    <section
      id="strategy"
      aria-labelledby="growth-strategy-title"
      className="scroll-mt-28 bg-slate-50/75 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <div id="growth-strategy-title">
            <SectionHeader
              eyebrow="Student growth strategy"
              title="A preparation loop that gets sharper every week"
              description="Progress is easier to repeat when every study session has a purpose. Move through four clear stages, then begin again with better information."
            />
          </div>
        </Reveal>

        <ol className="relative mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {GROWTH_STAGES.map((stage, index) => {
            const Icon = stage.icon;

            return (
              <li key={stage.title} className="relative">
                <Reveal delay={index * 0.08} className="h-full">
                  <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_32px_rgb(15_23_42/0.06)]">
                    <div
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-1"
                      style={{ backgroundColor: stage.accent }}
                    />
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className="flex size-11 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: stage.tint, color: stage.accent }}
                      >
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <span className="font-mono text-xs font-semibold tracking-[0.18em] text-slate-400">
                        {stage.number}
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
                      {stage.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {stage.description}
                    </p>
                    <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <CheckCircle2
                        className="size-4"
                        style={{ color: stage.accent }}
                        aria-hidden
                      />
                      {stage.outcome}
                    </p>
                  </div>
                  {index < GROWTH_STAGES.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute top-1/2 -right-3 z-10 hidden size-6 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm lg:flex"
                    >
                      <ArrowRight className="size-3.5" />
                    </span>
                  ) : null}
                </Reveal>
              </li>
            );
          })}
        </ol>

        <Reveal delay={0.12}>
          <div className="mt-8 grid overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_18px_50px_rgb(15_23_42/0.07)] lg:grid-cols-[0.78fr_1.22fr]">
            <div className="relative overflow-hidden bg-slate-950 px-6 py-8 text-white sm:px-8">
              <div
                aria-hidden
                className="absolute -top-24 -right-20 size-64 rounded-full bg-blue-500/25 blur-3xl"
              />
              <div
                aria-hidden
                className="absolute -bottom-24 -left-20 size-64 rounded-full bg-teal-400/20 blur-3xl"
              />
              <div className="relative">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                  <CalendarDays className="size-5 text-blue-200" aria-hidden />
                </span>
                <p className="mt-6 text-xs font-semibold tracking-[0.2em] text-blue-200 uppercase">
                  The seven-day rhythm
                </p>
                <h3 className="mt-2 max-w-sm text-2xl font-semibold tracking-tight text-balance">
                  Turn the growth loop into a realistic weekly plan
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">
                  Keep the goal small enough to finish and clear enough to measure. The next week
                  starts from what this week taught you.
                </p>
                <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200">
                  <RefreshCw className="size-3.5 text-teal-300" aria-hidden />
                  Repeat with a better target
                </div>
              </div>
            </div>

            <ol className="divide-y divide-slate-100 px-5 py-3 sm:px-7">
              {WEEKLY_PLAN.map((item, index) => (
                <li key={item.days} className="grid grid-cols-[5rem_1fr] gap-3 py-4 sm:grid-cols-[6rem_7rem_1fr]">
                  <span className="font-mono text-xs font-semibold text-slate-500 tabular-nums">
                    {item.days}
                  </span>
                  <span className="hidden items-center gap-2 text-sm font-semibold text-foreground sm:flex">
                    <span
                      aria-hidden
                      className="size-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </span>
                  <span className="text-sm leading-relaxed text-slate-600">
                    <span className="mb-1 flex items-center gap-2 font-semibold text-foreground sm:hidden">
                      <span
                        aria-hidden
                        className="size-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </span>
                    {item.detail}
                  </span>
                  {index === WEEKLY_PLAN.length - 1 ? null : (
                    <span className="sr-only">Then</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
