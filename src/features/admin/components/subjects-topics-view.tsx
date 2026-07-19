'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Archive,
  ArchiveRestore,
  CornerDownRight,
  Library,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  RotateCw,
} from 'lucide-react';
import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { subjectVisual } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { Subject, TopicTreeNode } from '@/types/entities';
import {
  useArchiveSubject,
  useArchiveTopic,
  useCreateSubject,
  useCreateTopic,
  useTopicTree,
  useUpdateSubject,
  useUpdateTopic,
} from '../hooks';
import { subjectSchema, topicSchema, type SubjectFormValues, type TopicFormValues } from '../schemas';

const GLASS =
  'rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

function StatusChip({ status }: { status: 'active' | 'inactive' }) {
  if (status === 'active') return null;
  return (
    <span className="rounded-full border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
      Archived
    </span>
  );
}

// ────────────────────────── Subject dialog ──────────────────────────

function SubjectDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Subject | null;
}) {
  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const pending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    values: {
      name: editing?.name ?? '',
      code: editing?.code ?? '',
      description: editing?.description ?? '',
      status: editing?.status ?? 'active',
    },
  });
  const { errors } = form.formState;

  const submit = form.handleSubmit((values) => {
    const payload = {
      name: values.name,
      code: values.code.toUpperCase(),
      description: values.description || undefined,
      status: values.status,
    };
    const close = () => onOpenChange(false);
    if (editing) updateMutation.mutate({ id: editing.id, payload }, { onSuccess: close });
    else createMutation.mutate(payload, { onSuccess: close });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit subject' : 'New subject'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'Update the subject details.'
              : 'Subjects group the syllabus — e.g. Physics, Chemistry, Botany, Zoology.'}
          </DialogDescription>
        </DialogHeader>

        <form noValidate className="space-y-4" onSubmit={submit}>
          <Field data-invalid={errors.name ? true : undefined}>
            <FieldLabel htmlFor="subject-name">Name</FieldLabel>
            <Input
              id="subject-name"
              placeholder="Physics"
              disabled={pending}
              aria-invalid={errors.name ? true : undefined}
              {...form.register('name')}
            />
            {errors.name ? <FieldError>{errors.name.message}</FieldError> : null}
          </Field>

          <Field data-invalid={errors.code ? true : undefined}>
            <FieldLabel htmlFor="subject-code">Code</FieldLabel>
            <Input
              id="subject-code"
              placeholder="PHY"
              className="uppercase"
              disabled={pending}
              aria-invalid={errors.code ? true : undefined}
              {...form.register('code')}
            />
            {errors.code ? <FieldError>{errors.code.message}</FieldError> : null}
          </Field>

          <Field data-invalid={errors.description ? true : undefined}>
            <FieldLabel htmlFor="subject-description">Description (optional)</FieldLabel>
            <Textarea
              id="subject-description"
              rows={3}
              placeholder="Concepts and problem solving for NEET physics"
              disabled={pending}
              {...form.register('description')}
            />
            {errors.description ? <FieldError>{errors.description.message}</FieldError> : null}
          </Field>

          {editing ? (
            <Field>
              <FieldLabel htmlFor="subject-status">Status</FieldLabel>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
                    <SelectTrigger id="subject-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          ) : null}

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
              {editing ? 'Save changes' : 'Create subject'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────── Topic dialog ──────────────────────────

function TopicDialog({
  open,
  onOpenChange,
  subject,
  parent,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject;
  parent: TopicTreeNode | null;
  editing: TopicTreeNode | null;
}) {
  const createMutation = useCreateTopic();
  const updateMutation = useUpdateTopic();
  const pending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    values: {
      topicName: editing?.topicName ?? '',
      description: editing?.description ?? '',
      order: editing ? String(editing.order) : '0',
      status: editing?.status ?? 'active',
    },
  });
  const { errors } = form.formState;

  const context = editing
    ? `Editing a topic in ${subject.name}`
    : parent
      ? `New child topic under “${parent.topicName}”`
      : `New root topic in ${subject.name}`;

  const submit = form.handleSubmit((values) => {
    const close = () => onOpenChange(false);
    const shared = {
      topicName: values.topicName,
      description: values.description || undefined,
      order: values.order === '' ? 0 : Number(values.order),
    };
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload: { ...shared, status: values.status } },
        { onSuccess: close },
      );
    } else {
      createMutation.mutate(
        { subjectId: subject.id, parentTopicId: parent?.id ?? null, ...shared },
        { onSuccess: close },
      );
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit topic' : 'New topic'}</DialogTitle>
          <DialogDescription>{context}</DialogDescription>
        </DialogHeader>

        <form noValidate className="space-y-4" onSubmit={submit}>
          <Field data-invalid={errors.topicName ? true : undefined}>
            <FieldLabel htmlFor="topic-name">Topic name</FieldLabel>
            <Input
              id="topic-name"
              placeholder="Mechanics"
              disabled={pending}
              aria-invalid={errors.topicName ? true : undefined}
              {...form.register('topicName')}
            />
            {errors.topicName ? <FieldError>{errors.topicName.message}</FieldError> : null}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field data-invalid={errors.order ? true : undefined}>
              <FieldLabel htmlFor="topic-order">Display order</FieldLabel>
              <Input
                id="topic-order"
                inputMode="numeric"
                disabled={pending}
                aria-invalid={errors.order ? true : undefined}
                {...form.register('order')}
              />
              {errors.order ? <FieldError>{errors.order.message}</FieldError> : null}
            </Field>

            {editing ? (
              <Field>
                <FieldLabel htmlFor="topic-status">Status</FieldLabel>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
                      <SelectTrigger id="topic-status" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            ) : null}
          </div>

          <Field data-invalid={errors.description ? true : undefined}>
            <FieldLabel htmlFor="topic-description">Description (optional)</FieldLabel>
            <Textarea
              id="topic-description"
              rows={3}
              disabled={pending}
              {...form.register('description')}
            />
            {errors.description ? <FieldError>{errors.description.message}</FieldError> : null}
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
              {editing ? 'Save changes' : 'Create topic'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────── Topic tree ──────────────────────────

function sortNodes(nodes: TopicTreeNode[]): TopicTreeNode[] {
  return [...nodes].sort((a, b) => a.order - b.order || a.topicName.localeCompare(b.topicName));
}

function TopicRow({
  node,
  depth,
  onAddChild,
  onEdit,
  onArchive,
  onRestore,
}: {
  node: TopicTreeNode;
  depth: number;
  onAddChild: (node: TopicTreeNode) => void;
  onEdit: (node: TopicTreeNode) => void;
  onArchive: (node: TopicTreeNode) => void;
  onRestore: (node: TopicTreeNode) => void;
}) {
  return (
    <li>
      <div
        className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/70"
        style={{ marginLeft: depth * 22 }}
      >
        {depth > 0 ? (
          <CornerDownRight className="size-3.5 shrink-0 text-slate-400" aria-hidden />
        ) : (
          <span className="size-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
        )}
        <span
          className={cn(
            'truncate text-sm',
            node.status === 'inactive' ? 'text-slate-400 line-through' : 'text-foreground',
          )}
        >
          {node.topicName}
        </span>
        <StatusChip status={node.status} />
        <span className="text-[10px] text-slate-400 tabular-nums">#{node.order}</span>

        <div className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Add child topic under ${node.topicName}`}
            onClick={() => onAddChild(node)}
          >
            <Plus className="size-3.5" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${node.topicName}`}
            onClick={() => onEdit(node)}
          >
            <Pencil className="size-3.5" aria-hidden />
          </Button>
          {node.status === 'active' ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Archive ${node.topicName}`}
              className="text-slate-500 hover:text-destructive"
              onClick={() => onArchive(node)}
            >
              <Archive className="size-3.5" aria-hidden />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Restore ${node.topicName}`}
              className="text-slate-500 hover:text-green-700"
              onClick={() => onRestore(node)}
            >
              <ArchiveRestore className="size-3.5" aria-hidden />
            </Button>
          )}
        </div>
      </div>

      {node.children.length > 0 ? (
        <ul>
          {sortNodes(node.children).map((child) => (
            <TopicRow
              key={child.id}
              node={child}
              depth={depth + 1}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onArchive={onArchive}
              onRestore={onRestore}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

// ────────────────────────── Main view ──────────────────────────

export function SubjectsTopicsView() {
  const { status } = useRequireAuth('admin');
  const authed = status === 'authenticated';
  const subjectsQuery = useSubjects(authed);
  const subjects = subjectsQuery.data?.items ?? [];

  // Derived default: first subject until the admin explicitly picks one.
  const [pickedId, setSelectedId] = useState<string | null>(null);
  const selectedId = pickedId ?? (subjects.length > 0 ? subjects[0].id : null);
  const selected = subjects.find((subject) => subject.id === selectedId) ?? null;

  const treeQuery = useTopicTree(authed ? selectedId : null);
  const roots = sortNodes(treeQuery.data ?? []);

  const archiveSubjectMutation = useArchiveSubject();
  const updateSubjectMutation = useUpdateSubject();
  const archiveTopicMutation = useArchiveTopic();
  const updateTopicMutation = useUpdateTopic();

  const [subjectDialog, setSubjectDialog] = useState<{ open: boolean; editing: Subject | null }>({
    open: false,
    editing: null,
  });
  const [topicDialog, setTopicDialog] = useState<{
    open: boolean;
    parent: TopicTreeNode | null;
    editing: TopicTreeNode | null;
  }>({ open: false, parent: null, editing: null });
  const [confirmArchive, setConfirmArchive] = useState<{
    kind: 'subject' | 'topic';
    id: string;
    name: string;
  } | null>(null);

  const archivePending = archiveSubjectMutation.isPending || archiveTopicMutation.isPending;

  const runArchive = () => {
    if (!confirmArchive) return;
    const settle = { onSettled: () => setConfirmArchive(null) };
    if (confirmArchive.kind === 'subject') archiveSubjectMutation.mutate(confirmArchive.id, settle);
    else archiveTopicMutation.mutate(confirmArchive.id, settle);
  };

  return (
    <AdminShell active="/admin/subjects">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Subjects &amp; topics
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Build the syllabus tree students practice from — Subject → Chapter → Topic.
          </p>
        </div>
        <Button
          className="rounded-xl"
          onClick={() => setSubjectDialog({ open: true, editing: null })}
        >
          <Plus className="size-4" aria-hidden />
          New subject
        </Button>
      </div>

      <div className="mt-6">
        {!authed || subjectsQuery.isPending ? (
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            <Skeleton className="h-72 rounded-2xl bg-white/50" />
            <Skeleton className="h-72 rounded-2xl bg-white/50" />
          </div>
        ) : subjectsQuery.isError ? (
          <div className={`${GLASS} p-10 text-center`}>
            <p className="text-sm text-slate-600">Could not load subjects.</p>
            <Button
              variant="outline"
              className="mt-4 rounded-lg border-white/70 bg-white/60 backdrop-blur-xl hover:bg-white/85"
              onClick={() => void subjectsQuery.refetch()}
            >
              <RotateCw className="size-4" aria-hidden />
              Try again
            </Button>
          </div>
        ) : subjects.length === 0 ? (
          <div className={`${GLASS} flex flex-col items-center p-12 text-center`}>
            <Library className="size-9 text-slate-300" aria-hidden />
            <h2 className="mt-4 text-base font-semibold text-foreground">No subjects yet</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-600">
              Start with the four NEET subjects — Physics, Chemistry, Botany, and Zoology.
            </p>
            <Button
              className="mt-5 rounded-xl"
              onClick={() => setSubjectDialog({ open: true, editing: null })}
            >
              <Plus className="size-4" aria-hidden />
              Create your first subject
            </Button>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
            <div className={`${GLASS} p-3`}>
              <ul className="space-y-1">
                {subjects.map((subject) => {
                  const visual = subjectVisual(subject.code);
                  const isSelected = subject.id === selectedId;
                  return (
                    <li key={subject.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedId(subject.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedId(subject.id);
                          }
                        }}
                        className={cn(
                          'flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors',
                          isSelected ? 'bg-white/95 shadow-sm' : 'hover:bg-white/70',
                        )}
                      >
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: visual.color }}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              'block truncate text-sm font-medium',
                              subject.status === 'inactive'
                                ? 'text-slate-400 line-through'
                                : 'text-foreground',
                            )}
                          >
                            {subject.name}
                          </span>
                          <span className="block text-[11px] text-slate-500">{subject.code}</span>
                        </span>
                        <StatusChip status={subject.status} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Actions for ${subject.name}`}
                              onClick={(event) => event.stopPropagation()}
                            >
                              <MoreVertical className="size-3.5" aria-hidden />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => setSubjectDialog({ open: true, editing: subject })}
                            >
                              <Pencil className="size-4" aria-hidden />
                              Edit
                            </DropdownMenuItem>
                            {subject.status === 'active' ? (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={() =>
                                  setConfirmArchive({
                                    kind: 'subject',
                                    id: subject.id,
                                    name: subject.name,
                                  })
                                }
                              >
                                <Archive className="size-4" aria-hidden />
                                Archive
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onSelect={() =>
                                  updateSubjectMutation.mutate({
                                    id: subject.id,
                                    payload: { status: 'active' },
                                  })
                                }
                              >
                                <ArchiveRestore className="size-4" aria-hidden />
                                Restore
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {selected ? (
              <div className={`${GLASS} p-6`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: subjectVisual(selected.code).color }}
                      aria-hidden
                    />
                    <h2 className="truncate text-lg font-semibold text-foreground">
                      {selected.name}
                    </h2>
                    <span className="rounded-md bg-white/80 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                      {selected.code}
                    </span>
                    <StatusChip status={selected.status} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg border-white/70 bg-white/60 backdrop-blur-xl hover:bg-white/85"
                      onClick={() => setSubjectDialog({ open: true, editing: selected })}
                    >
                      <Pencil className="size-3.5" aria-hidden />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-lg"
                      onClick={() => setTopicDialog({ open: true, parent: null, editing: null })}
                    >
                      <Plus className="size-3.5" aria-hidden />
                      Add topic
                    </Button>
                  </div>
                </div>
                {selected.description ? (
                  <p className="mt-2 text-sm text-slate-600">{selected.description}</p>
                ) : null}

                <div className="mt-5 border-t border-white/70 pt-4">
                  {treeQuery.isPending ? (
                    <div className="space-y-2">
                      <Skeleton className="h-8 rounded-lg bg-white/50" />
                      <Skeleton className="ml-6 h-8 rounded-lg bg-white/50" />
                      <Skeleton className="h-8 rounded-lg bg-white/50" />
                    </div>
                  ) : treeQuery.isError ? (
                    <div className="py-6 text-center">
                      <p className="text-sm text-slate-600">Could not load topics.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 rounded-lg"
                        onClick={() => void treeQuery.refetch()}
                      >
                        <RotateCw className="size-3.5" aria-hidden />
                        Retry
                      </Button>
                    </div>
                  ) : roots.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                      <p className="text-sm text-slate-600">No topics in {selected.name} yet.</p>
                      <Button
                        size="sm"
                        className="mt-4 rounded-lg"
                        onClick={() => setTopicDialog({ open: true, parent: null, editing: null })}
                      >
                        <Plus className="size-3.5" aria-hidden />
                        Add the first topic
                      </Button>
                    </div>
                  ) : (
                    <ul className="space-y-0.5">
                      {roots.map((node) => (
                        <TopicRow
                          key={node.id}
                          node={node}
                          depth={0}
                          onAddChild={(parent) =>
                            setTopicDialog({ open: true, parent, editing: null })
                          }
                          onEdit={(editing) =>
                            setTopicDialog({ open: true, parent: null, editing })
                          }
                          onArchive={(node) =>
                            setConfirmArchive({ kind: 'topic', id: node.id, name: node.topicName })
                          }
                          onRestore={(node) =>
                            updateTopicMutation.mutate({
                              id: node.id,
                              payload: { status: 'active' },
                            })
                          }
                        />
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div className={`${GLASS} p-10 text-center text-sm text-slate-600`}>
                Select a subject to manage its topics.
              </div>
            )}
          </div>
        )}
      </div>

      <SubjectDialog
        open={subjectDialog.open}
        onOpenChange={(open) => setSubjectDialog((state) => ({ ...state, open }))}
        editing={subjectDialog.editing}
      />
      {selected ? (
        <TopicDialog
          open={topicDialog.open}
          onOpenChange={(open) => setTopicDialog((state) => ({ ...state, open }))}
          subject={selected}
          parent={topicDialog.parent}
          editing={topicDialog.editing}
        />
      ) : null}

      <AlertDialog
        open={confirmArchive !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmArchive(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive “{confirmArchive?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmArchive?.kind === 'subject'
                ? 'Students will no longer see this subject. You can restore it at any time.'
                : 'Archived topics disappear from student practice. Child topics must be archived first.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => setConfirmArchive(null)}
              disabled={archivePending}
            >
              Cancel
            </Button>
            <Button
              className="rounded-lg bg-destructive text-white hover:bg-destructive/90"
              onClick={runArchive}
              disabled={archivePending}
            >
              {archivePending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              Archive
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}
