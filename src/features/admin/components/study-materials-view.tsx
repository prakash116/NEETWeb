'use client';

import {
  BookOpenText,
  FileStack,
  FolderTree,
  Library,
  RotateCw,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { AdminShell } from '@/components/layout/admin-shell';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
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
import { cn } from '@/lib/utils';
import type { EntityStatus, TopicTreeNode } from '@/types/entities';
import { useTopicDetail, useTopicTree } from '../hooks';
import { TopicPdfResources } from './topic-pdf-resources';

const GLASS =
  'rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

type SubjectScope = 'active' | 'all';

interface TopicOption {
  id: string;
  name: string;
  path: string;
  depth: number;
  status: EntityStatus;
}

function flattenTopicTree(
  nodes: TopicTreeNode[],
  ancestors: string[] = [],
  depth = 0,
): TopicOption[] {
  const sorted = [...nodes].sort(
    (left, right) =>
      left.order - right.order || left.topicName.localeCompare(right.topicName),
  );

  return sorted.flatMap((node) => {
    const names = [...ancestors, node.topicName];
    return [
      {
        id: node.id,
        name: node.topicName,
        path: names.join(' / '),
        depth,
        status: node.status,
      },
      ...flattenTopicTree(node.children, names, depth + 1),
    ];
  });
}

function StatusBadge({ status }: { status: EntityStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase',
        status === 'active'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-slate-300 bg-slate-100 text-slate-600',
      )}
    >
      {status}
    </span>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 rounded-2xl bg-white/50" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Skeleton className="h-64 rounded-2xl bg-white/50" />
        <Skeleton className="h-80 rounded-2xl bg-white/50" />
      </div>
    </div>
  );
}

