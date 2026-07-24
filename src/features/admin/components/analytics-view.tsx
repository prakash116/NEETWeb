'use client';

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock3,
  Minus,
  RotateCw,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminShell } from '@/components/layout/admin-shell';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireAuth } from '@/features/auth/hooks';
import { formatDate, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AdminPeriodSummary } from '@/types/entities';
import { useAdminAnalytics } from '../hooks';

const GLASS =
  'rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

const BLUE = '#2563eb';

interface ChartTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload: Record<string, unknown> }>;
  title: (row: Record<string, unknown>) => string;
  body: (row: Record<string, unknown>) => string;
}

function ChartTooltip({ active, payload, title, body }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-xl">
      <p className="font-medium text-foreground">{title(row)}</p>
      <p className="mt-0.5 text-slate-600 tabular-nums">{body(row)}</p>
    </div>
  );
}

function DeltaChip({ current, previous, unit }: { current: number; previous: number; unit: string }) {
  const delta = Math.round((current - previous) * 10) / 10;
  const Icon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums',
        delta > 0
          ? 'border-green-200 bg-green-50 text-green-700'
          : delta < 0
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-slate-200 bg-slate-50 text-slate-600',
      )}
    >
      <Icon className="size-3" aria-hidden />
      {delta > 0 ? '+' : ''}
      {delta}
      {unit} vs previous
    </span>
  );
}

function PeriodTile({
  label,
  summary,
  previous,
}: {
  label: string;
  summary: AdminPeriodSummary;
  previous: AdminPeriodSummary;
}) {
  return (
    <div className={`${GLASS} p-5`}>
      <p className="text-sm text-slate-600">{label}</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <span>
          <span className="text-2xl font-semibold text-foreground tabular-nums">
            {summary.attempts}
          </span>
          <span className="ml-1.5 text-xs text-slate-500">attempts</span>
        </span>
        <span>
          <span className="text-2xl font-semibold text-foreground tabular-nums">
            {formatPercent(summary.averagePercentage)}
          </span>
          <span className="ml-1.5 text-xs text-slate-500">avg score</span>
        </span>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <DeltaChip current={summary.attempts} previous={previous.attempts} unit="" />
        <DeltaChip
          current={summary.averagePercentage}
          previous={previous.averagePercentage}
          unit=" pts"
        />
      </div>
    </div>
  );
}

/** Accuracy below 40% is flagged serious, 40–70% warning, above 70% good. */
function accuracyTone(accuracy: number): { bar: string; text: string } {
  if (accuracy < 40) return { bar: 'bg-red-500', text: 'text-red-700' };
  if (accuracy < 70) return { bar: 'bg-amber-500', text: 'text-amber-700' };
  return { bar: 'bg-green-600', text: 'text-green-700' };
}

