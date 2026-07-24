'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Archive,
  ArchiveRestore,
  CornerDownRight,
  FileUp,
  ImagePlus,
  Library,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  RotateCw,
  X,
} from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
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
import { uploadImage } from '@/features/profile/api';
import { ApiError } from '@/lib/api-client';
import { subjectVisual } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { PreparationTrack, Subject, TopicTreeNode } from '@/types/entities';
import {
  useArchiveSubject,
  useArchiveTopic,
  useCreateSubject,
  useCreateTopic,
  usePreparationTracks,
  useTopicDetail,
  useTopicTree,
  useUpdateSubject,
  useUpdateTopic,
} from '../hooks';
import { subjectSchema, topicSchema, type SubjectFormValues, type TopicFormValues } from '../schemas';

const GLASS =
  'rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl';
const MAX_STUDY_CONTENT_CHARS = 100_000;
const MAX_STUDY_TEXT_FILE_BYTES = 1_000_000;

function StatusChip({ status }: { status: 'active' | 'inactive' }) {
  if (status === 'active') return null;
  return (
    <span className="rounded-full border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
      Archived
    </span>
  );
}

// ────────────────────────── Subject dialog ──────────────────────────

function activeTrackIds(tracks: PreparationTrack[]): string[] {
  return tracks.filter((track) => track.status === 'active').map((track) => track.id);
}

function formTrackIds(
  savedTrackIds: string[] | undefined,
  tracks: PreparationTrack[],
): string[] {
  return savedTrackIds && savedTrackIds.length > 0 ? savedTrackIds : activeTrackIds(tracks);
}

function eligibleFormTrackIds(
  savedTrackIds: string[] | undefined,
  eligibleTracks: PreparationTrack[],
): string[] {
  const eligibleIds = new Set(eligibleTracks.map((track) => track.id));
  const savedEligibleIds = (savedTrackIds ?? []).filter((id) => eligibleIds.has(id));
  return savedEligibleIds.length > 0 ? savedEligibleIds : activeTrackIds(eligibleTracks);
}