export function StudyMaterialsView() {
  const { status: authStatus } = useRequireAuth('admin');
  const authed = authStatus === 'authenticated';
  const subjectsQuery = useSubjects(authed);
  const subjects = subjectsQuery.data?.items ?? [];

  const [subjectScope, setSubjectScope] = useState<SubjectScope>('active');
  const [pickedSubjectId, setPickedSubjectId] = useState<string | null>(null);
  const [pickedTopicId, setPickedTopicId] = useState<string | null>(null);

  const visibleSubjects =
    subjectScope === 'active'
      ? subjects.filter((subject) => subject.status === 'active')
      : subjects;
  const selectedSubject =
    visibleSubjects.find((subject) => subject.id === pickedSubjectId) ??
    visibleSubjects[0] ??
    null;

  const treeQuery = useTopicTree(authed ? (selectedSubject?.id ?? null) : null);
  const topicOptions = flattenTopicTree(treeQuery.data ?? []);
  const selectedTopic =
    topicOptions.find((topic) => topic.id === pickedTopicId) ?? null;
  const detailQuery = useTopicDetail(authed ? (selectedTopic?.id ?? null) : null);
  const detail = detailQuery.data;

  const handleScopeChange = (value: string) => {
    const nextScope = value as SubjectScope;
    setSubjectScope(nextScope);
    if (
      nextScope === 'active' &&
      subjects.find((subject) => subject.id === pickedSubjectId)?.status !== 'active'
    ) {
      setPickedSubjectId(null);
    }
    setPickedTopicId(null);
  };

  const handleSubjectChange = (subjectId: string) => {
    setPickedSubjectId(subjectId);
    setPickedTopicId(null);
  };

  return (
    <AdminShell active="/admin/materials">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Study materials
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Choose a subject and topic, then manage its downloadable PDF preparation files.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-xl bg-white/70">
          <Link href="/admin/subjects">
            <BookOpenText className="size-4" aria-hidden />
            Edit topic text
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        {!authed || subjectsQuery.isPending ? (
          <PageSkeleton />
        ) : subjectsQuery.isError ? (
          <div className={`${GLASS} p-10 text-center`}>
            <Library className="mx-auto size-9 text-slate-300" aria-hidden />
            <h2 className="mt-3 text-base font-semibold text-foreground">
              Subjects could not be loaded
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Retry the request before selecting a topic.
            </p>
            <Button
              variant="outline"
              className="mt-4 rounded-lg bg-white/70"
              onClick={() => void subjectsQuery.refetch()}
            >
              <RotateCw className="size-4" aria-hidden />
              Try again
            </Button>
          </div>
        ) : subjects.length === 0 ? (
          <div className={`${GLASS} p-10 text-center`}>
            <Library className="mx-auto size-9 text-slate-300" aria-hidden />
            <h2 className="mt-3 text-base font-semibold text-foreground">
              Create a subject first
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              PDF materials must belong to a topic inside a subject.
            </p>
            <Button asChild className="mt-5 rounded-xl">
              <Link href="/admin/subjects">Manage subjects</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <section className={`${GLASS} p-4 sm:p-5`} aria-labelledby="material-location-title">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FolderTree className="size-5" aria-hidden />
                </span>
                <div>
                  <h2 id="material-location-title" className="font-semibold text-foreground">
                    Material location
                  </h2>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    Archived subjects and topics remain available under the “All subjects”
                    filter, but students cannot see their materials.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-[180px_1fr_1.35fr]">
                <Field>
                  <FieldLabel htmlFor="material-subject-scope">Subject status</FieldLabel>
                  <Select value={subjectScope} onValueChange={handleScopeChange}>
                    <SelectTrigger id="material-subject-scope" className="w-full bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active subjects</SelectItem>
                      <SelectItem value="all">All subjects</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="material-subject">Subject</FieldLabel>
                  <Select
                    value={selectedSubject?.id}
                    onValueChange={handleSubjectChange}
                    disabled={visibleSubjects.length === 0}
                  >
                    <SelectTrigger id="material-subject" className="w-full bg-white">
                      <SelectValue
                        placeholder={
                          visibleSubjects.length === 0
                            ? 'No active subjects'
                            : 'Choose a subject'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {visibleSubjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                          {subject.status === 'inactive' ? ' — Archived' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field className="sm:col-span-2 lg:col-span-1">
                  <FieldLabel htmlFor="material-topic">Topic</FieldLabel>
                  <Select
                    value={selectedTopic?.id}
                    onValueChange={setPickedTopicId}
                    disabled={
                      selectedSubject === null ||
                      treeQuery.isPending ||
                      treeQuery.isError ||
                      topicOptions.length === 0
                    }
                  >
                    <SelectTrigger id="material-topic" className="w-full bg-white">
                      <SelectValue
                        placeholder={
                          treeQuery.isPending
                            ? 'Loading topics…'
                            : topicOptions.length === 0
                              ? 'No topics in this subject'
                              : 'Choose a topic'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {topicOptions.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          <span className={topic.status === 'inactive' ? 'text-slate-500' : ''}>
                            {topic.path}
                            {topic.status === 'inactive' ? ' — Archived' : ''}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {selectedSubject && treeQuery.isError ? (
                <div
                  role="alert"
                  className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900"
                >
                  <span>Topics for {selectedSubject.name} could not be loaded.</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg bg-white"
                    onClick={() => void treeQuery.refetch()}
                  >
                    <RotateCw className="size-3.5" aria-hidden />
                    Retry
                  </Button>
                </div>
              ) : null}
            </section>

            {!selectedSubject ? (
              <div className={`${GLASS} p-10 text-center`}>
                <Library className="mx-auto size-8 text-slate-300" aria-hidden />
                <p className="mt-3 text-sm font-medium text-slate-700">
                  No active subjects are available
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Select “All subjects” to access archived content.
                </p>
              </div>
            ) : treeQuery.isPending ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <Skeleton className="h-56 rounded-2xl bg-white/50" />
                <Skeleton className="h-72 rounded-2xl bg-white/50" />
              </div>
            ) : topicOptions.length === 0 ? (
              <div className={`${GLASS} p-10 text-center`}>
                <FolderTree className="mx-auto size-8 text-slate-300" aria-hidden />
                <h2 className="mt-3 text-base font-semibold text-foreground">
                  No topics in {selectedSubject.name}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Add a topic before uploading its study materials.
                </p>
                <Button asChild className="mt-5 rounded-xl">
                  <Link href="/admin/subjects">Add topics</Link>
                </Button>
              </div>
            ) : selectedTopic === null ? (
              <div className={`${GLASS} p-10 text-center`}>
                <FileStack className="mx-auto size-9 text-slate-300" aria-hidden />
                <h2 className="mt-3 text-base font-semibold text-foreground">
                  Choose a topic
                </h2>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
                  Topic options include their full hierarchy so the PDF is attached to the
                  correct chapter or lesson.
                </p>
              </div>
            ) : detailQuery.isPending ? (
              <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <Skeleton className="h-56 rounded-2xl bg-white/50" />
                <Skeleton className="h-72 rounded-2xl bg-white/50" />
              </div>
            ) : detailQuery.isError || !detail ? (
              <div className={`${GLASS} p-10 text-center`}>
                <p className="text-sm text-slate-600">Could not load the selected topic.</p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-lg bg-white/70"
                  onClick={() => void detailQuery.refetch()}
                >
                  <RotateCw className="size-4" aria-hidden />
                  Try again
                </Button>
              </div>
            ) : (
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <section className={`${GLASS} p-5`} aria-labelledby="selected-topic-title">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <BookOpenText className="size-5" aria-hidden />
                    </span>
                    <StatusBadge status={detail.status} />
                  </div>
                  <p className="mt-4 text-[11px] font-semibold tracking-wide text-primary uppercase">
                    {selectedSubject.name}
                  </p>
                  <h2
                    id="selected-topic-title"
                    className="mt-1 text-lg font-semibold text-foreground"
                  >
                    {detail.topicName}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{selectedTopic.path}</p>
                  {detail.description ? (
                    <p className="mt-4 text-sm leading-6 text-slate-600">{detail.description}</p>
                  ) : (
                    <p className="mt-4 text-sm text-slate-400">No topic summary added.</p>
                  )}

                  <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
                    <div className="rounded-xl bg-white/70 p-3">
                      <dt className="text-[11px] text-slate-500">PDF files</dt>
                      <dd className="mt-0.5 text-lg font-semibold text-slate-800">
                        {detail.resources.length}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3">
                      <dt className="text-[11px] text-slate-500">Study text</dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-800">
                        {detail.studyContent?.trim()
                          ? `${detail.studyContent.length.toLocaleString()} chars`
                          : 'Not added'}
                      </dd>
                    </div>
                  </dl>
                </section>

                <div className={GLASS}>
                  <div className="border-b border-slate-200/80 px-5 py-4">
                    <h2 className="font-semibold text-foreground">PDF library</h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Files uploaded here appear under this topic on the public preparation
                      page when the subject and topic are active.
                    </p>
                  </div>
                  <div className="p-4 sm:p-5">
                    <TopicPdfResources
                      topicId={detail.id}
                      resources={detail.resources}
                      loading={detailQuery.isFetching}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
