'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Eraser,
  Loader2,
  Send,
  Timer,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AppBackground } from '@/components/common/app-background';
import { AppHeader } from '@/components/layout/app-header';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireAuth } from '@/features/auth/hooks';
import { ApiError } from '@/lib/api-client';
import { formatScore } from '@/lib/format';
import { queryKeys } from '@/lib/query-keys';
import { cn } from '@/lib/utils';
import type { AnswerOption, AttemptSubmitResult, ExamAttempt } from '@/types/entities';
import { autosaveAnswer, getActiveAttempt, recordExamEvent, submitAttempt } from '../api';

const GLASS =
  'rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

interface DraftAnswer {
  selected: AnswerOption | null;
  version: number;
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function ExamRunnerView() {
  const { status } = useRequireAuth('student');
  const authed = status === 'authenticated';
  const router = useRouter();
  const queryClient = useQueryClient();

  const [result, setResult] = useState<AttemptSubmitResult | null>(null);

  const attemptQuery = useQuery({
    queryKey: queryKeys.examAttempts.active,
    queryFn: getActiveAttempt,
    enabled: authed && result === null,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
  const attempt = attemptQuery.data ?? undefined;

  const noActiveAttempt = attemptQuery.isSuccess && attemptQuery.data === null;

  useEffect(() => {
    if (noActiveAttempt && result === null) router.replace('/exams');
  }, [noActiveAttempt, result, router]);

  return (
    <div className="relative isolate min-h-svh">
      <AppBackground />
      <AppHeader active="exams" />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {result !== null ? (
          <ResultCard result={result} />
        ) : !authed || attemptQuery.isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-16 rounded-2xl bg-white/50" />
            <Skeleton className="h-72 rounded-2xl bg-white/50" />
          </div>
        ) : attempt && attempt.status === 'active' ? (
          <Runner attempt={attempt} onFinished={setResult} />
        ) : (
          <div className={`${GLASS} flex flex-col items-center p-12 text-center`}>
            <ClipboardList className="size-9 text-slate-300" aria-hidden />
            <h2 className="mt-4 text-base font-semibold text-foreground">No exam in progress</h2>
            <p className="mt-1 text-sm text-slate-600">Pick a topic on the Exams page to start.</p>
            <Button className="mt-5 rounded-xl" onClick={() => router.replace('/exams')}>
              Browse exams
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

function Runner({
  attempt,
  onFinished,
}: {
  attempt: ExamAttempt;
  onFinished: (result: AttemptSubmitResult) => void;
}) {
  const queryClient = useQueryClient();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, DraftAnswer>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    Math.floor((new Date(attempt.expiresAt).getTime() - Date.now()) / 1000),
  );
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  /** Cumulative seconds per question; the interval below feeds it. */
  const timeSpentRef = useRef<Record<string, number>>({});
  const currentIndexRef = useRef(0);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);
  const finishingRef = useRef(false);

  const question = attempt.questions[currentIndex];
  const answered = Object.values(answers).filter((a) => a.selected !== null).length;

  const finish = useCallback(
    (result: AttemptSubmitResult) => {
      if (finishingRef.current) return;
      finishingRef.current = true;
      // Clear the cached attempt immediately so the Exams page never shows a
      // stale "Resume exam" banner for an already-submitted attempt.
      queryClient.setQueryData(queryKeys.examAttempts.active, null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.results.root });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.student });
      onFinished(result);
    },
    [onFinished, queryClient],
  );

  const submitMutation = useMutation({
    mutationFn: () => submitAttempt(attempt.id),
    onSuccess: finish,
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not submit the exam');
    },
  });
  const submitRef = useRef(submitMutation.mutate);
  useEffect(() => {
    submitRef.current = submitMutation.mutate;
  }, [submitMutation.mutate]);