function PreparationTrackField({
  tracks,
  selectedIds,
  onChange,
  disabled,
  pending,
  error,
  help,
}: {
  tracks: PreparationTrack[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled: boolean;
  pending: boolean;
  error?: string;
  help: string;
}) {
  const id = useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  const toggle = (trackId: string, checked: boolean): void => {
    if (checked) onChange([...new Set([...selectedIds, trackId])]);
    else onChange(selectedIds.filter((selectedId) => selectedId !== trackId));
  };

  return (
    <fieldset
      className="space-y-2"
      aria-describedby={`${helpId}${error ? ` ${errorId}` : ''}`}
      aria-invalid={error ? true : undefined}
    >
      <legend className="text-sm leading-none font-medium">Preparation paths</legend>
      {pending ? (
        <Skeleton className="h-24 rounded-xl" />
      ) : tracks.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
          No preparation paths are available. Create or activate a path before saving.
        </div>
      ) : (
        <div className="grid gap-2 rounded-xl border border-slate-200 bg-white/70 p-2.5 sm:grid-cols-2">
          {tracks.map((track) => {
            const checkboxId = `${id}-${track.id}`;
            const checked = selectedIds.includes(track.id);
            return (
              <label
                key={track.id}
                htmlFor={checkboxId}
                className={cn(
                  'flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors',
                  checked
                    ? 'border-blue-200 bg-blue-50/80 text-slate-950'
                    : 'border-transparent hover:bg-slate-50',
                  disabled && 'cursor-not-allowed opacity-60',
                )}
              >
                <Checkbox
                  id={checkboxId}
                  checked={checked}
                  disabled={disabled}
                  aria-describedby={helpId}
                  onCheckedChange={(value) => toggle(track.id, value === true)}
                />
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: track.color || '#64748b' }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{track.shortTitle || track.title}</span>
                  {track.status === 'inactive' ? (
                    <span className="block text-[10px] text-slate-500">Inactive path</span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      )}
      <p id={helpId} className="text-[11px] leading-4 text-slate-500">
        {help}
      </p>
      {error ? (
        <FieldError id={errorId} role="alert">
          {error}
        </FieldError>
      ) : null}
    </fieldset>
  );
}

function PreparationTrackBadges({
  trackIds = [],
  tracks,
  compact = false,
}: {
  trackIds?: string[];
  tracks: PreparationTrack[];
  compact?: boolean;
}) {
  const resolved = tracks.filter((track) => trackIds.includes(track.id));
  const visible = compact ? resolved.slice(0, 2) : resolved;
  const hiddenCount = resolved.length - visible.length;

  if (trackIds.length === 0) {
    return (
      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
        Legacy: all active paths
      </span>
    );
  }

  if (resolved.length === 0) {
    return (
      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500">
        {trackIds.length} assigned
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {visible.map((track) => (
        <span
          key={track.id}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-600"
        >
          <span
            className="size-1.5 rounded-full"
            style={{ backgroundColor: track.color || '#64748b' }}
            aria-hidden
          />
          {track.shortTitle || track.title}
        </span>
      ))}
      {hiddenCount > 0 ? (
        <span className="text-[10px] font-medium text-slate-500">+{hiddenCount}</span>
      ) : null}
    </span>
  );
}

function SubjectDialog({
  open,
  onOpenChange,
  editing,
  tracks,
  tracksPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Subject | null;
  tracks: PreparationTrack[];
  tracksPending: boolean;
}) {
  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();
  const [iconUrl, setIconUrl] = useState(() => editing?.icon ?? '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pending =
    createMutation.isPending || updateMutation.isPending || uploading || tracksPending;

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: editing?.name ?? '',
      code: editing?.code ?? '',
      description: editing?.description ?? '',
      preparationTrackIds: formTrackIds(editing?.preparationTrackIds, tracks),
      status: editing?.status ?? 'active',
    },
  });
  const { errors } = form.formState;

  const handleImageFile = async (file: File) => {
    setUploading(true);
    try {
      const upload = await uploadImage(file, 'subject');
      setIconUrl(upload.secureUrl);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not upload the image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const submit = form.handleSubmit((values) => {
    const payload = {
      name: values.name,
      code: values.code.toUpperCase(),
      description: values.description || undefined,
      preparationTrackIds: values.preparationTrackIds,
      // Empty string clears a previously saved image on update.
      icon: editing ? iconUrl : iconUrl || undefined,
      status: values.status,
    };
    const close = () => onOpenChange(false);
    if (editing) updateMutation.mutate({ id: editing.id, payload }, { onSuccess: close });
    else createMutation.mutate(payload, { onSuccess: close });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
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

          <Controller
            control={form.control}
            name="preparationTrackIds"
            render={({ field }) => (
              <PreparationTrackField
                tracks={tracks}
                selectedIds={field.value}
                onChange={field.onChange}
                disabled={pending}
                pending={tracksPending}
                error={errors.preparationTrackIds?.message}
                help="The subject appears only inside the selected public preparation paths."
              />
            )}
          />

          <Field>
            <FieldLabel>Subject image (optional)</FieldLabel>
            <div className="flex items-center gap-3">
              {iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={iconUrl}
                  alt="Subject"
                  className="size-14 rounded-xl border border-slate-200 object-cover"
                />
              ) : (
                <span className="flex size-14 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                  <ImagePlus className="size-5" aria-hidden />
                </span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                aria-label="Choose subject image"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleImageFile(file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                disabled={pending}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <ImagePlus className="size-4" aria-hidden />
                )}
                {iconUrl ? 'Change image' : 'Upload image'}
              </Button>
              {iconUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-slate-500"
                  disabled={pending}
                  onClick={() => setIconUrl('')}
                >
                  <X className="size-4" aria-hidden />
                  Remove
                </Button>
              ) : null}
            </div>
            <p className="text-[11px] text-slate-500">
              JPEG, PNG, or WebP up to 5 MB. Shown in the public preparation catalog.
            </p>
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
  tracks,
  tracksPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject: Subject;
  parent: TopicTreeNode | null;
  editing: TopicTreeNode | null;
  tracks: PreparationTrack[];
  tracksPending: boolean;
}) {
  const createMutation = useCreateTopic();
  const updateMutation = useUpdateTopic();
  const editingTopicId = editing?.id ?? null;
  const detailQuery = useTopicDetail(editingTopicId, open);
  const textFileInputRef = useRef<HTMLInputElement | null>(null);
  const loadedTopicRef = useRef<string | null>(null);
  const [pendingImportedText, setPendingImportedText] = useState<string | null>(null);
  const detailUnavailable =
    editingTopicId !== null && (detailQuery.isFetching || detailQuery.isError);
  const pending =
    createMutation.isPending ||
    updateMutation.isPending ||
    tracksPending ||
    detailUnavailable;
  const closeBlocked = createMutation.isPending || updateMutation.isPending;
  const subjectTrackIds = formTrackIds(subject.preparationTrackIds, tracks);
  const subjectTracks = tracks.filter((track) => subjectTrackIds.includes(track.id));
  const parentTrackIds = parent
    ? eligibleFormTrackIds(parent.preparationTrackIds, subjectTracks)
    : subjectTrackIds;
  const eligibleTracks = subjectTracks.filter((track) => parentTrackIds.includes(track.id));
  const defaultTrackIds = editing
    ? eligibleFormTrackIds(editing.preparationTrackIds, eligibleTracks)
    : parent
      ? eligibleFormTrackIds(parent.preparationTrackIds, eligibleTracks)
      : activeTrackIds(eligibleTracks);

  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      topicName: editing?.topicName ?? '',
      description: editing?.description ?? '',
      studyContent: '',
      preparationTrackIds: defaultTrackIds,
      order: editing ? String(editing.order) : '0',
      status: editing?.status ?? 'active',
    },
  });
  const { errors } = form.formState;
  const studyContent = useWatch({ control: form.control, name: 'studyContent' });

  useEffect(() => {
    const detail = detailQuery.data;
    if (!detail || detailQuery.isFetching || loadedTopicRef.current === detail.id) return;
    loadedTopicRef.current = detail.id;
    form.reset({
      topicName: detail.topicName,
      description: detail.description ?? '',
      studyContent: detail.studyContent ?? '',
      preparationTrackIds:
        detail.preparationTrackIds.length > 0
          ? detail.preparationTrackIds
          : form.getValues('preparationTrackIds'),
      order: String(detail.order),
      status: detail.status,
    });
  }, [detailQuery.data, detailQuery.isFetching, form]);

  const applyImportedText = (text: string) => {
    form.setValue('studyContent', text, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleTextFile = async (file: File) => {
    try {
      const extensionIsText = file.name.toLowerCase().endsWith('.txt');
      if (!extensionIsText || (file.type !== '' && file.type !== 'text/plain')) {
        toast.error('Choose a plain .txt file');
        return;
      }
      if (file.size > MAX_STUDY_TEXT_FILE_BYTES) {
        toast.error('Text file is too large to import');
        return;
      }
      const text = (await file.text()).replace(/^\uFEFF/, '');
      if (text.length > MAX_STUDY_CONTENT_CHARS) {
        toast.error('Text file exceeds the 100,000 character limit');
        return;
      }
      if (form.getValues('studyContent').trim()) setPendingImportedText(text);
      else applyImportedText(text);
    } catch {
      toast.error('Could not read the text file');
    } finally {
      if (textFileInputRef.current) textFileInputRef.current.value = '';
    }
  };

  const context = editingTopicId
    ? `Editing a topic in ${subject.name}`
    : parent
      ? `New child topic under “${parent.topicName}”`
      : `New root topic in ${subject.name}`;

  const submit = form.handleSubmit((values) => {
    const close = () => onOpenChange(false);
    const shared = {
      topicName: values.topicName,
      description: values.description || undefined,
      studyContent: values.studyContent,
      preparationTrackIds: values.preparationTrackIds,
      order: values.order === '' ? 0 : Number(values.order),
    };
    if (editingTopicId) {
      updateMutation.mutate(
        { id: editingTopicId, payload: { ...shared, status: values.status } },
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && closeBlocked) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[calc(100svh-3rem)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingTopicId ? 'Edit topic' : 'New topic'}</DialogTitle>
          <DialogDescription>{context}</DialogDescription>
        </DialogHeader>

        <form noValidate className="space-y-4" onSubmit={submit}>
          {editingTopicId && detailQuery.isError ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
              <span>Could not load the saved study text.</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 rounded-lg bg-white"
                onClick={() => void detailQuery.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : null}

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

          <Controller
            control={form.control}
            name="preparationTrackIds"
            render={({ field }) => (
              <PreparationTrackField
                tracks={eligibleTracks}
                selectedIds={field.value}
                onChange={field.onChange}
                disabled={pending}
                pending={tracksPending}
                error={errors.preparationTrackIds?.message}
                help={
                  parent
                    ? 'A child topic can only use preparation paths assigned to its subject and parent.'
                    : 'The topic is visible only in these preparation paths for this subject.'
                }
              />
            )}
          />

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
            <FieldLabel htmlFor="topic-description">Short summary (optional)</FieldLabel>
            <Textarea
              id="topic-description"
              rows={3}
              disabled={pending}
              placeholder="A short summary shown while students browse the topic tree"
              {...form.register('description')}
            />
            {errors.description ? <FieldError>{errors.description.message}</FieldError> : null}
          </Field>

          <Field data-invalid={errors.studyContent ? true : undefined}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <FieldLabel htmlFor="topic-study-content">Study text (optional)</FieldLabel>
              <div>
                <input
                  ref={textFileInputRef}
                  type="file"
                  accept=".txt,text/plain"
                  className="hidden"
                  aria-label="Import study text from a text file"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleTextFile(file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg"
                  disabled={pending}
                  onClick={() => textFileInputRef.current?.click()}
                >
                  <FileUp className="size-3.5" aria-hidden />
                  Import .txt
                </Button>
              </div>
            </div>
            <Textarea
              id="topic-study-content"
              rows={11}
              maxLength={MAX_STUDY_CONTENT_CHARS}
              className="min-h-52 resize-y leading-6"
              disabled={pending}
              placeholder="Write or paste the complete preparation notes students should read…"
              aria-invalid={errors.studyContent ? true : undefined}
              {...form.register('studyContent')}
            />
            <div className="flex items-start justify-between gap-3 text-[11px] text-slate-500">
              <span>Plain text only. Line breaks and spacing are preserved for students.</span>
              <span
                className="shrink-0 tabular-nums"
                aria-label={`${studyContent.length} of ${MAX_STUDY_CONTENT_CHARS} characters`}
              >
                {studyContent.length.toLocaleString()}/{MAX_STUDY_CONTENT_CHARS.toLocaleString()}
              </span>
            </div>
            {errors.studyContent ? <FieldError>{errors.studyContent.message}</FieldError> : null}
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              onClick={() => onOpenChange(false)}
              disabled={closeBlocked}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-lg" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {editingTopicId ? 'Save changes' : 'Create topic'}
            </Button>
          </DialogFooter>
        </form>

        <AlertDialog
          open={pendingImportedText !== null}
          onOpenChange={(next) => {
            if (!next) setPendingImportedText(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Replace the current study text?</AlertDialogTitle>
              <AlertDialogDescription>
                Importing this file will replace the text currently in the editor. This is not
                saved until you save the topic.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-lg"
                onClick={() => setPendingImportedText(null)}
              >
                Keep current text
              </Button>
              <Button
                type="button"
                className="rounded-lg"
                onClick={() => {
                  if (pendingImportedText !== null) applyImportedText(pendingImportedText);
                  setPendingImportedText(null);
                }}
              >
                Replace text
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────── Topic tree ──────────────────────────

function sortNodes(nodes: TopicTreeNode[]): TopicTreeNode[] {
  return [...nodes].sort((a, b) => a.order - b.order || a.topicName.localeCompare(b.topicName));
}

function findTopic(nodes: TopicTreeNode[], id: string): TopicTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const child = findTopic(node.children, id);
    if (child) return child;
  }
  return null;
}

function TopicRow({
  node,
  depth,
  tracks,
  onAddChild,
  onEdit,
  onArchive,
  onRestore,
}: {
  node: TopicTreeNode;
  depth: number;
  tracks: PreparationTrack[];
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
        <span className="hidden xl:inline-flex">
          <PreparationTrackBadges
            trackIds={node.preparationTrackIds}
            tracks={tracks}
            compact
          />
        </span>

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
              tracks={tracks}
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
  const tracksQuery = usePreparationTracks(authed);
  const tracks = [...(tracksQuery.data ?? [])].sort(
    (left, right) => left.order - right.order || left.title.localeCompare(right.title),
  );

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
  const dialogParent =
    topicDialog.parent ??
    (topicDialog.editing?.parentTopicId
      ? findTopic(roots, topicDialog.editing.parentTopicId)
      : null);

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
          disabled={tracksQuery.isPending || tracksQuery.isError}
          onClick={() => setSubjectDialog({ open: true, editing: null })}
        >
          <Plus className="size-4" aria-hidden />
          New subject
        </Button>
      </div>

      {authed && tracksQuery.isError ? (
        <div
          role="alert"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-900"
        >
          <span>Preparation paths could not be loaded. Assignment forms are unavailable.</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg border-amber-300 bg-white/70"
            onClick={() => void tracksQuery.refetch()}
          >
            <RotateCw className="size-3.5" aria-hidden />
            Retry
          </Button>
        </div>
      ) : null}

      <div className="mt-6">
        {!authed || subjectsQuery.isPending || tracksQuery.isPending ? (
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
                          <span className="mt-1 block">
                            <PreparationTrackBadges
                              trackIds={subject.preparationTrackIds}
                              tracks={tracks}
                              compact
                            />
                          </span>
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
                <div className="mt-2">
                  <PreparationTrackBadges
                    trackIds={selected.preparationTrackIds}
                    tracks={tracks}
                  />
                </div>

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
                          tracks={tracks}
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
        key={`${subjectDialog.editing?.id ?? 'new'}-${subjectDialog.open ? 'open' : 'closed'}`}
        open={subjectDialog.open}
        onOpenChange={(open) => setSubjectDialog((state) => ({ ...state, open }))}
        editing={subjectDialog.editing}
        tracks={tracks}
        tracksPending={tracksQuery.isPending}
      />
      {selected ? (
        <TopicDialog
          key={`${selected.id}-${topicDialog.editing?.id ?? dialogParent?.id ?? 'root'}-${topicDialog.open ? 'open' : 'closed'}`}
          open={topicDialog.open}
          onOpenChange={(open) => setTopicDialog((state) => ({ ...state, open }))}
          subject={selected}
          parent={dialogParent}
          editing={topicDialog.editing}
          tracks={tracks}
          tracksPending={tracksQuery.isPending}
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
