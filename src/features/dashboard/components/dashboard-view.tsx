'use client';

import Link from 'next/link';
import { CalendarPlus, ClipboardList, Flame, RotateCw, TrendingUp } from 'lucide-react';
import { AppBackground } from '@/components/common/app-background';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireAuth } from '@/features/auth/hooks';
import { formatDate, formatMinutes, formatPercent } from '@/lib/format';
import { EXAM_OUTCOME_META, subjectVisual, type StatusTone } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { ResultSummary, Subject } from '@/types/entities';
import {
  usePublishedExams,
  useRecentResults,
  useStudentDashboard,
  useSubjects,
} from '../hooks';
import { ScoreTrendChart, type TrendPoint } from './score-trend-chart';

const GLASS =
  'rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: 'border-slate-200 bg-slate-100 text-slate-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  success: 'border-green-200 bg-green-50 text-green-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  destructive: 'border-red-200 bg-red-50 text-red-700',
};

function greetingNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function GrowthValue({ value }: { value: number }) {
  const tone = value > 0 ? 'text-green-700' : value < 0 ? 'text-red-700' : 'text-slate-500';
  return (
    <span className={cn('font-medium tabular-nums', tone)}>
      {value > 0 ? '+' : ''}
      {value}%
    </span>
  );
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: React.ReactNode }) {
  return (
    <div className={`${GLASS} p-5`}>
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-foreground tabular-nums">{value}</p>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

interface SubjectResultRow {
  subject: Subject;
  attempts: number;
  average: number | null;
  best: number | null;
}

/**
 * One row of the subject-results mini chart. Bar length encodes the average
 * score (single hue — magnitude, not identity); the subject is identified by
 * its label and the app-wide subject dot, never by bar color.
 */
function SubjectResultBar({ row }: { row: SubjectResultRow }) {
  const visual = subjectVisual(row.subject.code);
  const attempted = row.attempts > 0;
  return (
    <li>
      <div className="flex items-baseline justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: visual.color }}
            aria-hidden
          />
          <span className="truncate">{row.subject.name}</span>
        </p>
        <p className="shrink-0 text-xs text-slate-500 tabular-nums">
          {attempted ? (
            <>
              <span className="text-sm font-semibold text-foreground">{row.average}%</span>
              {' avg · best '}
              {row.best}% · {row.attempts} attempt{row.attempts === 1 ? '' : 's'}
            </>
          ) : (
            'No attempts yet'
          )}
        </p>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200/70"
        role="img"
        aria-label={
          attempted
            ? `${row.subject.name}: average ${row.average}% across ${row.attempts} attempts`
            : `${row.subject.name}: no attempts yet`
        }
      >
        {attempted ? (
          <div
            className="h-full rounded-full bg-blue-600 transition-[width] duration-500"
            style={{ width: `${Math.max(1.5, Math.min(100, row.average ?? 0))}%` }}
          />
        ) : null}
      </div>
    </li>
  );
}

function OutcomeChip({ result }: { result: ResultSummary }) {
  const meta = EXAM_OUTCOME_META[result.examResult] ?? EXAM_OUTCOME_META.pending;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
        TONE_CLASSES[meta.tone],
      )}
    >
      {meta.label}
    </span>
  );
}

