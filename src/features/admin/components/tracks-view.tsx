'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Archive,
  ArchiveRestore,
  BookOpen,
  Compass,
  GraduationCap,
  ImagePlus,
  Layers3,
  Loader2,
  Pencil,
  Plus,
  RotateCw,
  School,
  type LucideIcon,
} from 'lucide-react';
import { createElement, useRef, useState } from 'react';
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
import { uploadImage } from '@/features/profile/api';
import { ALLOWED_PHOTO_TYPES, MAX_PHOTO_BYTES } from '@/features/profile/constants';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { PreparationTrack } from '@/types/entities';
import {
  useArchiveTrack,
  useCreateTrack,
  usePreparationTracks,
  useUpdateTrack,
} from '../hooks';
import { slugify, trackSchema, type TrackFormValues } from '../schemas';

const GLASS =
  'rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

const TRACK_ICONS: Record<string, LucideIcon> = {
  school: School,
  book: BookOpen,
  'book-open': BookOpen,
  graduation: GraduationCap,
  'graduation-cap': GraduationCap,
  compass: Compass,
};

function trackIcon(icon?: string): LucideIcon {
  const key = icon?.trim().toLowerCase().replace(/[_\s]+/g, '-') ?? '';
  return TRACK_ICONS[key] ?? Layers3;
}

/** Renders the fallback lucide glyph for a track's icon key. */
function TrackIconGlyph({ icon, className }: { icon?: string; className?: string }) {
  return createElement(trackIcon(icon), { className, 'aria-hidden': true });
}

// ────────────────────────── Track dialog ──────────────────────────

function TrackDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: PreparationTrack | null;
}) {
  const createMutation = useCreateTrack();
  const updateMutation = useUpdateTrack();
  const pending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<TrackFormValues>({
    resolver: zodResolver(trackSchema),
    values: {
      title: editing?.title ?? '',
      shortTitle: editing?.shortTitle ?? '',
      slug: editing?.slug ?? '',
      eyebrow: editing?.eyebrow ?? '',
      description: editing?.description ?? '',
      focus: editing?.focus ?? '',
      icon: editing?.icon ?? '',
      color: editing?.color ?? '#2563eb',
      tint: editing?.tint ?? '#eff6ff',
      order: editing ? String(editing.order ?? 0) : '0',
      status: editing?.status ?? 'active',
    },
  });
  const { errors } = form.formState;
  const colorValue = useWatch({ control: form.control, name: 'color', defaultValue: '#2563eb' });
  const tintValue = useWatch({ control: form.control, name: 'tint', defaultValue: '#eff6ff' });
  const iconValue = useWatch({ control: form.control, name: 'icon', defaultValue: '' });
  const isIconImage = /^https?:\/\//.test(iconValue);
  const [iconUploading, setIconUploading] = useState(false);
  const iconInputRef = useRef<HTMLInputElement | null>(null);

  const handleIconFile = async (file: File) => {
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error('Image must be 5MB or smaller');
      return;
    }
    setIconUploading(true);
    try {
      const upload = await uploadImage(file, 'track');
      form.setValue('icon', upload.secureUrl, { shouldValidate: true });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not upload the image');
    } finally {
      setIconUploading(false);
      if (iconInputRef.current) iconInputRef.current.value = '';
    }
  };

  const submit = form.handleSubmit((values) => {
    const close = () => onOpenChange(false);
    const shared = {
      title: values.title,
      shortTitle: values.shortTitle,
      eyebrow: values.eyebrow || undefined,
      description: values.description || undefined,
      focus: values.focus || undefined,
      icon: values.icon,
      color: values.color,
      tint: values.tint,
      order: values.order === '' ? 0 : Number(values.order),
      status: values.status,
    };
    // The slug is immutable server-side, so it is only sent on create.
    if (editing) updateMutation.mutate({ id: editing.id, payload: shared }, { onSuccess: close });
    else createMutation.mutate({ ...shared, slug: values.slug }, { onSuccess: close });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-3rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit preparation path' : 'New preparation path'}</DialogTitle>
          <DialogDescription>
            Paths are the top-level cards on the public Subjects page — e.g. “10th Subjects”.
          </DialogDescription>
        </DialogHeader>

        <form noValidate className="space-y-4" onSubmit={submit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field data-invalid={errors.title ? true : undefined}>
              <FieldLabel htmlFor="track-title">Title</FieldLabel>
              <Input
                id="track-title"
                placeholder="10th Subjects"
                disabled={pending}
                aria-invalid={errors.title ? true : undefined}
                {...form.register('title', {
                  onBlur: (event) => {
                    if (!editing && form.getValues('slug') === '') {
                      form.setValue('slug', slugify(event.target.value), {
                        shouldValidate: true,
                      });
                    }
                  },
                })}
              />
              {errors.title ? <FieldError>{errors.title.message}</FieldError> : null}
            </Field>

            <Field data-invalid={errors.shortTitle ? true : undefined}>
              <FieldLabel htmlFor="track-short">Short title</FieldLabel>
              <Input
                id="track-short"
                placeholder="Class 10"
                disabled={pending}
                aria-invalid={errors.shortTitle ? true : undefined}
                {...form.register('shortTitle')}
              />
              {errors.shortTitle ? <FieldError>{errors.shortTitle.message}</FieldError> : null}
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field data-invalid={errors.slug ? true : undefined}>
              <FieldLabel htmlFor="track-slug">URL slug</FieldLabel>
              <Input
                id="track-slug"
                placeholder="class-10"
                className="font-mono text-sm"
                disabled={pending || editing !== null}
                aria-invalid={errors.slug ? true : undefined}
                {...form.register('slug')}
              />
              {errors.slug ? <FieldError>{errors.slug.message}</FieldError> : null}
              {editing ? (
                <p className="text-[11px] text-slate-500">
                  The URL slug cannot be changed after creation.
                </p>
              ) : null}
            </Field>

            <Field data-invalid={errors.eyebrow ? true : undefined}>
              <FieldLabel htmlFor="track-eyebrow">Eyebrow label</FieldLabel>
              <Input
                id="track-eyebrow"
                placeholder="Foundation"
                disabled={pending}
                {...form.register('eyebrow')}
              />
              {errors.eyebrow ? <FieldError>{errors.eyebrow.message}</FieldError> : null}
            </Field>
          </div>

          <Field data-invalid={errors.description ? true : undefined}>
            <FieldLabel htmlFor="track-description">Description</FieldLabel>
            <Textarea
              id="track-description"
              rows={2}
              placeholder="Build clear science and mathematics fundamentals before higher secondary."
              disabled={pending}
              {...form.register('description')}
            />
            {errors.description ? <FieldError>{errors.description.message}</FieldError> : null}
          </Field>

          <Field data-invalid={errors.focus ? true : undefined}>
            <FieldLabel htmlFor="track-focus">Focus line (shown above the card button)</FieldLabel>
            <Input
              id="track-focus"
              placeholder="Strong concepts and board-ready basics"
              disabled={pending}
              {...form.register('focus')}
            />
            {errors.focus ? <FieldError>{errors.focus.message}</FieldError> : null}
          </Field>

          <Field>
            <FieldLabel>Icon image</FieldLabel>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200"
                style={{ backgroundColor: tintValue, color: colorValue }}
              >
                {isIconImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={iconValue} alt="" className="size-full object-cover" />
                ) : (
                  <TrackIconGlyph icon={iconValue} className="size-6" />
                )}
              </span>
              <input
                ref={iconInputRef}
                type="file"
                accept={ALLOWED_PHOTO_TYPES.join(',')}
                className="hidden"
                aria-label="Choose icon image"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleIconFile(file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                disabled={pending || iconUploading}
                onClick={() => iconInputRef.current?.click()}
              >
                {iconUploading ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : (
                  <ImagePlus className="size-3.5" aria-hidden />
                )}
                {iconUploading ? 'Uploading…' : isIconImage ? 'Replace image' : 'Upload image'}
              </Button>
              {isIconImage ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-slate-500"
                  disabled={pending || iconUploading}
                  onClick={() => form.setValue('icon', '', { shouldValidate: true })}
                >
                  Remove
                </Button>
              ) : null}
            </div>
            <p className="text-[11px] text-slate-500">
              JPEG, PNG, or WebP up to 5MB. Without an image, the default icon in your colors is
              used.
            </p>
          </Field>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Field data-invalid={errors.color ? true : undefined}>
              <FieldLabel htmlFor="track-color">Color</FieldLabel>
              <div className="relative">
                <span
                  className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 rounded-full border border-slate-200"
                  style={{ backgroundColor: colorValue }}
                  aria-hidden
                />
                <Input
                  id="track-color"
                  className="pl-8 font-mono text-sm"
                  disabled={pending}
                  aria-invalid={errors.color ? true : undefined}
                  {...form.register('color')}
                />
              </div>
              {errors.color ? <FieldError>{errors.color.message}</FieldError> : null}
            </Field>

            <Field data-invalid={errors.tint ? true : undefined}>
              <FieldLabel htmlFor="track-tint">Tint</FieldLabel>
              <div className="relative">
                <span
                  className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 rounded-full border border-slate-200"
                  style={{ backgroundColor: tintValue }}
                  aria-hidden
                />
                <Input
                  id="track-tint"
                  className="pl-8 font-mono text-sm"
                  disabled={pending}
                  aria-invalid={errors.tint ? true : undefined}
                  {...form.register('tint')}
                />
              </div>
              {errors.tint ? <FieldError>{errors.tint.message}</FieldError> : null}
            </Field>

            <Field data-invalid={errors.order ? true : undefined}>
              <FieldLabel htmlFor="track-order">Order</FieldLabel>
              <Input
                id="track-order"
                inputMode="numeric"
                disabled={pending}
                {...form.register('order')}
              />
              {errors.order ? <FieldError>{errors.order.message}</FieldError> : null}
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="track-status">Status</FieldLabel>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={pending}>
                  <SelectTrigger id="track-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active — visible on the public page</SelectItem>
                    <SelectItem value="inactive">Inactive — hidden (draft/archived)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
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
            <Button type="submit" className="rounded-lg" disabled={pending || iconUploading}>
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {editing ? 'Save changes' : 'Create path'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────── Main view ──────────────────────────

export function TracksView() {
  const { status } = useRequireAuth('admin');
  const authed = status === 'authenticated';
  const tracksQuery = usePreparationTracks(authed);
  const tracks = [...(tracksQuery.data ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title),
  );

  const archiveMutation = useArchiveTrack();
  const updateMutation = useUpdateTrack();

  const [dialog, setDialog] = useState<{ open: boolean; editing: PreparationTrack | null }>({
    open: false,
    editing: null,
  });
  const [confirmArchive, setConfirmArchive] = useState<PreparationTrack | null>(null);

  return (
    <AdminShell active="/admin/tracks">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Preparation paths
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            The class-level cards students pick first on the public Subjects page.
          </p>
        </div>
        <Button className="rounded-xl" onClick={() => setDialog({ open: true, editing: null })}>
          <Plus className="size-4" aria-hidden />
          New path
        </Button>
      </div>

      <div className="mt-6">
        {!authed || tracksQuery.isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-56 rounded-2xl bg-white/50" />
            ))}
          </div>
        ) : tracksQuery.isError ? (
          <div className={`${GLASS} p-10 text-center`}>
            <p className="text-sm text-slate-600">Could not load preparation paths.</p>
            <Button
              variant="outline"
              className="mt-4 rounded-lg"
              onClick={() => void tracksQuery.refetch()}
            >
              <RotateCw className="size-4" aria-hidden />
              Try again
            </Button>
          </div>
        ) : tracks.length === 0 ? (
          <div className={`${GLASS} flex flex-col items-center p-12 text-center`}>
            <Layers3 className="size-9 text-slate-300" aria-hidden />
            <h2 className="mt-4 text-base font-semibold text-foreground">
              No preparation paths yet
            </h2>
            <p className="mt-1 max-w-sm text-sm text-slate-600">
              Create paths like “10th Subjects” or “12th Dropper Subjects” — they become the
              first step of the public catalog.
            </p>
            <Button
              className="mt-5 rounded-xl"
              onClick={() => setDialog({ open: true, editing: null })}
            >
              <Plus className="size-4" aria-hidden />
              Create your first path
            </Button>
          </div>
        ) : (
          <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tracks.map((track) => {
              const Icon = trackIcon(track.icon);
              const hasImage = Boolean(track.icon && /^https?:\/\//.test(track.icon));
              const inactive = track.status === 'inactive';
              return (
                <article
                  key={track.id}
                  className={cn(`${GLASS} relative overflow-hidden p-5`, inactive && 'opacity-75')}
                >
                  <div
                    className="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full opacity-20 blur-2xl"
                    style={{ backgroundColor: track.color || '#2563eb' }}
                    aria-hidden
                  />
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="flex size-11 items-center justify-center overflow-hidden rounded-xl shadow-sm"
                      style={{
                        backgroundColor: track.tint || '#eff6ff',
                        color: track.color || '#2563eb',
                      }}
                    >
                      {hasImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={track.icon} alt="" className="size-full object-cover" />
                      ) : (
                        <Icon className="size-5" aria-hidden />
                      )}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${track.title}`}
                        onClick={() => setDialog({ open: true, editing: track })}
                      >
                        <Pencil className="size-3.5" aria-hidden />
                      </Button>
                      {inactive ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Restore ${track.title}`}
                          className="text-slate-500 hover:text-green-700"
                          onClick={() =>
                            updateMutation.mutate({
                              id: track.id,
                              payload: { status: 'active' },
                            })
                          }
                        >
                          <ArchiveRestore className="size-3.5" aria-hidden />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Archive ${track.title}`}
                          className="text-slate-500 hover:text-destructive"
                          onClick={() => setConfirmArchive(track)}
                        >
                          <Archive className="size-3.5" aria-hidden />
                        </Button>
                      )}
                    </div>
                  </div>

                  <p
                    className="mt-4 text-[11px] font-semibold tracking-[0.14em] uppercase"
                    style={{ color: track.color || '#2563eb' }}
                  >
                    {track.eyebrow || 'Preparation path'}
                  </p>
                  <h3 className="mt-0.5 text-lg font-semibold text-foreground">{track.title}</h3>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                    /subjects/{track.slug}
                  </p>
                  {track.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{track.description}</p>
                  ) : null}

                  <div className="mt-4 flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full border px-2 py-0.5 text-[11px] font-medium',
                        inactive
                          ? 'border-slate-300 bg-slate-100 text-slate-600'
                          : 'border-green-200 bg-green-50 text-green-700',
                      )}
                    >
                      {inactive ? 'Hidden' : 'Live'}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white/80 px-2 py-0.5 text-[11px] text-slate-600 tabular-nums">
                      Order {track.order ?? 0}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <TrackDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((state) => ({ ...state, open }))}
        editing={dialog.editing}
      />

      <AlertDialog
        open={confirmArchive !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmArchive(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive “{confirmArchive?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The path disappears from the public Subjects page immediately. Subjects assigned to
              it keep their assignment and you can restore the path anytime.
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
