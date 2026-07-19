'use client';

import {
  Archive,
  ArchiveRestore,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  FileUp,
  Loader2,
  Pencil,
  Plus,
  RotateCw,
  Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
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
import { useSubjects } from '@/features/dashboard/hooks';
import type { QuestionListParams } from '@/features/questions/api';
import { DIFFICULTY_META } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { Question, QuestionDifficulty, QuestionStatus } from '@/types/entities';
import {
  useArchiveQuestion,
  useQuestionsList,
  useTopicTree,
  useUpdateQuestion,
} from '../hooks';
import { flattenTopics, topicIndentLabel } from '../topic-utils';
import { QuestionDialog } from './question-dialog';
import { QuestionImportDialog } from './question-import-dialog';

const GLASS =
  'rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

const DIFFICULTY_TONES: Record<QuestionDifficulty, string> = {
  easy: 'border-green-200 bg-green-50 text-green-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-800',
  hard: 'border-red-200 bg-red-50 text-red-700',
};

const STATUS_TONES: Record<QuestionStatus, string> = {
  active: 'border-green-200 bg-green-50 text-green-700',
  inactive: 'border-slate-300 bg-slate-100 text-slate-600',
  archived: 'border-slate-300 bg-slate-100 text-slate-600',
};

export function QuestionsView() {
  const { status: authStatus } = useRequireAuth('admin');
  const authed = authStatus === 'authenticated';

  const subjectsQuery = useSubjects(authed);
  const subjects = subjectsQuery.data?.items ?? [];
  const [pickedSubjectId, setPickedSubjectId] = useState<string | null>(null);
  const subjectId = pickedSubjectId ?? subjects.find((s) => s.status === 'active')?.id ?? '';

  const [topicFilter, setTopicFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const treeQuery = useTopicTree(authed && subjectId ? subjectId : null);
  const flatTopics = flattenTopics(treeQuery.data ?? []);
  const topicNames = new Map(flatTopics.map((topic) => [topic.id, topic.name]));

  const params: QuestionListParams = {
    page,
    limit: 10,
    subjectId: subjectId || undefined,
    topicId: topicFilter === 'all' ? undefined : topicFilter,
    difficulty: difficultyFilter === 'all' ? undefined : (difficultyFilter as QuestionDifficulty),
    status: statusFilter === 'all' ? undefined : (statusFilter as QuestionStatus),
    search: debouncedSearch || undefined,
  };
  const questionsQuery = useQuestionsList(params, authed && subjectId !== '');
  const questions = questionsQuery.data?.items ?? [];
  const meta = questionsQuery.data?.meta;

  const archiveMutation = useArchiveQuestion();
  const updateMutation = useUpdateQuestion();

  const [questionDialog, setQuestionDialog] = useState<{ open: boolean; editing: Question | null }>(
    { open: false, editing: null },
  );
  const [importOpen, setImportOpen] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState<Question | null>(null);

  const resetPage = () => setPage(1);

  return (
    <AdminShell active="/admin/questions">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Questions</h1>
          <p className="mt-1 text-sm text-slate-600">
            The MCQ bank behind your exams, organized topic-wise.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl border-white/70 bg-white/60 backdrop-blur-xl hover:bg-white/85"
            onClick={() => setImportOpen(true)}
          >
            <FileUp className="size-4" aria-hidden />
            Import CSV
          </Button>
          <Button
            className="rounded-xl"
            onClick={() => setQuestionDialog({ open: true, editing: null })}
          >
            <Plus className="size-4" aria-hidden />
            New question
          </Button>
        </div>
      </div>

      <div className={`${GLASS} mt-6 flex flex-wrap items-center gap-2.5 p-3`}>
        <Select
          value={subjectId || undefined}
          onValueChange={(value) => {
            setPickedSubjectId(value);
            setTopicFilter('all');
            resetPage();
          }}
        >
          <SelectTrigger className="w-40" aria-label="Filter by subject">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={topicFilter}
          onValueChange={(value) => {
            setTopicFilter(value);
            resetPage();
          }}
        >
          <SelectTrigger className="w-52" aria-label="Filter by topic">
            <SelectValue placeholder="Topic" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">All topics</SelectItem>
            {flatTopics.map((topic) => (
              <SelectItem key={topic.id} value={topic.id}>
                <span className="whitespace-pre">{topicIndentLabel(topic)}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={difficultyFilter}
          onValueChange={(value) => {
            setDifficultyFilter(value);
            resetPage();
          }}
        >
          <SelectTrigger className="w-32" aria-label="Filter by difficulty">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            resetPage();
          }}
        >
          <SelectTrigger className="w-32" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
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
              resetPage();
            }}
            placeholder="Search question text…"
            className="pl-8"
            aria-label="Search questions"
          />
        </div>
      </div>

      <div className="mt-4">
        {!authed || subjectsQuery.isPending || (subjectId && questionsQuery.isPending) ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-2xl bg-white/50" />
            ))}
          </div>
        ) : questionsQuery.isError ? (
          <div className={`${GLASS} p-10 text-center`}>
            <p className="text-sm text-slate-600">Could not load questions.</p>
            <Button
              variant="outline"
              className="mt-4 rounded-lg"
              onClick={() => void questionsQuery.refetch()}
            >
              <RotateCw className="size-4" aria-hidden />
              Try again
            </Button>
          </div>
        ) : questions.length === 0 ? (
          <div className={`${GLASS} flex flex-col items-center p-12 text-center`}>
            <FileQuestion className="size-9 text-slate-300" aria-hidden />
            <h2 className="mt-4 text-base font-semibold text-foreground">No questions found</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-600">
              Create questions one by one, or import a whole set from CSV — topic-wise.
            </p>
            <div className="mt-5 flex gap-2">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setImportOpen(true)}
              >
                <FileUp className="size-4" aria-hidden />
                Import CSV
              </Button>
              <Button
                className="rounded-xl"
                onClick={() => setQuestionDialog({ open: true, editing: null })}
              >
                <Plus className="size-4" aria-hidden />
                New question
              </Button>
            </div>
          </div>
        ) : (
          <div className={`${GLASS} overflow-hidden`}>
            <ul>
              {questions.map((question) => {
                const difficultyMeta = DIFFICULTY_META[question.difficulty];
                return (
                  <li
                    key={question.id}
                    className="flex items-center gap-4 border-b border-white/70 px-5 py-3.5 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'line-clamp-2 text-sm',
                          question.status === 'active'
                            ? 'text-foreground'
                            : 'text-slate-400 line-through',
                        )}
                      >
                        {question.question}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {topicNames.get(question.topicId) ?? 'Topic'} · +{question.marks} / −
                        {question.negativeMarks}
                      </p>
                    </div>

                    <span
                      className={cn(
                        'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium',
                        DIFFICULTY_TONES[question.difficulty],
                      )}
                    >
                      {difficultyMeta.label}
                    </span>
                    {question.correctAnswer ? (
                      <span className="shrink-0 rounded-md border border-green-200 bg-green-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-green-700">
                        {question.correctAnswer}
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize',
                        STATUS_TONES[question.status],
                      )}
                    >
                      {question.status}
                    </span>

                    <div className="flex shrink-0 items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Edit question"
                        onClick={() => setQuestionDialog({ open: true, editing: question })}
                      >
                        <Pencil className="size-3.5" aria-hidden />
                      </Button>
                      {question.status === 'active' ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Archive question"
                          className="text-slate-500 hover:text-destructive"
                          onClick={() => setConfirmArchive(question)}
                        >
                          <Archive className="size-3.5" aria-hidden />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Restore question"
                          className="text-slate-500 hover:text-green-700"
                          onClick={() =>
                            updateMutation.mutate({
                              id: question.id,
                              payload: { status: 'active' },
                            })
                          }
                        >
                          <ArchiveRestore className="size-3.5" aria-hidden />
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {meta ? (
              <div className="flex items-center justify-between border-t border-white/70 px-5 py-3">
                <p className="text-xs text-slate-500 tabular-nums">
                  Page {meta.page} of {Math.max(1, meta.totalPages)} · {meta.totalItems} question
                  {meta.totalItems === 1 ? '' : 's'}
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="rounded-lg"
                    aria-label="Previous page"
                    disabled={!meta.hasPreviousPage || questionsQuery.isFetching}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="rounded-lg"
                    aria-label="Next page"
                    disabled={!meta.hasNextPage || questionsQuery.isFetching}
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

      <QuestionDialog
        open={questionDialog.open}
        onOpenChange={(open) => setQuestionDialog((state) => ({ ...state, open }))}
        editing={questionDialog.editing}
        subjects={subjects}
        defaultSubjectId={subjectId || undefined}
        defaultTopicId={topicFilter === 'all' ? undefined : topicFilter}
      />

      <QuestionImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        subjects={subjects}
        defaultSubjectId={subjectId || undefined}
      />

      <AlertDialog
        open={confirmArchive !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmArchive(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this question?</AlertDialogTitle>
            <AlertDialogDescription className="line-clamp-2">
              “{confirmArchive?.question}” will be hidden from new exams. You can restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => setConfirmArchive(null)}
              disabled={archiveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              className="rounded-lg bg-destructive text-white hover:bg-destructive/90"
              disabled={archiveMutation.isPending}
              onClick={() => {
                if (confirmArchive) {
                  archiveMutation.mutate(confirmArchive.id, {
                    onSettled: () => setConfirmArchive(null),
                  });
                }
              }}
            >
              {archiveMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : null}
              Archive
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}
