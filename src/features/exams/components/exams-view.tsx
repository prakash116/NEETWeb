'use client';

import { ClipboardList, RotateCw } from 'lucide-react';
import { AppBackground } from '@/components/common/app-background';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireAuth } from '@/features/auth/hooks';
import { usePublishedExams, useRecentResults, useSubjects } from '@/features/dashboard/hooks';
import { formatMinutes, formatPercent } from '@/lib/format';
import { subjectVisual } from '@/lib/labels';

const GLASS =
  'rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

export function ExamsView() {
  const { status } = useRequireAuth('student');
  const authed = status === 'authenticated';
  const examsQuery = usePublishedExams(authed);
  const subjectsQuery = useSubjects(authed);
  const resultsQuery = useRecentResults(authed);

  const exams = (examsQuery.data?.items ?? []).filter((exam) => exam.status === 'published');
  const subjectsById = new Map((subjectsQuery.data?.items ?? []).map((s) => [s.id, s]));

  const bestByExam = new Map<string, number>();
  for (const result of resultsQuery.data?.items ?? []) {
    const best = bestByExam.get(result.examId);
    if (best === undefined || result.percentage > best) {
      bestByExam.set(result.examId, result.percentage);
    }
  }

  const loading = !authed || examsQuery.isPending;

  return (
    <div className="relative isolate min-h-svh">
      <AppBackground />
      <AppHeader active="exams" />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Exams</h1>
        <p className="mt-1 text-sm text-slate-600">
          Schedule your next test — every attempt is timed and negative-marked, just like NEET.
        </p>

        <div className="mt-6">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-56 rounded-2xl bg-white/50" />
              ))}
            </div>
          ) : examsQuery.isError ? (
            <div className={`${GLASS} p-10 text-center`}>
              <p className="text-sm text-slate-600">Could not load exams.</p>
              <Button
                variant="outline"
                className="mt-4 rounded-lg border-white/70 bg-white/60 backdrop-blur-xl hover:bg-white/85"
                onClick={() => void examsQuery.refetch()}
              >
                <RotateCw className="size-4" aria-hidden />
                Try again
              </Button>
            </div>
          ) : exams.length === 0 ? (
            <div className={`${GLASS} flex flex-col items-center p-12 text-center`}>
              <ClipboardList className="size-9 text-slate-300" aria-hidden />
              <h2 className="mt-4 text-base font-semibold text-foreground">
                No exams published yet
              </h2>
              <p className="mt-1 max-w-sm text-sm text-slate-600">
                New tests appear here the moment they are published. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {exams.map((exam) => {
                const subject = subjectsById.get(exam.subjectId);
                const visual = subjectVisual(subject?.code);
                const best = bestByExam.get(exam.id);
                return (
                  <article key={exam.id} className={`${GLASS} flex flex-col p-5`}>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/70 px-2.5 py-1 text-xs font-medium text-slate-700"
                        style={{ backgroundColor: visual.tint }}
                      >
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: visual.color }}
                          aria-hidden
                        />
                        {subject?.name ?? 'Subject'}
                      </span>
                      <span className="rounded-md bg-white/80 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                        {exam.examCode}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-semibold text-foreground">
                      {exam.examName}
                    </h3>

                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                      <li>
                        {exam.totalQuestions} questions · {formatMinutes(exam.totalTime)}
                      </li>
                      <li>
                        +{exam.marksPerQuestion} / −{exam.negativeMarks} per question
                      </li>
                      <li>Pass ≥ {exam.passingMarks} marks</li>
                    </ul>

                    <div className="mt-auto pt-4">
                      {best !== undefined ? (
                        <span className="inline-flex w-full items-center justify-center rounded-xl border border-green-200 bg-green-50/80 px-3 py-2 text-sm font-medium text-green-700">
                          Completed · {formatPercent(best)}
                        </span>
                      ) : (
                        <>
                          <Button disabled className="w-full rounded-xl">
                            Start exam
                          </Button>
                          <p className="mt-1.5 text-center text-[11px] text-slate-500">
                            The exam runner ships in the next module.
                          </p>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
