'use client';

import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  FileQuestion,
  FileUp,
  ListTree,
  Loader2,
  Pencil,
  Plus,
  RotateCw,
  Search,
  Users,
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
import { downloadCsvTemplate } from '../csv';
import {
  useArchiveQuestion,
  useQuestionsList,
  useTopicStats,
  useTopicTree,
  useUpdateQuestion,
} from '../hooks';
import { flattenTopics, type FlatTopic } from '../topic-utils';
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

  // Topic drill-down: null → topic overview, otherwise that topic's questions.
  const [selectedTopic, setSelectedTopic] = useState<FlatTopic | null>(null);

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
  const statsQuery = useTopicStats(authed && subjectId ? subjectId : null);
  const statsByTopic = new Map(
    (statsQuery.data ?? []).map((row) => [row.topicId, row]),
  );

  const params: QuestionListParams = {
    page,
    limit: 10,
    subjectId: subjectId || undefined,
    topicId: selectedTopic?.id,
    difficulty: difficultyFilter === 'all' ? undefined : (difficultyFilter as QuestionDifficulty),
    status: statusFilter === 'all' ? undefined : (statusFilter as QuestionStatus),
    search: debouncedSearch || undefined,
  };
  const questionsQuery = useQuestionsList(params, authed && selectedTopic !== null);
  const questions = questionsQuery.data?.items ?? [];
  const meta = questionsQuery.data?.meta;

  const archiveMutation = useArchiveQuestion();
  const updateMutation = useUpdateQuestion();

  const [questionDialog, setQuestionDialog] = useState<{ open: boolean; editing: Question | null }>(
    { open: false, editing: null },
  );
  const [importOpen, setImportOpen] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState<Question | null>(null);

  const resetFilters = () => {
    setDifficultyFilter('all');
    setStatusFilter('all');
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
  };

  const openTopic = (topic: FlatTopic) => {
    setSelectedTopic(topic);
    resetFilters();
  };

  const backToTopics = () => {
    setSelectedTopic(null);
    resetFilters();
  };

  const overviewLoading =
    !authed || subjectsQuery.isPending || (subjectId !== '' && treeQuery.isPending);

  return (
    <AdminShell active="/admin/questions">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Questions</h1>
          <p className="mt-1 text-sm text-slate-600">
            {selectedTopic
              ? `Questions inside “${selectedTopic.name}”.`
              : 'Pick a topic to see its question bank and student activity.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl border-white/70 bg-white/60 backdrop-blur-xl hover:bg-white/85"
            onClick={downloadCsvTemplate}
          >
            <Download className="size-4" aria-hidden />
            Sample CSV
          </Button>
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

      {selectedTopic === null ? (
        <>
          <div className={`${GLASS} mt-6 flex flex-wrap items-center gap-2.5 p-3`}>
            <Select
              value={subjectId || undefined}
              onValueChange={(value) => {
                setPickedSubjectId(value);
                setSelectedTopic(null);
                resetFilters();
              }}
            >
              <SelectTrigger className="w-44" aria-label="Filter by subject">
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
            <p className="text-xs text-slate-500">
              {flatTopics.length} topic{flatTopics.length === 1 ? '' : 's'} in this subject
            </p>
          </div>

          <div className="mt-4">
            {overviewLoading ? (
              <div className="space-y-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-2xl bg-white/50" />
                ))}
              </div>
            ) : treeQuery.isError ? (
              <div className={`${GLASS} p-10 text-center`}>
                <p className="text-sm text-slate-600">Could not load topics.</p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-lg"
                  onClick={() => void treeQuery.refetch()}
                >
                  <RotateCw className="size-4" aria-hidden />
                  Try again
                </Button>
              </div>
            ) : flatTopics.length === 0 ? (
              <div className={`${GLASS} flex flex-col items-center p-12 text-center`}>
                <ListTree className="size-9 text-slate-300" aria-hidden />
                <h2 className="mt-4 text-base font-semibold text-foreground">No topics yet</h2>
                <p className="mt-1 max-w-sm text-sm text-slate-600">
                  Create topics for this subject under Subjects &amp; topics, then add questions
                  inside them.
                </p>
              </div>
            ) : (
              <div className={`${GLASS} overflow-hidden`}>
                <ul>
                  {flatTopics.map((topic) => {
                    const stats = statsByTopic.get(topic.id);
                    return (
                      <li key={topic.id} className="border-b border-white/70 last:border-0">
                        <button
                          type="button"
                          onClick={() => openTopic(topic)}
                          className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition hover:bg-white/70"
                          style={{ paddingLeft: `${1.25 + topic.depth * 1.25}rem` }}
                        >
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                'truncate text-sm font-medium',
                                topic.status === 'active'
                                  ? 'text-foreground'
                                  : 'text-slate-400 line-through',
                              )}
                            >
                              {topic.name}
                            </p>
                          </div>

                          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700 tabular-nums">
                            <FileQuestion className="size-3" aria-hidden />
                            {statsQuery.isPending ? '…' : (stats?.questionCount ?? 0)} question
                            {(stats?.questionCount ?? 0) === 1 ? '' : 's'}
                          </span>
                          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[11px] font-medium text-teal-700 tabular-nums">
                            <Users className="size-3" aria-hidden />
                            {statsQuery.isPending ? '…' : (stats?.studentsAttempted ?? 0)} student
                            {(stats?.studentsAttempted ?? 0) === 1 ? '' : 's'} attempted
                          </span>
                          <ChevronRight className="size-4 shrink-0 text-slate-400" aria-hidden />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className={`${GLASS} mt-6 flex flex-wrap items-center gap-2.5 p-3`}>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={backToTopics}
            >
              <ArrowLeft className="size-4" aria-hidden />
              All topics
            </Button>

            <Select
              value={difficultyFilter}
              onValueChange={(value) => {
                setDifficultyFilter(value);
                setPage(1);
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
                setPage(1);
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
                  setPage(1);
                }}
                placeholder="Search question text…"
                className="pl-8"
                aria-label="Search questions"
              />
            </div>
          </div>

          <div className="mt-4">
            {questionsQuery.isPending ? (
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
                <h2 className="mt-4 text-base font-semibold text-foreground">
                  No questions in this topic
                </h2>
                <p className="mt-1 max-w-sm text-sm text-slate-600">
                  Create questions one by one, or import a whole set from CSV.
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
                            {selectedTopic.name} · +{question.marks} / −{question.negativeMarks}
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
                      Page {meta.page} of {Math.max(1, meta.totalPages)} · {meta.totalItems}{' '}
                      question{meta.totalItems === 1 ? '' : 's'}
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
        </>
      )}

      <QuestionDialog
        open={questionDialog.open}
        onOpenChange={(open) => setQuestionDialog((state) => ({ ...state, open }))}
        editing={questionDialog.editing}
        subjects={subjects}
        defaultSubjectId={subjectId || undefined}
        defaultTopicId={selectedTopic?.id}
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
