'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Globe,
  GlobeLock,
  Loader2,
  Pencil,
  Plus,
  RotateCw,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useRequireAuth } from '@/features/auth/hooks';
import { useSubjects } from '@/features/dashboard/hooks';
import { formatMinutes } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Exam, ExamStatus, Subject } from '@/types/entities';
import {
  useAdminExams,
  useCreateExam,
  useDeleteExam,
  usePublishExam,
  useTopicStats,
  useTopicTree,
  useUnpublishExam,
  useUpdateExam,
} from '../hooks';
import { examSchema, type ExamFormValues } from '../schemas';
import { flattenTopics } from '../topic-utils';

const GLASS =
  'rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

const STATUS_TONES: Record<ExamStatus, string> = {
  draft: 'border-slate-300 bg-slate-100 text-slate-600',
  published: 'border-green-200 bg-green-50 text-green-700',
  unpublished: 'border-amber-200 bg-amber-50 text-amber-800',
  archived: 'border-slate-300 bg-slate-100 text-slate-500',
};

export function AdminExamsView() {
  const { status: authStatus } = useRequireAuth('admin');
  const authed = authStatus === 'authenticated';

  const subjectsQuery = useSubjects(authed);
  const subjects = subjectsQuery.data?.items ?? [];

  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const examsQuery = useAdminExams(
    {
      page,
      limit: 10,
      subjectId: subjectFilter === 'all' ? undefined : subjectFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
    },
    authed,
  );
  const exams = examsQuery.data?.items ?? [];
  const meta = examsQuery.data?.meta;
  const subjectsById = new Map(subjects.map((subject) => [subject.id, subject]));

  const publishMutation = usePublishExam();
  const unpublishMutation = useUnpublishExam();
  const deleteMutation = useDeleteExam();

  const [dialog, setDialog] = useState<{ open: boolean; editing: Exam | null }>({
    open: false,
    editing: null,
  });
  const [confirmDelete, setConfirmDelete] = useState<Exam | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const togglePublish = (exam: Exam) => {
    setActingId(exam.id);
    const mutation = exam.status === 'published' ? unpublishMutation : publishMutation;
    mutation.mutate(exam.id, { onSettled: () => setActingId(null) });
  };

  const acting = publishMutation.isPending || unpublishMutation.isPending;

  return (
    <AdminShell active="/admin/exams">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Exams</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create topic-wise tests and publish them to students.
          </p>
        </div>
        <Button className="rounded-xl" onClick={() => setDialog({ open: true, editing: null })}>
          <Plus className="size-4" aria-hidden />
          New exam
        </Button>
      </div>

      <div className={`${GLASS} mt-6 flex flex-wrap items-center gap-2.5 p-3`}>
        <Select
          value={subjectFilter}
          onValueChange={(value) => {
            setSubjectFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44" aria-label="Filter by subject">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="unpublished">Unpublished</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4">
        {!authed || examsQuery.isPending ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl bg-white/50" />
            ))}
          </div>
        ) : examsQuery.isError ? (
          <div className={`${GLASS} p-10 text-center`}>
            <p className="text-sm text-slate-600">Could not load exams.</p>
            <Button
              variant="outline"
              className="mt-4 rounded-lg"
              onClick={() => void examsQuery.refetch()}
            >
              <RotateCw className="size-4" aria-hidden />
              Try again
            </Button>
          </div>
        ) : exams.length === 0 ? (
          <div className={`${GLASS} flex flex-col items-center p-12 text-center`}>
            <ClipboardList className="size-9 text-slate-300" aria-hidden />
            <h2 className="mt-4 text-base font-semibold text-foreground">No exams yet</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-600">
              Create an exam over one or more topics, then publish it so students can attempt it.
            </p>
            <Button
              className="mt-5 rounded-xl"
              onClick={() => setDialog({ open: true, editing: null })}
            >
              <Plus className="size-4" aria-hidden />
              New exam
            </Button>
          </div>
        ) : (
          <div className={`${GLASS} overflow-hidden`}>
            <ul>
              {exams.map((exam) => {
                const isActing = acting && actingId === exam.id;
                const editable = exam.status === 'draft' || exam.status === 'unpublished';
                return (
                  <li
                    key={exam.id}
                    className="flex flex-wrap items-center gap-3 border-b border-white/70 px-5 py-3.5 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {exam.examName}
                        </p>
                        <span className="rounded-md bg-white/80 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
                          {exam.examCode}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {subjectsById.get(exam.subjectId)?.name ?? 'Subject'} ·{' '}
                        {exam.topicIds.length} topic{exam.topicIds.length === 1 ? '' : 's'} ·{' '}
                        {exam.totalQuestions} questions · {formatMinutes(exam.totalTime)} · +
                        {exam.marksPerQuestion} / −{exam.negativeMarks} · pass ≥{' '}
                        {exam.passingMarks}
                      </p>
                    </div>

                    <span
                      className={cn(
                        'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize',
                        STATUS_TONES[exam.status],
                      )}
                    >
                      {exam.status}
                    </span>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          'rounded-lg',
                          exam.status === 'published'
                            ? 'text-amber-700 hover:bg-amber-50'
                            : 'text-green-700 hover:bg-green-50',
                        )}
                        disabled={acting}
                        onClick={() => togglePublish(exam)}
                      >
                        {isActing ? (
                          <Loader2 className="size-3.5 animate-spin" aria-hidden />
                        ) : exam.status === 'published' ? (
                          <GlobeLock className="size-3.5" aria-hidden />
                        ) : (
                          <Globe className="size-3.5" aria-hidden />
                        )}
                        {exam.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Edit exam"
                        disabled={!editable}
                        title={editable ? undefined : 'Unpublish the exam before editing'}
                        onClick={() => setDialog({ open: true, editing: exam })}
                      >
                        <Pencil className="size-3.5" aria-hidden />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete exam"
                        className="text-slate-500 hover:text-destructive"
                        onClick={() => setConfirmDelete(exam)}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {meta ? (
              <div className="flex items-center justify-between border-t border-white/70 px-5 py-3">
                <p className="text-xs text-slate-500 tabular-nums">
                  Page {meta.page} of {Math.max(1, meta.totalPages)} · {meta.totalItems} exam
                  {meta.totalItems === 1 ? '' : 's'}
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="rounded-lg"
                    aria-label="Previous page"
                    disabled={!meta.hasPreviousPage || examsQuery.isFetching}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                  >
                    <ChevronLeft className="size-4" aria-hidden />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="rounded-lg"
                    aria-label="Next page"
                    disabled={!meta.hasNextPage || examsQuery.isFetching}
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

      <ExamDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((state) => ({ ...state, open }))}
        editing={dialog.editing}
        subjects={subjects}
        defaultSubjectId={subjectFilter === 'all' ? undefined : subjectFilter}
      />

      <AlertDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this exam?</AlertDialogTitle>
            <AlertDialogDescription>
              “{confirmDelete?.examName}” will be permanently removed. Exams that already have
              student attempts cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => setConfirmDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              className="rounded-lg bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (confirmDelete) {
                  deleteMutation.mutate(confirmDelete.id, {
                    onSettled: () => setConfirmDelete(null),
                  });
                }
              }}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : null}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}

function ExamDialog({
  open,
  onOpenChange,
  editing,
  subjects,
  defaultSubjectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Exam | null;
  subjects: Subject[];
  defaultSubjectId?: string;
}) {
  const createMutation = useCreateExam();
  const updateMutation = useUpdateExam();
  const pending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    values: {
      examName: editing?.examName ?? '',
      examCode: editing?.examCode ?? '',
      subjectId: editing?.subjectId ?? defaultSubjectId ?? '',
      topicIds: editing?.topicIds ?? [],
      totalQuestions: editing ? String(editing.totalQuestions) : '5',
      marksPerQuestion: editing ? String(editing.marksPerQuestion) : '4',
      negativeMarks: editing ? String(editing.negativeMarks) : '1',
      questionTime: editing ? String(editing.questionTime) : '2',
      passingMarks: editing ? String(editing.passingMarks) : '10',
      instructions:
        editing?.instructions ??
        'Each question carries the stated marks; wrong answers deduct the negative marks. Do not switch tabs — the exam fails after 3 warnings.',
    },
  });
  const { errors } = form.formState;
  const subjectId = form.watch('subjectId');
  const topicIds = form.watch('topicIds');

  const treeQuery = useTopicTree(open && subjectId ? subjectId : null);
  const topics = flattenTopics(treeQuery.data ?? []).filter((topic) => topic.status === 'active');
  const statsQuery = useTopicStats(open && subjectId ? subjectId : null);
  const questionCountByTopic = new Map(
    (statsQuery.data ?? []).map((row) => [row.topicId, row.questionCount]),
  );

  const selectedPoolSize = topicIds.reduce(
    (sum, id) => sum + (questionCountByTopic.get(id) ?? 0),
    0,
  );

  useEffect(() => {
    if (!open) form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleTopic = (topicId: string, checked: boolean) => {
    const current = form.getValues('topicIds');
    form.setValue(
      'topicIds',
      checked ? [...current, topicId] : current.filter((id) => id !== topicId),
      { shouldValidate: true },
    );
  };

  const submit = form.handleSubmit((values) => {
    const payload = {
      examName: values.examName,
      examCode: values.examCode.toUpperCase(),
      subjectId: values.subjectId,
      topicIds: values.topicIds,
      totalQuestions: Number(values.totalQuestions),
      marksPerQuestion: Number(values.marksPerQuestion),
      negativeMarks: Number(values.negativeMarks),
      questionTime: Number(values.questionTime),
      passingMarks: Number(values.passingMarks),
      instructions: values.instructions,
    };
    const close = () => onOpenChange(false);
    if (editing) updateMutation.mutate({ id: editing.id, payload }, { onSuccess: close });
    else createMutation.mutate(payload, { onSuccess: close });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-3rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit exam' : 'New exam'}</DialogTitle>
          <DialogDescription>
            Questions are sampled from the selected topics when a student starts. Publish after
            saving to make it visible to students.
          </DialogDescription>
        </DialogHeader>

        <form noValidate className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={errors.examName ? true : undefined}>
              <FieldLabel htmlFor="exam-name">Exam name</FieldLabel>
              <Input
                id="exam-name"
                placeholder="Kinematics Practice Test"
                disabled={pending}
                {...form.register('examName')}
              />
              {errors.examName ? <FieldError>{errors.examName.message}</FieldError> : null}
            </Field>

            <Field data-invalid={errors.examCode ? true : undefined}>
              <FieldLabel htmlFor="exam-code">Exam code</FieldLabel>
              <Input
                id="exam-code"
                placeholder="PHY-KIN-001"
                className="uppercase"
                disabled={pending}
                {...form.register('examCode')}
              />
              {errors.examCode ? <FieldError>{errors.examCode.message}</FieldError> : null}
            </Field>
          </div>

          <Field data-invalid={errors.subjectId ? true : undefined}>
            <FieldLabel htmlFor="exam-subject">Subject</FieldLabel>
            <Controller
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue('topicIds', [], { shouldValidate: false });
                  }}
                  disabled={pending || editing !== null}
                >
                  <SelectTrigger id="exam-subject" className="w-full">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects
                      .filter((subject) => subject.status === 'active')
                      .map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.subjectId ? <FieldError>{errors.subjectId.message}</FieldError> : null}
          </Field>

          <Field data-invalid={errors.topicIds ? true : undefined}>
            <FieldLabel>Topics</FieldLabel>
            {!subjectId ? (
              <p className="text-xs text-slate-500">Pick a subject first.</p>
            ) : treeQuery.isPending ? (
              <Skeleton className="h-20 rounded-xl" />
            ) : topics.length === 0 ? (
              <p className="text-xs text-slate-500">This subject has no active topics.</p>
            ) : (
              <div className="max-h-44 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-white/70 p-2.5">
                {topics.map((topic) => {
                  const count = questionCountByTopic.get(topic.id) ?? 0;
                  return (
                    <label
                      key={topic.id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50"
                      style={{ paddingLeft: `${0.5 + topic.depth * 1.1}rem` }}
                    >
                      <Checkbox
                        checked={topicIds.includes(topic.id)}
                        onCheckedChange={(checked) => toggleTopic(topic.id, checked === true)}
                        disabled={pending}
                      />
                      <span className="min-w-0 flex-1 truncate">{topic.name}</span>
                      <span
                        className={cn(
                          'shrink-0 text-[11px] tabular-nums',
                          count === 0 ? 'text-red-500' : 'text-slate-500',
                        )}
                      >
                        {count} Q
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              Selected pool: {selectedPoolSize} active question{selectedPoolSize === 1 ? '' : 's'}
              {topicIds.length > 0 ? ` across ${topicIds.length} topic(s)` : ''} — the exam needs
              at least “Total questions” of them to publish.
            </p>
            {errors.topicIds ? <FieldError>{errors.topicIds.message}</FieldError> : null}
          </Field>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field data-invalid={errors.totalQuestions ? true : undefined}>
              <FieldLabel htmlFor="exam-total">Total questions</FieldLabel>
              <Input id="exam-total" inputMode="numeric" disabled={pending} {...form.register('totalQuestions')} />
              {errors.totalQuestions ? (
                <FieldError>{errors.totalQuestions.message}</FieldError>
              ) : null}
            </Field>
            <Field data-invalid={errors.questionTime ? true : undefined}>
              <FieldLabel htmlFor="exam-time">Minutes / question</FieldLabel>
              <Input id="exam-time" inputMode="numeric" disabled={pending} {...form.register('questionTime')} />
              {errors.questionTime ? <FieldError>{errors.questionTime.message}</FieldError> : null}
            </Field>
            <Field data-invalid={errors.passingMarks ? true : undefined}>
              <FieldLabel htmlFor="exam-pass">Passing marks</FieldLabel>
              <Input id="exam-pass" inputMode="decimal" disabled={pending} {...form.register('passingMarks')} />
              {errors.passingMarks ? <FieldError>{errors.passingMarks.message}</FieldError> : null}
            </Field>
            <Field data-invalid={errors.marksPerQuestion ? true : undefined}>
              <FieldLabel htmlFor="exam-marks">Marks / question</FieldLabel>
              <Input id="exam-marks" inputMode="decimal" disabled={pending} {...form.register('marksPerQuestion')} />
              {errors.marksPerQuestion ? (
                <FieldError>{errors.marksPerQuestion.message}</FieldError>
              ) : null}
            </Field>
            <Field data-invalid={errors.negativeMarks ? true : undefined}>
              <FieldLabel htmlFor="exam-negative">Negative marks</FieldLabel>
              <Input id="exam-negative" inputMode="decimal" disabled={pending} {...form.register('negativeMarks')} />
              {errors.negativeMarks ? (
                <FieldError>{errors.negativeMarks.message}</FieldError>
              ) : null}
            </Field>
          </div>

          <Field data-invalid={errors.instructions ? true : undefined}>
            <FieldLabel htmlFor="exam-instructions">Instructions</FieldLabel>
            <Textarea
              id="exam-instructions"
              rows={3}
              disabled={pending}
              {...form.register('instructions')}
            />
            {errors.instructions ? <FieldError>{errors.instructions.message}</FieldError> : null}
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {editing ? 'Save changes' : 'Create draft'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
