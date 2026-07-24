'use client';

import {
  Award,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  Loader2,
  Lock,
  LockOpen,
  RotateCw,
  Search,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireAuth } from '@/features/auth/hooks';
import { formatDate, formatPercent, formatRelative, formatScore, initialsOf } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AccountStatus, User } from '@/types/entities';
import { useStudentDetail, useUpdateAccountStatus, useUsersList } from '../hooks';
import type { UserListParams } from '../api';

const GLASS =
  'rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

const STATUS_TONES: Record<AccountStatus, string> = {
  active: 'border-green-200 bg-green-50 text-green-700',
  blocked: 'border-red-200 bg-red-50 text-red-700',
  suspended: 'border-amber-200 bg-amber-50 text-amber-800',
};

export function StudentsView() {
  const { status: authStatus } = useRequireAuth('admin');
  const authed = authStatus === 'authenticated';

  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [viewingId, setViewingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const params: UserListParams = {
    page,
    limit: 10,
    role: 'student',
    accountStatus: statusFilter === 'all' ? undefined : (statusFilter as AccountStatus),
    search: debouncedSearch || undefined,
  };
  const usersQuery = useUsersList(params, authed);
  const students = usersQuery.data?.items ?? [];
  const meta = usersQuery.data?.meta;

  const statusMutation = useUpdateAccountStatus();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const toggleBlock = (student: User) => {
    setTogglingId(student.id);
    statusMutation.mutate(
      {
        id: student.id,
        accountStatus: student.accountStatus === 'blocked' ? 'active' : 'blocked',
      },
      { onSettled: () => setTogglingId(null) },
    );
  };

  return (
    <AdminShell active="/admin/students">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Students</h1>
          <p className="mt-1 text-sm text-slate-600">
            Every registered student — profiles, exam history, ranks, and account control.
          </p>
        </div>
      </div>

      <div className={`${GLASS} mt-6 flex flex-wrap items-center gap-2.5 p-3`}>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36" aria-label="Filter by account status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative min-w-44 flex-1">
          <Search
            className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by email or student ID…"
            className="pl-8"
            aria-label="Search students"
          />
        </div>
      </div>

      <div className="mt-4">
        {!authed || usersQuery.isPending ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-2xl bg-white/50" />
            ))}
          </div>
        ) : usersQuery.isError ? (
          <div className={`${GLASS} p-10 text-center`}>
            <p className="text-sm text-slate-600">Could not load students.</p>
            <Button
              variant="outline"
              className="mt-4 rounded-lg"
              onClick={() => void usersQuery.refetch()}
            >
              <RotateCw className="size-4" aria-hidden />
              Try again
            </Button>
          </div>
        ) : students.length === 0 ? (
          <div className={`${GLASS} flex flex-col items-center p-12 text-center`}>
            <Users className="size-9 text-slate-300" aria-hidden />
            <h2 className="mt-4 text-base font-semibold text-foreground">No students found</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-600">
              {debouncedSearch || statusFilter !== 'all'
                ? 'Try a different search or status filter.'
                : 'Students appear here as soon as they register.'}
            </p>
          </div>
        ) : (
          <div className={`${GLASS} overflow-hidden`}>
            <ul>
              {students.map((student) => (
                <li
                  key={student.id}
                  className="flex flex-wrap items-center gap-4 border-b border-white/70 px-5 py-3.5 last:border-0"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {initialsOf(student.fullName ?? student.email)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {student.fullName ?? '—'}
                    </p>
                    <p className="truncate text-xs text-slate-500">{student.email}</p>
                  </div>

                  {student.studentId ? (
                    <span className="shrink-0 rounded-md bg-white/80 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                      {student.studentId}
                    </span>
                  ) : null}

                  <span
                    className={cn(
                      'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize',
                      STATUS_TONES[student.accountStatus],
                    )}
                  >
                    {student.accountStatus}
                  </span>

                  <span className="hidden shrink-0 text-xs text-slate-500 sm:block">
                    {student.lastLoginAt
                      ? `Seen ${formatRelative(student.lastLoginAt)}`
                      : `Joined ${formatDate(student.createdAt)}`}
                  </span>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => setViewingId(student.id)}
                    >
                      <Eye className="size-3.5" aria-hidden />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        'rounded-lg',
                        student.accountStatus === 'blocked'
                          ? 'text-green-700 hover:bg-green-50'
                          : 'text-red-600 hover:bg-red-50',
                      )}
                      disabled={statusMutation.isPending && togglingId === student.id}
                      onClick={() => toggleBlock(student)}
                    >
                      {statusMutation.isPending && togglingId === student.id ? (
                        <Loader2 className="size-3.5 animate-spin" aria-hidden />
                      ) : student.accountStatus === 'blocked' ? (
                        <LockOpen className="size-3.5" aria-hidden />
                      ) : (
                        <Lock className="size-3.5" aria-hidden />
                      )}
                      {student.accountStatus === 'blocked' ? 'Unblock' : 'Block'}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            {meta ? (
              <div className="flex items-center justify-between border-t border-white/70 px-5 py-3">
                <p className="text-xs text-slate-500 tabular-nums">
                  Page {meta.page} of {Math.max(1, meta.totalPages)} · {meta.totalItems} student
                  {meta.totalItems === 1 ? '' : 's'}
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="rounded-lg"
                    aria-label="Previous page"
                    disabled={!meta.hasPreviousPage || usersQuery.isFetching}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="rounded-lg"
                    aria-label="Next page"
                    disabled={!meta.hasNextPage || usersQuery.isFetching}
                    onClick={() => setPage((value) => value + 1)}
                  >
                    <ChevronRight className="size-4" aria-hidden />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <StudentDetailDialog
        studentId={viewingId}
        onClose={() => setViewingId(null)}
        onToggleBlock={toggleBlock}
        togglePending={statusMutation.isPending}
      />
    </AdminShell>
  );
}

function StudentDetailDialog({
  studentId,
  onClose,
  onToggleBlock,
  togglePending,
}: {
  studentId: string | null;
  onClose: () => void;
  onToggleBlock: (student: User) => void;
  togglePending: boolean;
}) {
  const detailQuery = useStudentDetail(studentId);
  const detail = detailQuery.data;

  return (
    <Dialog open={studentId !== null} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent className="max-h-[calc(100svh-3rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Student profile</DialogTitle>
          <DialogDescription>
            Account, personal details, and complete exam history.
          </DialogDescription>
        </DialogHeader>

        {detailQuery.isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        ) : detailQuery.isError ? (
          <p className="py-6 text-center text-sm text-slate-600">
            Could not load this student&apos;s details.
          </p>
        ) : detail ? (
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              {detail.profile?.profilePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={detail.profile.profilePhotoUrl}
                  alt={detail.profile.fullName}
                  className="size-14 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  {initialsOf(detail.profile?.fullName ?? detail.account.email)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">
                    {detail.profile?.fullName ?? '—'}
                  </h3>
                  <span
                    className={cn(
                      'rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize',
                      STATUS_TONES[detail.account.accountStatus],
                    )}
                  >
                    {detail.account.accountStatus}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-slate-600">{detail.account.email}</p>
                <p className="mt-0.5 font-mono text-xs text-slate-500">
                  {detail.account.studentId ?? '—'} · joined {formatDate(detail.account.createdAt)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'shrink-0 rounded-lg',
                  detail.account.accountStatus === 'blocked'
                    ? 'text-green-700 hover:bg-green-50'
                    : 'text-red-600 hover:bg-red-50',
                )}
                disabled={togglePending}
                onClick={() => onToggleBlock(detail.account)}
              >
                {detail.account.accountStatus === 'blocked' ? (
                  <LockOpen className="size-3.5" aria-hidden />
                ) : (
                  <Lock className="size-3.5" aria-hidden />
                )}
                {detail.account.accountStatus === 'blocked' ? 'Unblock' : 'Block'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              {[
                { label: 'Phone', value: detail.profile?.phoneNumber },
                { label: 'Age', value: detail.profile?.age },
                { label: 'Class', value: detail.profile?.academicClass },
                { label: 'School', value: detail.profile?.schoolName },
                { label: 'Goal', value: detail.profile?.purpose },
                {
                  label: 'Last login',
                  value: detail.account.lastLoginAt
                    ? formatRelative(detail.account.lastLoginAt)
                    : undefined,
                },
              ].map((field) => (
                <div key={field.label} className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2">
                  <p className="text-[11px] text-slate-500">{field.label}</p>
                  <p className="truncate text-sm text-foreground">{field.value ?? '—'}</p>
                </div>
              ))}
            </div>

            <div>
              <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Award className="size-4 text-primary" aria-hidden />
                Exam performance
              </h4>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {[
                  { label: 'Attended', value: String(detail.examStats.totalAttended) },
                  { label: 'Passed', value: String(detail.examStats.passed) },
                  { label: 'Failed', value: String(detail.examStats.failed) },
                  { label: 'Average', value: formatPercent(detail.examStats.averagePercentage) },
                  { label: 'Best', value: formatPercent(detail.examStats.bestPercentage) },
                  {
                    label: 'Best rank',
                    value: detail.examStats.bestRank !== null ? `#${detail.examStats.bestRank}` : '—',
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-slate-200 bg-white/70 px-2 py-2 text-center"
                  >
                    <p className="text-sm font-semibold text-foreground tabular-nums">
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <ClipboardList className="size-4 text-primary" aria-hidden />
                Exams attended ({detail.attempts.length})
              </h4>
              {detail.attempts.length === 0 ? (
                <p className="mt-2 rounded-xl border border-slate-200 bg-white/70 px-3 py-4 text-center text-xs text-slate-500">
                  No exams attempted yet.
                </p>
              ) : (
                <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-white/80 text-[11px] text-slate-500 uppercase">
                        <th className="px-3 py-2 font-medium">Exam</th>
                        <th className="px-3 py-2 font-medium">Score</th>
                        <th className="px-3 py-2 font-medium">Correct</th>
                        <th className="px-3 py-2 font-medium">%</th>
                        <th className="px-3 py-2 font-medium">Rank</th>
                        <th className="px-3 py-2 font-medium">Result</th>
                        <th className="px-3 py-2 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.attempts.map((attempt) => (
                        <tr
                          key={attempt.attemptId}
                          className="border-b border-slate-100 bg-white/60 last:border-0"
                        >
                          <td className="max-w-44 truncate px-3 py-2 text-foreground">
                            {attempt.examName}
                          </td>
                          <td className="px-3 py-2 tabular-nums">{formatScore(attempt.score)}</td>
                          <td className="px-3 py-2 tabular-nums">
                            {attempt.correct}/{attempt.totalQuestions}
                          </td>
                          <td className="px-3 py-2 tabular-nums">
                            {formatPercent(attempt.percentage)}
                          </td>
                          <td className="px-3 py-2 tabular-nums">
                            {attempt.rank !== undefined ? `#${attempt.rank}` : '—'}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={cn(
                                'rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize',
                                attempt.examResult === 'passed'
                                  ? 'border-green-200 bg-green-50 text-green-700'
                                  : 'border-red-200 bg-red-50 text-red-700',
                              )}
                            >
                              {attempt.examResult}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-xs whitespace-nowrap text-slate-500">
                            {attempt.submittedAt ? formatDate(attempt.submittedAt) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