export function AnalyticsView() {
  const { status } = useRequireAuth('admin');
  const authed = status === 'authenticated';
  const analyticsQuery = useAdminAnalytics(authed);
  const data = analyticsQuery.data;

  const totalRegistrations30d = data
    ? data.registrations30d.reduce((sum, point) => sum + point.count, 0)
    : 0;
  const peakHour = data
    ? data.attemptsByHour.reduce(
        (peak, point) => (point.attempts > peak.attempts ? point : peak),
        data.attemptsByHour[0],
      )
    : undefined;

  return (
    <AdminShell active="/admin/analytics">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
          <p className="mt-1 text-sm text-slate-600">
            Growth, score distributions, and subject-wise performance across the platform.
          </p>
        </div>
      </div>

      {!authed || analyticsQuery.isPending ? (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl bg-white/50" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-2xl bg-white/50" />
          <Skeleton className="h-80 rounded-2xl bg-white/50" />
        </div>
      ) : analyticsQuery.isError ? (
        <div className={`${GLASS} mt-6 p-10 text-center`}>
          <p className="text-sm text-slate-600">Could not load analytics.</p>
          <Button
            variant="outline"
            className="mt-4 rounded-lg"
            onClick={() => void analyticsQuery.refetch()}
          >
            <RotateCw className="size-4" aria-hidden />
            Try again
          </Button>
        </div>
      ) : data ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <PeriodTile label="Last 7 days" summary={data.last7Days} previous={data.previous7Days} />
            <PeriodTile
              label="Last 30 days"
              summary={data.last30Days}
              previous={data.previous30Days}
            />
          </div>

          <div className="mt-6 grid items-start gap-6 xl:grid-cols-2">
            <section className={`${GLASS} p-6`}>
              <div className="flex items-baseline justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <TrendingUp className="size-4 text-primary" aria-hidden />
                  Student growth
                </h2>
                <p className="text-xs text-slate-500">
                  {totalRegistrations30d} new in 30 days
                </p>
              </div>
              <div className="mt-4 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.registrations30d}
                    margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                    barCategoryGap="24%"
                  >
                    <CartesianGrid strokeDasharray="3 4" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickFormatter={(value: string) => formatDate(value, 'dd MMM')}
                      interval="preserveStartEnd"
                      minTickGap={28}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      width={28}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip
                      content={
                        <ChartTooltip
                          title={(row) => formatDate(String(row.date), 'dd MMM yyyy')}
                          body={(row) =>
                            `${Number(row.count)} registration${Number(row.count) === 1 ? '' : 's'}`
                          }
                        />
                      }
                      cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                    />
                    <Bar
                      dataKey="count"
                      fill={BLUE}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={16}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className={`${GLASS} p-6`}>
              <div className="flex items-baseline justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <BarChart3 className="size-4 text-primary" aria-hidden />
                  Score distribution
                </h2>
                <p className="text-xs text-slate-500">attempts per score band (%)</p>
              </div>
              <div className="mt-4 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.scoreDistribution}
                    margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                    barCategoryGap="20%"
                  >
                    <CartesianGrid strokeDasharray="3 4" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="bucket"
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      width={28}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip
                      content={
                        <ChartTooltip
                          title={(row) => `${String(row.bucket)}%`}
                          body={(row) =>
                            `${Number(row.count)} attempt${Number(row.count) === 1 ? '' : 's'}`
                          }
                        />
                      }
                      cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                    />
                    <Bar
                      dataKey="count"
                      fill={BLUE}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={30}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className={`${GLASS} p-6`}>
              <div className="flex items-baseline justify-between">
                <h2 className="text-base font-semibold text-foreground">Subject performance</h2>
                <p className="text-xs text-slate-500">average score · pass rate</p>
              </div>
              {data.subjectPerformance.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">No attempts recorded yet.</p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {data.subjectPerformance.map((subject) => (
                    <li key={subject.subjectId}>
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-sm font-medium text-foreground">
                          {subject.subjectName}
                        </p>
                        <p className="shrink-0 text-xs text-slate-600 tabular-nums">
                          <span className="font-semibold text-foreground">
                            {formatPercent(subject.averagePercentage)}
                          </span>
                          {' avg · '}
                          {formatPercent(subject.passRate)} pass · {subject.attempts} attempt
                          {subject.attempts === 1 ? '' : 's'}
                        </p>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200/70">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-[width] duration-500"
                          style={{
                            width: `${Math.max(1.5, Math.min(100, subject.averagePercentage))}%`,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={`${GLASS} p-6`}>
              <div className="flex items-baseline justify-between">
                <h2 className="text-base font-semibold text-foreground">Weakest topics</h2>
                <p className="text-xs text-slate-500">lowest answer accuracy first</p>
              </div>
              {data.weakestTopics.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  Topic accuracy appears once students answer questions.
                </p>
              ) : (
                <ul className="mt-4 space-y-4">
                  {data.weakestTopics.map((topic) => {
                    const tone = accuracyTone(topic.accuracy);
                    return (
                      <li key={topic.topicId}>
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="min-w-0 truncate text-sm font-medium text-foreground">
                            {topic.topicName}
                            {topic.subjectName ? (
                              <span className="ml-1.5 text-xs font-normal text-slate-400">
                                {topic.subjectName}
                              </span>
                            ) : null}
                          </p>
                          <p className="shrink-0 text-xs text-slate-600 tabular-nums">
                            <span className={cn('font-semibold', tone.text)}>
                              {formatPercent(topic.accuracy)}
                            </span>
                            {' accuracy · '}
                            {topic.attempted} answered
                          </p>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200/70">
                          <div
                            className={cn(
                              'h-full rounded-full transition-[width] duration-500',
                              tone.bar,
                            )}
                            style={{
                              width: `${Math.max(1.5, Math.min(100, topic.accuracy))}%`,
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          <section className={`${GLASS} mt-6 p-6`}>
            <div className="flex items-baseline justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Clock3 className="size-4 text-primary" aria-hidden />
                When students practice
              </h2>
              <p className="text-xs text-slate-500">
                attempts by hour (IST)
                {peakHour && peakHour.attempts > 0
                  ? ` · peak ${peakHour.hour}:00–${peakHour.hour + 1}:00`
                  : ''}
              </p>
            </div>
            <div className="mt-4 h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.attemptsByHour}
                  margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                  barCategoryGap="18%"
                >
                  <CartesianGrid strokeDasharray="3 4" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    ticks={[0, 4, 8, 12, 16, 20, 23]}
                    tickFormatter={(value: number) => `${value}:00`}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={28}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        title={(row) => `${Number(row.hour)}:00 – ${Number(row.hour) + 1}:00 IST`}
                        body={(row) =>
                          `${Number(row.attempts)} attempt${Number(row.attempts) === 1 ? '' : 's'}`
                        }
                      />
                    }
                    cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }}
                  />
                  <Bar
                    dataKey="attempts"
                    fill={BLUE}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      ) : null}
    </AdminShell>
  );
}
