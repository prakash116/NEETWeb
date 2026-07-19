'use client';

import {
  BarChart3,
  CheckCircle2,
  Circle,
  ClipboardList,
  CreditCard,
  FileQuestion,
  RotateCw,
  ScrollText,
  Search,
  UserCheck,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { AdminShell } from '@/components/layout/admin-shell';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireAuth } from '@/features/auth/hooks';
import { formatPercent, formatRelative } from '@/lib/format';
import { useAdminDashboard, useAdminLogs } from '../hooks';

const GLASS =
  'rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

interface KpiTileProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  tint: string;
}

function KpiTile({ label, value, icon: Icon, color, tint }: KpiTileProps) {
  return (
    <div className={`${GLASS} p-5`}>
      <span
        className="flex size-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: tint, color }}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="mt-3 text-2xl font-semibold text-foreground tabular-nums">{value}</p>
      <p className="mt-0.5 text-sm text-slate-600">{label}</p>
    </div>
  );
}

const COMING_SOON = [
  { label: 'Analytics', icon: BarChart3, blurb: 'Cohorts, funnels, and score distributions.' },
  { label: 'Payments', icon: CreditCard, blurb: 'Plans, invoices, and payment history.' },
  { label: 'Wallet', icon: Wallet, blurb: 'Credits, refunds, and payouts.' },
  { label: 'SEO', icon: Search, blurb: 'Meta tags, sitemaps, and search insights.' },
];

export function AdminDashboardView() {
  const { status } = useRequireAuth('admin');
  const authed = status === 'authenticated';
  const dashboardQuery = useAdminDashboard(authed);
  const logsQuery = useAdminLogs(authed);

  const stats = dashboardQuery.data;
  const logs = logsQuery.data?.items ?? [];
  const loading = !authed || dashboardQuery.isPending;

  const checklist = stats
    ? [
        { label: 'Create your first subject', done: stats.totalSubjects > 0 },
        { label: 'Add topics to the syllabus tree', done: stats.totalTopics > 0 },
        { label: 'Add or import questions', done: stats.totalQuestions > 0 },
        { label: 'Publish an exam', done: stats.totalExams > 0 },
      ]
    : [];
  const setupComplete = checklist.length > 0 && checklist.every((step) => step.done);

  return (
    <AdminShell active="/admin/dashboard">
      {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-9 w-64 rounded-xl bg-white/50" />
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-2xl bg-white/50" />
                ))}
              </div>
              <Skeleton className="h-72 rounded-2xl bg-white/50" />
            </div>
          ) : dashboardQuery.isError ? (
            <div className={`${GLASS} p-10 text-center`}>
              <p className="text-sm text-slate-600">Could not load admin statistics.</p>
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
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Admin overview
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Live platform statistics from the NEET exam system.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
                <KpiTile
                  label="Total students"
                  value={stats.totalStudents}
                  icon={Users}
                  color="#1e40af"
                  tint="#eff6ff"
                />
                <KpiTile
                  label="Active students"
                  value={stats.activeStudents}
                  icon={UserCheck}
                  color="#0f766e"
                  tint="#f0fdfa"
                />
                <KpiTile
                  label="Total exams"
                  value={stats.totalExams}
                  icon={ClipboardList}
                  color="#6d28d9"
                  tint="#f5f3ff"
                />
                <KpiTile
                  label="Total questions"
                  value={stats.totalQuestions}
                  icon={FileQuestion}
                  color="#c2410c"
                  tint="#fff7ed"
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
                {(
                  [
                    ['Subjects', stats.totalSubjects],
                    ['Topics', stats.totalTopics],
                    ["Today's registrations", stats.todaysRegistrations],
                    ["Today's exams", stats.todaysExams],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className={`${GLASS} px-5 py-4`}>
                    <p className="text-xl font-semibold text-foreground tabular-nums">{value}</p>
                    <p className="mt-0.5 text-xs text-slate-600">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1fr_360px]">
                <div className="space-y-6">
                  <section className={`${GLASS} p-6`}>
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-semibold text-foreground">
                        Platform performance
                      </h2>
                    </div>
                    <div className="mt-4 grid gap-6 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-slate-600">Average student score</p>
                        <p className="mt-1 text-3xl font-semibold text-foreground tabular-nums">
                          {formatPercent(stats.averageScore)}
                        </p>
                        <Progress value={Math.min(100, stats.averageScore)} className="mt-3" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Failed students</p>
                        <p
                          className={`mt-1 text-3xl font-semibold tabular-nums ${
                            stats.failedStudents > 0 ? 'text-destructive' : 'text-foreground'
                          }`}
                        >
                          {stats.failedStudents}
                        </p>
                        <p className="mt-3 text-xs text-slate-500">
                          Attempts ended by anti-cheat or below passing marks.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className={`${GLASS} p-6`}>
                    <h2 className="text-base font-semibold text-foreground">Coming soon</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {COMING_SOON.map((module) => {
                        const Icon = module.icon;
                        return (
                          <div
                            key={module.label}
                            className="rounded-xl border border-white/70 bg-white/70 p-4"
                          >
                            <div className="flex items-center justify-between">
                              <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
                                <Icon className="size-4.5" aria-hidden />
                              </span>
                              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                                Soon
                              </span>
                            </div>
                            <p className="mt-3 text-sm font-semibold text-foreground">
                              {module.label}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-600">{module.blurb}</p>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section className={`${GLASS} p-6`}>
                    <h2 className="text-base font-semibold text-foreground">Setup checklist</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {setupComplete
                        ? 'Your platform is ready for students!'
                        : 'Get the platform ready for students.'}
                    </p>
                    <ul className="mt-4 space-y-3">
                      {checklist.map((step) => (
                        <li key={step.label} className="flex items-start gap-2.5 text-sm">
                          {step.done ? (
                            <CheckCircle2
                              className="mt-0.5 size-4.5 shrink-0 text-green-600"
                              aria-hidden
                            />
                          ) : (
                            <Circle
                              className="mt-0.5 size-4.5 shrink-0 text-slate-300"
                              aria-hidden
                            />
                          )}
                          <span className={step.done ? 'text-slate-500 line-through' : 'text-slate-700'}>
                            {step.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 rounded-lg border border-blue-100 bg-blue-50/80 px-3 py-2 text-xs text-blue-800">
                      Subjects &amp; topics are ready to manage — question and exam pages ship
                      next.
                    </p>
                  </section>

                  <section className={`${GLASS} p-6`}>
                    <h2 className="text-base font-semibold text-foreground">Recent activity</h2>
                    {logs.length > 0 ? (
                      <ul className="mt-3 space-y-3">
                        {logs.map((log, index) => (
                          <li key={log._id ?? index} className="text-sm">
                            <p className="font-medium text-foreground">{log.action}</p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {log.module} · {formatRelative(log.createdAt)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="mt-3 flex flex-col items-center py-6 text-center">
                        <ScrollText className="size-7 text-slate-300" aria-hidden />
                        <p className="mt-2 text-sm text-slate-500">
                          No admin activity recorded yet.
                        </p>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            </>
      ) : null}
    </AdminShell>
  );
}
