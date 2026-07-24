'use client';

import {
  Activity,
  CheckCircle2,
  Circle,
  ClipboardList,
  FileQuestion,
  RotateCw,
  ScrollText,
  Trophy,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { AdminShell } from '@/components/layout/admin-shell';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireAuth } from '@/features/auth/hooks';
import { formatPercent, formatRelative, initialsOf } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useAdminDashboard, useAdminLogs } from '../hooks';
import { AttemptsTrendChart } from './attempts-trend-chart';

const GLASS =
  'rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

interface KpiTileProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  tint: string;
  hint?: string;
}

function KpiTile({ label, value, icon: Icon, color, tint, hint }: KpiTileProps) {
  return (
    <div className={`${GLASS} p-5`}>
      <div className="flex items-start justify-between">
        <span
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: tint, color }}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        {hint ? <span className="text-[11px] text-slate-500">{hint}</span> : null}
      </div>
      <p className="mt-3 text-2xl font-semibold text-foreground tabular-nums">{value}</p>
      <p className="mt-0.5 text-sm text-slate-600">{label}</p>
    </div>
  );
}

/** Single-hue horizontal magnitude bar with a text label and value. */
function HBar({
  label,
  sublabel,
  value,
  max,
  valueText,
  dotColor,
}: {
  label: string;
  sublabel?: string;
  value: number;
  max: number;
  valueText: string;
  dotColor?: string;
}) {
  const width = max > 0 ? Math.max(1.5, (value / max) * 100) : 0;
  return (
    <li>
      <div className="flex items-baseline justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground">
          {dotColor ? (
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: dotColor }}
              aria-hidden
            />
          ) : null}
          <span className="truncate">{label}</span>
          {sublabel ? (
            <span className="shrink-0 font-mono text-[11px] font-normal text-slate-400">
              {sublabel}
            </span>
          ) : null}
        </p>
        <p className="shrink-0 text-xs text-slate-600 tabular-nums">{valueText}</p>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200/70">
        {value > 0 ? (
          <div
            className="h-full rounded-full bg-blue-600 transition-[width] duration-500"
            style={{ width: `${Math.min(100, width)}%` }}
          />
        ) : null}
      </div>
    </li>
  );
}

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

  const totalOutcomes = stats ? stats.passedAttempts + stats.failedAttempts : 0;
  const passShare = totalOutcomes > 0 ? (stats!.passedAttempts / totalOutcomes) * 100 : 0;
  const maxExamAttempts = Math.max(1, ...(stats?.examPopularity.map((e) => e.attempts) ?? [1]));
  const maxSubjectAttempts = Math.max(
    1,
    ...(stats?.subjectPopularity.map((s) => s.attempts) ?? [1]),
  );

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
              hint={`+${stats.todaysRegistrations} today`}
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
              hint={`${stats.todaysExams} attempts today`}
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
                ['Subjects', String(stats.totalSubjects)],
                ['Topics', String(stats.totalTopics)],
                ['Attempts (all time)', String(totalOutcomes)],
                ['Average score', formatPercent(stats.averageScore)],
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
                <div className="flex items-baseline justify-between">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <Activity className="size-4 text-primary" aria-hidden />
                    Exam attempts — last 14 days
                  </h2>
                  <p className="text-xs text-slate-500">completed attempts per day</p>
                </div>
                <div className="mt-4">
                  <AttemptsTrendChart data={stats.attemptsTrend} />
                </div>

                <div className="mt-5 border-t border-white/70 pt-4">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-medium text-foreground">Pass / fail split</p>
                    <p className="text-xs text-slate-600 tabular-nums">
                      {totalOutcomes > 0 ? `${Math.round(passShare)}% pass rate` : 'No attempts yet'}
                    </p>
                  </div>
                  <div className="mt-2 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-slate-200/70">
                    {totalOutcomes > 0 ? (
                      <>
                        <div
                          className="h-full rounded-l-full bg-green-600"
                          style={{ width: `${Math.max(1.5, passShare)}%` }}
                        />
                        <div
                          className="h-full rounded-r-full bg-red-500"
                          style={{ width: `${Math.max(1.5, 100 - passShare)}%` }}
                        />
                      </>
                    ) : null}
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-green-600" aria-hidden />
                      Passed {stats.passedAttempts}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-red-500" aria-hidden />
                      Failed {stats.failedAttempts}
                    </span>
                  </div>
                </div>
              </section>

              <section className={`${GLASS} p-6`}>
                <div className="flex items-baseline justify-between">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <Trophy className="size-4 text-primary" aria-hidden />
                    Top students
                  </h2>
                  <p className="text-xs text-slate-500">by average score</p>
                </div>
                {stats.topStudents.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">
                    Rankings appear once students complete exams.
                  </p>
                ) : (
                  <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full min-w-120 text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-white/80 text-[11px] text-slate-500 uppercase">
                          <th className="px-3 py-2 font-medium">#</th>
                          <th className="px-3 py-2 font-medium">Student</th>
                          <th className="px-3 py-2 font-medium">Exams</th>
                          <th className="px-3 py-2 font-medium">Average</th>
                          <th className="px-3 py-2 font-medium">Best</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.topStudents.map((student, index) => (
                          <tr
                            key={student.studentId}
                            className="border-b border-slate-100 bg-white/60 last:border-0"
                          >
                            <td className="px-3 py-2 font-semibold text-slate-500 tabular-nums">
                              {index + 1}
                            </td>
                            <td className="px-3 py-2">
                              <span className="flex items-center gap-2.5">
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                                  {initialsOf(student.fullName)}
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate font-medium text-foreground">
                                    {student.fullName}
                                  </span>
                                  {student.studentCode ? (
                                    <span className="block font-mono text-[11px] text-slate-500">
                                      {student.studentCode}
                                    </span>
                                  ) : null}
                                </span>
                              </span>
                            </td>
                            <td className="px-3 py-2 tabular-nums">{student.examsAttended}</td>
                            <td className="px-3 py-2 font-semibold text-foreground tabular-nums">
                              {formatPercent(student.averagePercentage)}
                            </td>
                            <td className="px-3 py-2 tabular-nums">
                              {formatPercent(student.bestPercentage)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className={`${GLASS} p-6`}>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-base font-semibold text-foreground">Most attempted exams</h2>
                  <p className="text-xs text-slate-500">completed attempts</p>
                </div>
                {stats.examPopularity.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No exam attempts yet.</p>
                ) : (
                  <ul className="mt-4 space-y-3.5">
                    {stats.examPopularity.map((exam) => (
                      <HBar
                        key={exam.examId}
                        label={exam.examName}
                        sublabel={exam.examCode}
                        value={exam.attempts}
                        max={maxExamAttempts}
                        valueText={`${exam.attempts} attempt${exam.attempts === 1 ? '' : 's'} · avg ${formatPercent(exam.averagePercentage)}`}
                      />
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <div className="space-y-6">
              <section className={`${GLASS} p-6`}>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-base font-semibold text-foreground">Subject popularity</h2>
                  <p className="text-xs text-slate-500">attempts</p>
                </div>
                {stats.subjectPopularity.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No attempts recorded yet.</p>
                ) : (
                  <ul className="mt-4 space-y-3.5">
                    {stats.subjectPopularity.map((subject) => (
                      <HBar
                        key={subject.subjectId}
                        label={subject.subjectName}
                        value={subject.attempts}
                        max={maxSubjectAttempts}
                        valueText={String(subject.attempts)}
                      />
                    ))}
                  </ul>
                )}
              </section>

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
                        <Circle className="mt-0.5 size-4.5 shrink-0 text-slate-300" aria-hidden />
                      )}
                      <span
                        className={step.done ? 'text-slate-500 line-through' : 'text-slate-700'}
                      >
                        {step.label}
                      </span>
                    </li>
                  ))}
                </ul>
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
                    <p className="mt-2 text-sm text-slate-500">No admin activity recorded yet.</p>
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