  // One ticking interval: countdown + per-question time tracking + auto-submit.
  useEffect(() => {
    const timer = setInterval(() => {
      const q = attempt.questions[currentIndexRef.current];
      if (q) timeSpentRef.current[q.id] = (timeSpentRef.current[q.id] ?? 0) + 1;

      const left = Math.floor((new Date(attempt.expiresAt).getTime() - Date.now()) / 1000);
      setRemainingSeconds(left);
      if (left <= 0) {
        clearInterval(timer);
        toast.info('Time is up — submitting your exam.');
        submitRef.current();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [attempt]);

  // Tab-switch detection: the 4th switch fails the exam server-side.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'hidden' || finishingRef.current) return;
      recordExamEvent(attempt.id, {
        type: 'tab_switch',
        clientEventId:
          typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `tab:${Date.now()}:${Math.random()}`,
      })
        .then((ack) => {
          if (ack.failed) {
            toast.error('Tab-switch limit exceeded — the exam has been failed.');
            submitRef.current();
          } else if (ack.recorded) {
            toast.warning(
              `Tab switch recorded. ${ack.warningsRemaining} warning${
                ack.warningsRemaining === 1 ? '' : 's'
              } left before the exam fails.`,
            );
          }
        })
        .catch(() => undefined);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [attempt.id]);

  const saveMutation = useMutation({
    mutationFn: (input: { questionId: string; selected: AnswerOption | null; version: number }) =>
      autosaveAnswer(attempt.id, {
        questionId: input.questionId,
        selectedAnswer: input.selected,
        timeTaken: Math.min(3600, timeSpentRef.current[input.questionId] ?? 0),
        version: input.version,
      }),
    onError: (error) => {
      if (error instanceof ApiError && error.status === 400) {
        // ATTEMPT_EXPIRED / ATTEMPT_CLOSED — fetch the final result.
        submitRef.current();
        return;
      }
      toast.error('Could not save the answer — check your connection.');
    },
  });

  const selectAnswer = (selected: AnswerOption | null) => {
    if (!question || finishingRef.current) return;
    const previous = answers[question.id];
    if ((previous?.selected ?? null) === selected) return;
    const version = (previous?.version ?? 0) + 1;
    setAnswers((state) => ({ ...state, [question.id]: { selected, version } }));
    saveMutation.mutate({ questionId: question.id, selected, version });
  };

  const lowTime = remainingSeconds <= 60;

  return (
    <>
      <div className={`${GLASS} flex flex-wrap items-center gap-3 p-4`}>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold text-foreground">{attempt.examName}</h1>
          <p className="text-xs text-slate-500">
            {attempt.examCode} · {answered}/{attempt.totalQuestions} answered
          </p>
        </div>
        <span
          className={cn(
            'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-sm font-semibold tabular-nums',
            lowTime
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-white/70 bg-white/80 text-foreground',
          )}
        >
          <Timer className="size-4" aria-hidden />
          {formatClock(remainingSeconds)}
        </span>
        <Button
          className="rounded-xl"
          disabled={submitMutation.isPending}
          onClick={() => setConfirmSubmit(true)}
        >
          {submitMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Send className="size-4" aria-hidden />
          )}
          Submit exam
        </Button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_240px]">
        <div className={`${GLASS} p-5`}>
          {question ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-500">
                  Question {currentIndex + 1} of {attempt.totalQuestions}
                </p>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 capitalize">
                  {question.difficulty}
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-foreground">{question.question}</p>
              {question.image ? (
                <img
                  src={question.image.url}
                  alt={question.image.altText ?? 'Question illustration'}
                  className="mt-3 max-h-72 rounded-xl border border-white/70"
                />
              ) : null}

              <div className="mt-5 space-y-2">
                {question.options.map((option) => {
                  const selected = answers[question.id]?.selected === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => selectAnswer(option.key)}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition',
                        selected
                          ? 'border-primary bg-primary/10 font-medium text-foreground'
                          : 'border-white/70 bg-white/60 text-slate-700 hover:bg-white/85',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-semibold',
                          selected
                            ? 'border-primary bg-primary text-white'
                            : 'border-slate-300 bg-white text-slate-600',
                        )}
                      >
                        {option.key}
                      </span>
                      <span>
                        {option.text}
                        {option.image ? (
                          <img
                            src={option.image.url}
                            alt={option.image.altText ?? `Option ${option.key}`}
                            className="mt-2 max-h-40 rounded-lg border border-white/70"
                          />
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  className="rounded-lg"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500"
                  disabled={(answers[question.id]?.selected ?? null) === null}
                  onClick={() => selectAnswer(null)}
                >
                  <Eraser className="size-3.5" aria-hidden />
                  Clear answer
                </Button>
                <Button
                  variant="outline"
                  className="rounded-lg"
                  disabled={currentIndex >= attempt.totalQuestions - 1}
                  onClick={() =>
                    setCurrentIndex((index) => Math.min(attempt.totalQuestions - 1, index + 1))
                  }
                >
                  Next
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </div>
            </>
          ) : null}
        </div>

        <aside className={`${GLASS} h-fit p-4`}>
          <p className="text-xs font-medium text-slate-500">Questions</p>
          <div className="mt-3 grid grid-cols-5 gap-1.5">
            {attempt.questions.map((q, index) => {
              const isAnswered = (answers[q.id]?.selected ?? null) !== null;
              const isCurrent = index === currentIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  aria-label={`Go to question ${index + 1}`}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    'flex size-9 items-center justify-center rounded-lg border text-xs font-semibold tabular-nums transition',
                    isCurrent
                      ? 'border-primary ring-2 ring-primary/40'
                      : 'border-white/70 hover:bg-white/85',
                    isAnswered
                      ? 'bg-green-100 text-green-800'
                      : 'bg-white/60 text-slate-600',
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 p-2.5">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" aria-hidden />
            <p className="text-[11px] leading-relaxed text-amber-800">
              Switching tabs is recorded. After 3 warnings the exam fails automatically.
            </p>
          </div>

          {attempt.instructions ? (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-medium text-slate-500">
                Instructions
              </summary>
              <p className="mt-1.5 text-[11px] leading-relaxed whitespace-pre-line text-slate-600">
                {attempt.instructions}
              </p>
            </details>
          ) : null}
        </aside>
      </div>

      <AlertDialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit this exam?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answered} of {attempt.totalQuestions} questions. Unanswered
              questions are counted as skipped. You cannot change answers after submitting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => setConfirmSubmit(false)}
            >
              Keep answering
            </Button>
            <Button
              className="rounded-lg"
              disabled={submitMutation.isPending}
              onClick={() => {
                setConfirmSubmit(false);
                submitMutation.mutate();
              }}
            >
              Submit now
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ResultCard({ result }: { result: AttemptSubmitResult }) {
  const router = useRouter();
  const passed = result.examResult === 'passed';

  return (
    <div className={`${GLASS} mx-auto max-w-2xl p-8 text-center`}>
      {passed ? (
        <CheckCircle2 className="mx-auto size-12 text-green-500" aria-hidden />
      ) : (
        <XCircle className="mx-auto size-12 text-red-400" aria-hidden />
      )}
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
        {passed ? 'Exam passed!' : 'Exam not cleared'}
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Score {formatScore(result.score)} · {result.percentage.toFixed(1)}%
        {result.autoSubmitted ? ' · auto-submitted when time ran out' : ''}
      </p>
      {result.failReason ? (
        <p className="mt-2 rounded-xl border border-red-200 bg-red-50/80 px-3 py-2 text-xs text-red-700">
          {result.failReason}
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Correct', value: result.correct, tone: 'text-green-700' },
          { label: 'Wrong', value: result.wrong, tone: 'text-red-700' },
          { label: 'Skipped', value: result.skipped, tone: 'text-slate-700' },
          { label: 'Attempted', value: result.attempted, tone: 'text-slate-700' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/70 bg-white/70 px-3 py-3"
          >
            <p className={`text-xl font-semibold tabular-nums ${stat.tone}`}>{stat.value}</p>
            <p className="text-[11px] text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-7 flex justify-center gap-2">
        <Button variant="outline" className="rounded-xl" onClick={() => router.push('/dashboard')}>
          View dashboard
        </Button>
        <Button className="rounded-xl" onClick={() => router.push('/exams')}>
          Back to exams
        </Button>
      </div>
    </div>
  );
}
