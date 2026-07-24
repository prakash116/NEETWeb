'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ClipboardList,
  Loader2,
  Play,
  RotateCw,
  Timer,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { AppBackground } from '@/components/common/app-background';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTopicTree } from '@/features/admin/hooks';
import { flattenTopics, type FlatTopic } from '@/features/admin/topic-utils';
import { useRequireAuth } from '@/features/auth/hooks';
import { usePublishedExams, useRecentResults, useSubjects } from '@/features/dashboard/hooks';
import { ApiError } from '@/lib/api-client';
import { formatMinutes, formatPercent } from '@/lib/format';
import { subjectVisual } from '@/lib/labels';
import { queryKeys } from '@/lib/query-keys';
import { cn } from '@/lib/utils';
import type { Exam, Subject } from '@/types/entities';
import { getActiveAttempt, startExam } from '../api';

const GLASS =
  'rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

/** Keep in sync with MAX_ATTEMPTS_PER_EXAM on the server. */
const MAX_ATTEMPTS_PER_EXAM = 3;

export function ExamsView() {
  const { status } = useRequireAuth('student');
  const authed = status === 'authenticated';
  const router = useRouter();
  const queryClient = useQueryClient();

  const examsQuery = usePublishedExams(authed);
  const subjectsQuery = useSubjects(authed);
  const resultsQuery = useRecentResults(authed);

  const activeAttemptQuery = useQuery({
    queryKey: queryKeys.examAttempts.active,
    queryFn: getActiveAttempt,
    enabled: authed,
    retry: false,
    refetchOnWindowFocus: false,
  });
  // getActiveAttempt resolves to null when nothing is in progress, so stale
  // cached attempts never survive a submit (no error-state data retention).
  const activeAttempt =
    activeAttemptQuery.data?.status === 'active' ? activeAttemptQuery.data : undefined;

  const exams = (examsQuery.data?.items ?? []).filter((exam) => exam.status === 'published');
  const subjects = (subjectsQuery.data?.items ?? []).filter(
    (subject) => subject.status === 'active',
  );
  const results = resultsQuery.data ?? [];

  const bestByExam = new Map<string, number>();
  const attemptsByExam = new Map<string, number>();
  for (const result of results) {
    const best = bestByExam.get(result.examId);
    if (best === undefined || result.percentage > best) {
      bestByExam.set(result.examId, result.percentage);
    }
    attemptsByExam.set(result.examId, (attemptsByExam.get(result.examId) ?? 0) + 1);
  }

  // Completed attempts per subject, joined through the published exam list.
  const subjectByExam = new Map(exams.map((exam) => [exam.id, exam.subjectId]));
  const attemptsBySubject = new Map<string, number>();
  for (const result of results) {
    const subjectId = subjectByExam.get(result.examId);
    if (subjectId) {
      attemptsBySubject.set(subjectId, (attemptsBySubject.get(subjectId) ?? 0) + 1);
    }
  }

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId) ?? null;

  const [startingExamId, setStartingExamId] = useState<string | null>(null);
  const startMutation = useMutation({
    mutationFn: (examId: string) => startExam(examId),
    onMutate: (examId) => setStartingExamId(examId),
    onSuccess: (attempt) => {
      queryClient.setQueryData(queryKeys.examAttempts.active, attempt);
      router.push('/exams/attempt');
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        toast.info('You already have an exam in progress — resuming it.');
        router.push('/exams/attempt');
        return;
      }
      toast.error(error instanceof ApiError ? error.message : 'Could not start the exam');
      setStartingExamId(null);
    },
  });

  const loading = !authed || examsQuery.isPending || subjectsQuery.isPending;

  return (
    <div className="relative isolate min-h-svh">
      <AppBackground />
      <AppHeader active="exams" />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {selectedSubject ? selectedSubject.name : 'Exams'}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {selectedSubject
            ? 'Open a topic and start its exam — timed and negative-marked, just like NEET.'
            : 'Pick a subject to see its topics and tests.'}
        </p>

        {activeAttempt ? (
          <div
            className={`${GLASS} mt-6 flex flex-wrap items-center justify-between gap-3 border-amber-200/80 bg-amber-50/80 p-4`}
          >
            <div className="flex items-center gap-3">
              <Timer className="size-5 text-amber-600" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  “{activeAttempt.examName}” is in progress
                </p>
                <p className="text-xs text-amber-700">
                  The timer keeps running until you submit — jump back in.
                </p>
              </div>
            </div>
            <Button className="rounded-xl" onClick={() => router.push('/exams/attempt')}>
              Resume exam
            </Button>
          </div>
        ) : null}

        <div className="mt-6">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-64 rounded-2xl bg-white/50" />
              ))}
            </div>
          ) : examsQuery.isError || subjectsQuery.isError ? (
            <div className={`${GLASS} p-10 text-center`}>
              <p className="text-sm text-slate-600">Could not load exams.</p>
              <Button
                variant="outline"
                className="mt-4 rounded-lg border-white/70 bg-white/60 backdrop-blur-xl hover:bg-white/85"
                onClick={() => {
                  void examsQuery.refetch();
                  void subjectsQuery.refetch();
                }}
              >
                <RotateCw className="size-4" aria-hidden />
                Try again
              </Button>
            </div>
          ) : subjects.length === 0 ? (
            <div className={`${GLASS} flex flex-col items-center p-12 text-center`}>
              <ClipboardList className="size-9 text-slate-300" aria-hidden />
              <h2 className="mt-4 text-base font-semibold text-foreground">Nothing here yet</h2>
              <p className="mt-1 max-w-sm text-sm text-slate-600">
                Subjects and exams appear here the moment they are published. Check back soon.
              </p>
            </div>
          ) : selectedSubject === null ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  examCount={exams.filter((exam) => exam.subjectId === subject.id).length}
                  attemptCount={attemptsBySubject.get(subject.id) ?? 0}
                  onOpen={() => setSelectedSubjectId(subject.id)}
                />
              ))}
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="mb-4 rounded-lg border-white/70 bg-white/60 backdrop-blur-xl hover:bg-white/85"
                onClick={() => setSelectedSubjectId(null)}
              >
                <ArrowLeft className="size-4" aria-hidden />
                All subjects
              </Button>
              <SubjectSyllabus
                subject={selectedSubject}
                exams={exams.filter((exam) => exam.subjectId === selectedSubject.id)}
                bestByExam={bestByExam}
                attemptsByExam={attemptsByExam}
                startingExamId={startMutation.isPending ? startingExamId : null}
                disabled={startMutation.isPending || activeAttempt !== undefined}
                onStart={(examId) => startMutation.mutate(examId)}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function SubjectCard({
  subject,
  examCount,
  attemptCount,
  onOpen,
}: {
  subject: Subject;
  examCount: number;
  attemptCount: number;
  onOpen: () => void;
}) {
  const visual = subjectVisual(subject.code);
  const hasImage = subject.icon !== undefined && /^https?:\/\//.test(subject.icon);

  return (
    <article
      className={`${GLASS} group flex cursor-pointer flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-2xl`}
      onClick={onOpen}
    >
      <div
        className="flex h-32 items-center justify-center"
        style={{ backgroundColor: visual.tint }}
      >
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={subject.icon} alt={subject.name} className="h-full w-full object-cover" />
        ) : (
          <span
            className="flex size-16 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{ backgroundColor: visual.color }}
          >
            <BookOpen className="size-8" aria-hidden />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-base font-semibold text-foreground">{subject.name}</h2>
        {subject.description ? (
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{subject.description}</p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700 tabular-nums">
            {examCount} test{examCount === 1 ? '' : 's'}
          </span>
          <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[11px] font-medium text-teal-700 tabular-nums">
            {attemptCount} attended by you
          </span>
        </div>

        <div className="mt-auto pt-4">
          <Button
            className="w-full rounded-xl"
            onClick={(event) => {
              event.stopPropagation();
              onOpen();
            }}
          >
            Start exam
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  );
}

function SubjectSyllabus({
  subject,
  exams,
  bestByExam,
  attemptsByExam,
  startingExamId,
  disabled,
  onStart,
}: {
  subject: Subject;
  exams: Exam[];
  bestByExam: Map<string, number>;
  attemptsByExam: Map<string, number>;
  startingExamId: string | null;
  disabled: boolean;
  onStart: (examId: string) => void;
}) {
  const visual = subjectVisual(subject.code);
  const treeQuery = useTopicTree(subject.id);
  const topics = flattenTopics(treeQuery.data ?? []);

  // Each exam renders exactly once — under the first topic (in display
  // order) that it covers, even when it spans several topics.
  const examsByTopic = new Map<string, Exam[]>();
  const placed = new Set<string>();
  for (const topic of topics) {
    const list = exams.filter(
      (exam) => !placed.has(exam.id) && exam.topicIds.includes(topic.id),
    );
    if (list.length > 0) {
      for (const exam of list) placed.add(exam.id);
      examsByTopic.set(topic.id, list);
    }
  }
  // Published exams whose topics were deleted or archived still must show.
  const orphanExams = exams.filter((exam) => !placed.has(exam.id));

  return (
    <section className={`${GLASS} overflow-hidden`}>
      <header
        className="flex items-center gap-3 border-b border-white/70 px-5 py-4"
        style={{ backgroundColor: visual.tint }}
      >
        <span className="size-2.5 rounded-full" style={{ backgroundColor: visual.color }} aria-hidden />
        <h2 className="text-base font-semibold text-foreground">{subject.name}</h2>
        <span className="ml-auto text-xs text-slate-600">
          {topics.length} topic{topics.length === 1 ? '' : 's'} · {exams.length} exam
          {exams.length === 1 ? '' : 's'}
        </span>
      </header>

      {treeQuery.isPending ? (
        <div className="space-y-2 p-4">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-10 rounded-xl bg-white/50" />
          ))}
        </div>
      ) : topics.length === 0 && orphanExams.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">No topics in this subject yet.</p>
      ) : (
        <ul>
          {topics.map((topic) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              exams={examsByTopic.get(topic.id) ?? []}
              bestByExam={bestByExam}
              attemptsByExam={attemptsByExam}
              startingExamId={startingExamId}
              disabled={disabled}
              onStart={onStart}
            />
          ))}
          {orphanExams.length > 0 ? (
            <TopicRow
              topic={{ id: 'other', name: 'Other tests', depth: 0, status: 'active' }}
              exams={orphanExams}
              bestByExam={bestByExam}
              attemptsByExam={attemptsByExam}
              startingExamId={startingExamId}
              disabled={disabled}
              onStart={onStart}
            />
          ) : null}
        </ul>
      )}
    </section>
  );
}