export function DashboardView() {
  const { status, user } = useRequireAuth('student');
  const authed = status === 'authenticated';
  const dashboardQuery = useStudentDashboard(authed);
  const resultsQuery = useRecentResults(authed);
  const examsQuery = usePublishedExams(authed);
  const subjectsQuery = useSubjects(authed);

  const stats = dashboardQuery.data;
  const results = resultsQuery.data ?? [];
  const exams = (examsQuery.data?.items ?? []).filter((exam) => exam.status === 'published');
  const subjects = (subjectsQuery.data?.items ?? []).filter(
    (subject) => subject.status === 'active',
  );

  const sortedAsc = [...results].sort(
    (a, b) =>
      new Date(a.submittedAt ?? 0).getTime() - new Date(b.submittedAt ?? 0).getTime(),
  );
  const trend: TrendPoint[] = sortedAsc.map((result, index) => ({
    attempt: index + 1,
    percentage: Math.round(result.percentage * 10) / 10,
    examName: result.examName,
    score: result.score,
    outcome: result.examResult,
    submittedAt: result.submittedAt,
  }));

  const subjectByExam = new Map(exams.map((exam) => [exam.id, exam.subjectId]));
  const subjectRows: SubjectResultRow[] = subjects
    .map((subject) => {
      const own = results.filter((result) => subjectByExam.get(result.examId) === subject.id);
      const average =
        own.length > 0
          ? Math.round((own.reduce((sum, r) => sum + r.percentage, 0) / own.length) * 10) / 10
          : null;
      const best =
        own.length > 0 ? Math.round(Math.max(...own.map((r) => r.percentage)) * 10) / 10 : null;
      return { subject, attempts: own.length, average, best };
    })
    .sort((a, b) => (b.average ?? -1) - (a.average ?? -1));

  const attemptedExamIds = new Set(results.map((result) => result.examId));
  const pendingExams = exams.filter((exam) => !attemptedExamIds.has(exam.id));
  const ranks = results
    .map((result) => result.rank)
    .filter((rank): rank is number => typeof rank === 'number');
  const bestRank = ranks.length ? Math.min(...ranks) : null;
  const answered = (stats?.totalCorrect ?? 0) + (stats?.totalWrong ?? 0);
  const accuracy = stats && answered > 0 ? (stats.totalCorrect / answered) * 100 : null;
  const firstName = user?.fullName.split(' ')[0] ?? 'Student';

  const loading = !authed || dashboardQuery.isPending || resultsQuery.isPending;

  return (
    <div className="relative isolate min-h-svh">
      <AppBackground />
      <AppHeader active="dashboard" />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-72 rounded-xl bg-white/50" />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 rounded-2xl bg-white/50" />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
              <Skeleton className="h-80 rounded-2xl bg-white/50" />
              <Skeleton className="h-80 rounded-2xl bg-white/50" />
            </div>
          </div>
        ) : dashboardQuery.isError ? (
          <div className={`${GLASS} p-10 text-center`}>
            <p className="text-sm text-slate-600">Could not load your dashboard.</p>
            <Button
              variant="outline"
              className="mt-4 rounded-lg border-white/70 bg-white/60 backdrop-blur-xl hover:bg-white/85"
              onClick={() => void dashboardQuery.refetch()}
            >
              <RotateCw className="size-4" aria-hidden />
              Try again
            </Button>
          </div>
        ) : stats ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {greetingNow()}, {firstName}
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Here&apos;s how your preparation is going.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {stats.streak > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/80 px-3 py-1.5 text-sm font-medium text-amber-800 backdrop-blur-xl">
                    <Flame className="size-4" aria-hidden />
                    {stats.streak}-day streak
                  </span>
                ) : null}
                <Button asChild className="rounded-xl">
                  <Link href="/exams">
                    <CalendarPlus className="size-4" aria-hidden />
                    Schedule exam
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatTile label="Exams attended" value={String(stats.totalExams)} />
              <StatTile
                label="Average score"
                value={formatPercent(stats.averageScore)}
                hint={
                  stats.weeklyGrowth !== 0 ? (
                    <span>
                      <GrowthValue value={stats.weeklyGrowth} /> this week
                    </span>
                  ) : undefined
                }
              />
              <StatTile label="Highest score" value={formatPercent(stats.highestScore)} />
              <StatTile
                label="Best rank"
                value={bestRank ? `#${bestRank}` : '—'}
                hint="across your attempts"
              />
            </div>

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
              <div className="space-y-6">
                <section className={`${GLASS} p-6`}>
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-base font-semibold text-foreground">Improvement graph</h2>
                    <p className="text-xs text-slate-500">Score % per attempt</p>
                  </div>
                  {trend.length > 0 ? (
                    <div className="mt-4">
                      <ScoreTrendChart data={trend} />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-12 text-center">
                      <TrendingUp className="size-8 text-slate-300" aria-hidden />
                      <p className="mt-3 text-sm text-slate-600">No exams attempted yet.</p>
                      <Button asChild size="sm" className="mt-4 rounded-lg">
                        <Link href="/exams">Schedule your first exam</Link>
                      </Button>
                    </div>
                  )}
                </section>

                <section className={`${GLASS} p-6`}>
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-base font-semibold text-foreground">Subject results</h2>
                    <p className="text-xs text-slate-500">Average score per subject</p>
                  </div>
                  {results.length > 0 ? (
                    <ul className="mt-4 space-y-3.5">
                      {subjectRows.map((row) => (
                        <SubjectResultBar key={row.subject.id} row={row} />
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      Attempt an exam to see your subject-wise performance.
                    </p>
                  )}
                </section>

                <section className={`${GLASS} p-6`}>
                  <h2 className="text-base font-semibold text-foreground">Recent results</h2>
                  {results.length > 0 ? (
                    <ul className="mt-3">
                      {results.slice(0, 5).map((result) => (
                        <li
                          key={result.attemptId}
                          className="flex items-center justify-between gap-3 border-b border-white/70 py-3 last:border-0 last:pb-0"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {result.examName}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {result.examCode}
                              {result.submittedAt ? ` · ${formatDate(result.submittedAt)}` : ''}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {typeof result.rank === 'number' ? (
                              <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 tabular-nums">
                                #{result.rank}
                              </span>
                            ) : null}
                            <OutcomeChip result={result} />
                            <span className="w-14 text-right text-sm font-semibold text-foreground tabular-nums">
                              {formatPercent(result.percentage)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      Your results will appear here after your first exam.
                    </p>
                  )}
                </section>
              </div>

              <div className="space-y-6">
                <section className={`${GLASS} p-6`}>
                  <h2 className="text-base font-semibold text-foreground">Overall</h2>
                  <dl className="mt-3 space-y-2.5 text-sm">
                    {[
                      ['Accuracy', accuracy != null ? formatPercent(accuracy) : '—'],
                      ['Questions answered', String(stats.totalQuestions)],
                      ['Correct answers', String(stats.totalCorrect)],
                      ['Wrong answers', String(stats.totalWrong)],
                      ['Pending exams', String(pendingExams.length)],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between">
                        <dt className="text-slate-600">{label}</dt>
                        <dd className="font-medium text-foreground tabular-nums">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-4 border-t border-white/70 pt-3">
                    <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                      Growth
                    </p>
                    <dl className="mt-2 space-y-2 text-sm">
                      {(
                        [
                          ['Weekly', stats.weeklyGrowth],
                          ['Monthly', stats.monthlyGrowth],
                          ['Yearly', stats.yearlyGrowth],
                        ] as const
                      ).map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between">
                          <dt className="text-slate-600">{label}</dt>
                          <dd>
                            <GrowthValue value={value} />
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </section>

                <section className={`${GLASS} p-6`}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-foreground">Pending exams</h2>
                    <span className="rounded-full border border-slate-200 bg-white/80 px-2 py-0.5 text-[11px] font-medium text-slate-600 tabular-nums">
                      {pendingExams.length}
                    </span>
                  </div>
                  {exams.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">
                      No exams published yet — check back soon.
                    </p>
                  ) : pendingExams.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">
                      All caught up! You&apos;ve attempted every published exam.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2.5">
                      {pendingExams.slice(0, 4).map((exam) => (
                        <li
                          key={exam.id}
                          className="rounded-xl border border-white/70 bg-white/70 px-3.5 py-3"
                        >
                          <p className="truncate text-sm font-medium text-foreground">
                            {exam.examName}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {exam.examCode} · {exam.totalQuestions} questions ·{' '}
                            {formatMinutes(exam.totalTime)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button
                    asChild
                    variant="outline"
                    className="mt-4 w-full rounded-xl border-white/70 bg-white/60 backdrop-blur-xl hover:bg-white/85"
                  >
                    <Link href="/exams">
                      <ClipboardList className="size-4" aria-hidden />
                      Browse all exams
                    </Link>
                  </Button>
                </section>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
