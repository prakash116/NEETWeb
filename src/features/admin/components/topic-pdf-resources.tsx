'use client';

import { Download, FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
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
import type { TopicResource } from '@/types/entities';
import {
  useDeleteTopicResource,
  useTopicResourceDownload,
  useUploadTopicResource,
} from '../hooks';

const MAX_PDF_BYTES = 20 * 1024 * 1024;
const MAX_PDFS_PER_TOPIC = 10;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPdf(file: File): boolean {
  const extensionIsPdf = file.name.toLowerCase().endsWith('.pdf');
  return extensionIsPdf && (file.type === 'application/pdf' || file.type === '');
}

export function TopicPdfResources({
  topicId,
  resources,
  loading,
  onBusyChange,
}: {
  topicId: string | null;
  resources: TopicResource[];
  loading: boolean;
  onBusyChange?: (busy: boolean) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadMutation = useUploadTopicResource();
  const deleteMutation = useDeleteTopicResource();
  const downloadMutation = useTopicResourceDownload();
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(
    null,
  );
  const [removeResource, setRemoveResource] = useState<TopicResource | null>(null);

  const orderedResources = [...resources].sort(
    (left, right) =>
      left.order - right.order ||
      left.title.localeCompare(right.title) ||
      left.createdAt.localeCompare(right.createdAt),
  );
  const busy = uploadProgress !== null || deleteMutation.isPending;
  const slotsRemaining = Math.max(0, MAX_PDFS_PER_TOPIC - resources.length);

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  const handleFiles = async (files: File[]) => {
    if (!topicId || files.length === 0) return;

    if (files.length > slotsRemaining) {
      toast.error(
        slotsRemaining === 0
          ? 'This topic already has the maximum of 10 PDFs'
          : `You can add only ${slotsRemaining} more PDF${slotsRemaining === 1 ? '' : 's'}`,
      );
      return;
    }

    const invalidType = files.find((file) => !isPdf(file));
    if (invalidType) {
      toast.error(`"${invalidType.name}" is not a PDF file`);
      return;
    }

    const empty = files.find((file) => file.size === 0);
    if (empty) {
      toast.error(`"${empty.name}" is empty`);
      return;
    }

    const oversized = files.find((file) => file.size > MAX_PDF_BYTES);
    if (oversized) {
      toast.error(`"${oversized.name}" is larger than 20 MB`);
      return;
    }

    const existingKeys = new Set(
      resources.map((resource) => `${resource.originalName.toLowerCase()}:${resource.bytes}`),
    );
    const selectedKeys = new Set<string>();
    const duplicate = files.find((file) => {
      const key = `${file.name.toLowerCase()}:${file.size}`;
      if (existingKeys.has(key) || selectedKeys.has(key)) return true;
      selectedKeys.add(key);
      return false;
    });
    if (duplicate) {
      toast.error(`"${duplicate.name}" is already attached or selected twice`);
      return;
    }

    let uploaded = 0;
    const nextOrder =
      resources.reduce((highest, resource) => Math.max(highest, resource.order), -1) + 1;
    setUploadProgress({ current: 1, total: files.length });
    try {
      for (const [index, file] of files.entries()) {
        setUploadProgress({ current: index + 1, total: files.length });
        try {
          await uploadMutation.mutateAsync({ topicId, file, order: nextOrder + index });
          uploaded += 1;
        } catch {
          // The mutation presents the API error. Continue so valid remaining files still upload.
        }
      }
    } finally {
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }

    if (uploaded > 0) {
      toast.success(
        `${uploaded} PDF${uploaded === 1 ? '' : 's'} uploaded${
          uploaded < files.length ? `; ${files.length - uploaded} failed` : ''
        }`,
      );
    }
  };

  const confirmRemove = () => {
    if (!topicId || !removeResource) return;
    deleteMutation.mutate(
      { topicId, resourceId: removeResource.id },
      { onSuccess: () => setRemoveResource(null) },
    );
  };

  return (
    <>
      <section
        className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/65 p-3.5"
        aria-labelledby="topic-pdfs-title"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 id="topic-pdfs-title" className="text-sm font-medium text-slate-900">
              PDF study materials
            </h3>
            <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
              Up to 10 PDF files, 20 MB each. Students can download published topic materials.
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500">
            {resources.length}/{MAX_PDFS_PER_TOPIC}
          </span>
        </div>

        {!topicId ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 px-4 py-4 text-center">
            <Upload className="mx-auto size-5 text-slate-400" aria-hidden />
            <p className="mt-1.5 text-xs text-slate-600">
              Create the topic first, then PDF uploads will be enabled here.
            </p>
          </div>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              className="hidden"
              aria-label="Choose PDF study materials"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                void handleFiles(files).finally(() => {
                  if (fileInputRef.current) fileInputRef.current.value = '';
                });
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg bg-white"
              disabled={loading || busy || slotsRemaining === 0}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadProgress ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Upload className="size-4" aria-hidden />
              )}
              {uploadProgress
                ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}`
                : 'Upload PDFs'}
            </Button>

            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
              </div>
            ) : orderedResources.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 py-3 text-center text-xs text-slate-500">
                No PDFs attached yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {orderedResources.map((resource) => {
                  const downloading =
                    downloadMutation.isPending &&
                    downloadMutation.variables?.resourceId === resource.id;
                  return (
                    <li
                      key={resource.id}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                        <FileText className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-800">
                          {resource.title || resource.originalName}
                        </span>
                        <span className="block truncate text-[11px] text-slate-500">
                          {resource.originalName} · {formatBytes(resource.bytes)}
                        </span>
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Download ${resource.title || resource.originalName}`}
                        disabled={busy || downloading}
                        onClick={() =>
                          downloadMutation.mutate({ topicId, resourceId: resource.id })
                        }
                      >
                        {downloading ? (
                          <Loader2 className="size-3.5 animate-spin" aria-hidden />
                        ) : (
                          <Download className="size-3.5" aria-hidden />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-slate-500 hover:text-destructive"
                        aria-label={`Remove ${resource.title || resource.originalName}`}
                        disabled={busy}
                        onClick={() => setRemoveResource(resource)}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {topicId ? (
          <p className="text-[10px] leading-4 text-slate-500">
            PDF uploads and removals are saved immediately.
          </p>
        ) : null}
      </section>

      <AlertDialog
        open={removeResource !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setRemoveResource(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this PDF?</AlertDialogTitle>
            <AlertDialogDescription>
              “{removeResource?.title || removeResource?.originalName}” will no longer be
              available for students to download.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg"
              disabled={deleteMutation.isPending}
              onClick={() => setRemoveResource(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-lg bg-destructive text-white hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={confirmRemove}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : null}
              Remove PDF
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