function TopicRow({
  topic,
  exams,
  bestByExam,
  attemptsByExam,
  startingExamId,
  disabled,
  onStart,
}: {
  topic: FlatTopic;
  exams: Exam[];
  bestByExam: Map<string, number>;
  attemptsByExam: Map<string, number>;
  startingExamId: string | null;
  disabled: boolean;
  onStart: (examId: string) => void;
}) {
  return (
    <li
      className="border-b border-white/70 py-3 pr-5 last:border-0"
      style={{ paddingLeft: `${1.25 + topic.depth * 1.25}rem` }}
    >
      <div className="flex items-center gap-2">
        <BookOpen className="size-3.5 shrink-0 text-slate-400" aria-hidden />
        <p className="text-sm font-medium text-foreground">{topic.name}</p>
        {exams.length === 0 ? (
          <span className="ml-auto text-[11px] text-slate-400">No exam yet</span>
        ) : null}
      </div>

      {exams.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {exams.map((exam) => {
            const best = bestByExam.get(exam.id);
            const used = attemptsByExam.get(exam.id) ?? 0;
            const limitReached = used >= MAX_ATTEMPTS_PER_EXAM;
            const starting = startingExamId === exam.id;
            return (
              <li
                key={exam.id}
                className="ml-5 flex flex-wrap items-center gap-3 rounded-xl border border-white/70 bg-white/60 px-3.5 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{exam.examName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {exam.totalQuestions} questions · {formatMinutes(exam.totalTime)} · +
                    {exam.marksPerQuestion} / −{exam.negativeMarks} · pass ≥ {exam.passingMarks}
                  </p>
                </div>

                {best !== undefined ? (
                  <span
                    className={cn(
                      'shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
                      'border-green-200 bg-green-50 text-green-700',
                    )}
                  >
                    Best {formatPercent(best)}
                  </span>
                ) : null}

                <span
                  className={cn(
                    'shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tabular-nums',
                    limitReached
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-slate-200 bg-slate-50 text-slate-600',
                  )}
                >
                  {used}/{MAX_ATTEMPTS_PER_EXAM} attempts
                </span>

                <Button
                  size="sm"
                  className="shrink-0 rounded-lg"
                  disabled={disabled || limitReached}
                  onClick={() => onStart(exam.id)}
                >
                  {starting ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Play className="size-4" aria-hidden />
                  )}
                  {limitReached ? 'Limit reached' : best !== undefined ? 'Retake' : 'Start exam'}
                </Button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </li>
  );
}
