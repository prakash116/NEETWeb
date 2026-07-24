'use client';

import {
  ArrowLeft,
  ArrowRight,
  Atom,
  BookOpen,
  Calculator,
  ChevronRight,
  Compass,
  Download,
  FileText,
  FlaskConical,
  GraduationCap,
  Home,
  Layers3,
  Leaf,
  Library,
  LockOpen,
  PawPrint,
  RotateCw,
  School,
  Search,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AppBackground } from '@/components/common/app-background';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Reveal } from '@/features/landing/components/reveal';
import { SiteFooter } from '@/features/landing/components/site-footer';
import { SiteHeader } from '@/features/landing/components/site-header';
import { useLandingSummary } from '@/features/landing/hooks';
import { subjectVisual } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { PreparationTrack, Subject, TopicTreeNode } from '@/types/entities';
import { getPublicTopicResourceDownloadUrl } from '../api';
import {
  usePublicPreparationTracks,
  usePublicTrackSubjects,
  usePublicTrackTopic,
  usePublicTrackTopicTree,
} from '../hooks';

const GLASS =
  'rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl';

const DEFAULT_TRACK_COLOR = '#2563eb';
const DEFAULT_TRACK_TINT = '#eff6ff';

const TRACK_ICONS: Record<string, LucideIcon> = {
  school: School,
  book: BookOpen,
  'book-open': BookOpen,
  graduation: GraduationCap,
  'graduation-cap': GraduationCap,
  compass: Compass,
};

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  PHY: Atom,
  CHE: FlaskConical,
  BOT: Leaf,
  ZOO: PawPrint,
  BIO: Leaf,
  MTH: Calculator,
};

function countTopics(nodes: TopicTreeNode[]): number {
  return nodes.reduce((total, node) => total + 1 + countTopics(node.children), 0);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function filterTopicTree(nodes: TopicTreeNode[], query: string): TopicTreeNode[] {
  if (!query) return nodes;

  return nodes.flatMap((node) => {
    const children = filterTopicTree(node.children, query);
    const matches =
      node.topicName.toLowerCase().includes(query) ||
      node.description?.toLowerCase().includes(query);
    return matches || children.length > 0 ? [{ ...node, children }] : [];
  });
}

const PUBLIC_SUBJECT_QUERY = {
  page: 1,
  limit: 100,
  sortBy: 'name',
  sortOrder: 'asc' as const,
};

export function SubjectsView({
  trackSlug,
  subjectId,
}: {
  trackSlug?: string;
  subjectId?: string;
}) {
  const landingSummaryQuery = useLandingSummary();
  const tracksQuery = usePublicPreparationTracks();
  const tracks = useMemo(() => tracksQuery.data ?? [], [tracksQuery.data]);
  const selectedTrack =
    tracks.find((track) => track.slug === trackSlug) ?? null;

  const subjectsQuery = usePublicTrackSubjects(
    selectedTrack?.slug ?? null,
    PUBLIC_SUBJECT_QUERY,
  );
  const subjects = useMemo(() => subjectsQuery.data?.items ?? [], [subjectsQuery.data]);
  const selectedSubject =
    subjects.find((subject) => subject.id === subjectId) ?? null;

  const topicTreeQuery = usePublicTrackTopicTree(
    selectedTrack?.slug ?? null,
    selectedSubject?.id ?? null,
  );
  const [topicSearch, setTopicSearch] = useState('');
  const topicTree = useMemo(() => topicTreeQuery.data ?? [], [topicTreeQuery.data]);
  const normalizedSearch = topicSearch.trim().toLowerCase();
  const visibleTopicTree = useMemo(
    () => filterTopicTree(topicTree, normalizedSearch),
    [normalizedSearch, topicTree],
  );

  return (
    <div className="relative isolate flex min-h-svh flex-col">
      <AppBackground />
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-28 pb-16 sm:pt-32">
        <PreparationHero
          trackCount={tracks.length}
          subjectCount={landingSummaryQuery.data?.subjects.length ?? 0}
          topicCount={landingSummaryQuery.data?.stats.topics ?? null}
        />

        <CatalogBreadcrumbs
          track={selectedTrack}
          subject={selectedSubject}
        />

        <section id="preparation-catalog" className="scroll-mt-24">
          {tracksQuery.isPending ? (
            <PreparationTrackGrid
              tracks={[]}
              pending
              error={false}
              onRetry={() => void tracksQuery.refetch()}
            />
          ) : tracksQuery.isError ? (
            <PreparationTrackGrid
              tracks={[]}
              pending={false}
              error
              onRetry={() => void tracksQuery.refetch()}
            />
          ) : !trackSlug ? (
            <PreparationTrackGrid
              tracks={tracks}
              pending={false}
              error={false}
              onRetry={() => void tracksQuery.refetch()}
            />
          ) : !selectedTrack ? (
            <CatalogRouteMissing
              title="Preparation path not found"
              description="This preparation path is unavailable or is no longer published."
              href="/subjects"
              linkLabel="View all preparation paths"
            />
          ) : subjectsQuery.isPending || subjectsQuery.isError || !subjectId ? (
            <PublicSubjectGrid
              track={selectedTrack}
              subjects={subjects}
              pending={subjectsQuery.isPending}
              error={subjectsQuery.isError}
              onRetry={() => void subjectsQuery.refetch()}
            />
          ) : !selectedSubject ? (
            <CatalogRouteMissing
              title="Subject not found"
              description={`This subject is not published for ${selectedTrack.shortTitle}.`}
              href={`/subjects/${selectedTrack.slug}`}
              linkLabel={`View ${selectedTrack.shortTitle} subjects`}
            />
          ) : (
            <PublicTopicLibrary
              track={selectedTrack}
              subject={selectedSubject}
              topics={visibleTopicTree}
              totalTopics={countTopics(topicTree)}
              search={topicSearch}
              onSearchChange={setTopicSearch}
              pending={topicTreeQuery.isPending}
              error={topicTreeQuery.isError}
              onRetry={() => void topicTreeQuery.refetch()}
            />
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function PreparationHero({
  trackCount,
  subjectCount,
  topicCount,
}: {
  trackCount: number;
  subjectCount: number;
  topicCount: number | null;
}) {
  return (
    <section className={`${GLASS} relative overflow-hidden rounded-3xl px-6 py-8 sm:px-9 sm:py-10`}>
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(circle at 82% 8%, rgba(37,99,235,.17), transparent 28%), radial-gradient(circle at 96% 92%, rgba(20,184,166,.15), transparent 32%)',
        }}
        aria-hidden
      />
      <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/85 px-3 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="size-3.5" aria-hidden />
            Free preparation library
          </span>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-balance text-slate-950 sm:text-5xl">
            Learn every subject, one topic at a time.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-pretty text-slate-600 sm:text-base">
            Choose your class, open a subject, and follow its topic tree for focused reading
            and exam preparation. No login is required.
          </p>
          <Button asChild className="mt-6 rounded-xl">
            <Link href="#preparation-catalog">
              Browse preparation paths
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="space-y-2.5">
          <HeroStat
            icon={Layers3}
            color="#1e40af"
            tint="#eff6ff"
            value={trackCount > 0 ? String(trackCount) : '—'}
            label="Class paths"
            sub="10th to dropper — pick where you are"
          />
          <HeroStat
            icon={Library}
            color="#0f766e"
            tint="#f0fdfa"
            value={subjectCount > 0 ? String(subjectCount) : '—'}
            label="Subjects"
            sub="Chapter-wise topic trees"
          />
          <HeroStat
            icon={BookOpen}
            color="#6d28d9"
            tint="#f5f3ff"
            value={topicCount === null ? '—' : String(topicCount)}
            label="Study topics"
            sub="Reading notes & PDF materials"
          />
        </div>
      </div>
    </section>
  );
}

function HeroStat({
  icon: Icon,
  color,
  tint,
  value,
  label,
  sub,
}: {
  icon: LucideIcon;
  color: string;
  tint: string;
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-lg">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: tint, color }}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="block truncate text-[11px] text-slate-500">{sub}</span>
      </span>
      <span className="text-2xl font-semibold text-slate-950 tabular-nums">{value}</span>
    </div>
  );
}

function CatalogBreadcrumbs({
  track,
  subject,
}: {
  track: PreparationTrack | null;
  subject: Subject | null;
}) {
  return (
    <nav aria-label="Breadcrumb" className="my-6 overflow-x-auto">
      <ol className="flex min-w-max items-center gap-1.5 text-sm text-slate-500">
        <li>
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 hover:bg-white/60 hover:text-slate-900"
          >
            <Home className="size-3.5" aria-hidden />
            Home
          </Link>
        </li>
        <BreadcrumbSeparator />
        <li>
          <Link
            href="/subjects"
            className={cn(
              'inline-flex min-h-10 items-center rounded-lg px-2 hover:bg-white/60 hover:text-slate-900',
              !track && 'font-semibold text-slate-900',
            )}
            aria-current={!track ? 'page' : undefined}
          >
            Preparation
          </Link>
        </li>
        {track ? (
          <>
            <BreadcrumbSeparator />
            <li>
              <Link
                href={`/subjects/${track.slug}`}
                className={cn(
                  'inline-flex min-h-10 items-center rounded-lg px-2 hover:bg-white/60 hover:text-slate-900',
                  !subject && 'font-semibold text-slate-900',
                )}
                aria-current={!subject ? 'page' : undefined}
              >
                {track.shortTitle}
              </Link>
            </li>
          </>
        ) : null}
        {subject ? (
          <>
            <BreadcrumbSeparator />
            <li>
              <span
                className="inline-flex min-h-10 items-center px-2 font-semibold text-slate-900"
                aria-current="page"
              >
                {subject.name}
              </span>
            </li>
          </>
        ) : null}
      </ol>
    </nav>
  );
}

function BreadcrumbSeparator() {
  return (
    <li aria-hidden>
      <ChevronRight className="size-3.5 text-slate-400" />
    </li>
  );
}

function PreparationTrackGrid({
  tracks,
  pending,
  error,
  onRetry,
}: {
  tracks: PreparationTrack[];
  pending: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-blue-700 uppercase">
            Step 1
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Select your preparation path
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Start with your current class or choose the dropper revision path.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/65 px-3 py-1.5 text-xs font-medium text-slate-600 backdrop-blur-xl">
          <LockOpen className="size-3.5 text-brand-accent" aria-hidden />
          Login-free access
        </span>
      </div>

      {pending ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-72 rounded-2xl bg-white/50" />
          ))}
        </div>
      ) : error ? (
        <CatalogError
          title="Could not load preparation paths"
          description="Check the API connection and try again."
          onRetry={onRetry}
        />
      ) : tracks.length === 0 ? (
        <CatalogEmpty
          icon={Layers3}
          title="No preparation paths published yet"
          description="Preparation paths will appear here after they are published."
        />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tracks.map((track, index) => {
            const iconKey = track.icon?.trim().toLowerCase().replace(/[_\s]+/g, '-') ?? '';
            const Icon = TRACK_ICONS[iconKey] ?? Layers3;
            const hasImage = Boolean(track.icon && /^https?:\/\//.test(track.icon));
            const color = track.color || DEFAULT_TRACK_COLOR;
            const tint = track.tint || DEFAULT_TRACK_TINT;

            return (
              <Reveal key={track.id} delay={index * 0.06} className="h-full">
                <Link
                  href={`/subjects/${track.slug}`}
                  className={`${GLASS} group relative flex h-full flex-col overflow-hidden p-5 text-left transition duration-200 hover:-translate-y-1 hover:bg-white/90 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none`}
                >
                  <div
                    className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                  <span
                    className="flex size-12 items-center justify-center overflow-hidden rounded-2xl shadow-sm"
                    style={{ backgroundColor: tint, color }}
                  >
                    {hasImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={track.icon} alt="" className="size-full object-cover" />
                    ) : (
                      <Icon className="size-6" aria-hidden />
                    )}
                  </span>
                  <p
                    className="mt-5 text-xs font-semibold tracking-[0.14em] uppercase"
                    style={{ color }}
                  >
                    {track.eyebrow || 'Preparation path'}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-950">{track.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                    {track.description || `Open the ${track.shortTitle} preparation library.`}
                  </p>
                  <div className="mt-auto pt-5">
                    {track.focus ? (
                      <p className="mb-3 text-xs text-slate-500">{track.focus}</p>
                    ) : null}
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold"
                      style={{ backgroundColor: tint, color }}
                    >
                      Explore subjects
                      <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PublicSubjectGrid({
  track,
  subjects,
  pending,
  error,
  onRetry,
}: {
  track: PreparationTrack;
  subjects: Subject[];
  pending: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  return (
    <div>
      <CatalogHeading
        step="Step 2"
        title={`${track.shortTitle} subjects`}
        description="Choose a subject to open its complete preparation topic tree."
        backHref="/subjects"
        backLabel="All class paths"
      />

      {pending ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-64 rounded-2xl bg-white/50" />
          ))}
        </div>
      ) : error ? (
        <CatalogError
          title="Could not load subjects"
          description="Check the API connection and try again."
          onRetry={onRetry}
        />
      ) : subjects.length === 0 ? (
        <CatalogEmpty
          icon={Library}
          title="No subjects published yet"
          description="Active subjects will appear here as soon as they are published."
        />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.map((subject, index) => (
            <Reveal key={subject.id} delay={index * 0.06} className="h-full">
              <PublicSubjectCard
                subject={subject}
                href={`/subjects/${track.slug}/${subject.id}`}
              />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

function PublicSubjectCard({
  subject,
  href,
}: {
  subject: Subject;
  href: string;
}) {
  const visual = subjectVisual(subject.code);
  const Icon = SUBJECT_ICONS[subject.code.toUpperCase()] ?? BookOpen;
  const hasImage = Boolean(subject.icon && /^https?:\/\//.test(subject.icon));

  return (
    <Link
      href={href}
      className={`${GLASS} group relative flex h-full flex-col overflow-hidden p-5 text-left transition duration-200 hover:-translate-y-1 hover:bg-white/90 hover:shadow-2xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none`}
    >
      <div
        className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ backgroundColor: visual.color }}
        aria-hidden
      />
      <span
        className="flex size-12 items-center justify-center overflow-hidden rounded-2xl shadow-sm"
        style={{ backgroundColor: visual.tint, color: visual.color }}
      >
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={subject.icon} alt="" className="size-full object-cover" />
        ) : (
          <Icon className="size-6" aria-hidden />
        )}
      </span>
      <p className="mt-5 text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
        {subject.code}
      </p>
      <h3 className="mt-1 text-xl font-semibold text-slate-950">{subject.name}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
        {subject.description ||
          `Open the structured ${subject.name} syllabus and prepare chapter by chapter.`}
      </p>
      <div className="mt-auto pt-5">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold"
          style={{ backgroundColor: visual.tint, color: visual.color }}
        >
          Open topics
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}

function PublicTopicLibrary({
  track,
  subject,
  topics,
  totalTopics,
  search,
  onSearchChange,
  pending,
  error,
  onRetry,
}: {
  track: PreparationTrack;
  subject: Subject;
  topics: TopicTreeNode[];
  totalTopics: number;
  search: string;
  onSearchChange: (value: string) => void;
  pending: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const visual = subjectVisual(subject.code);
  const normalizedSearch = search.trim();

  return (
    <div>
      <CatalogHeading
        step="Step 3"
        title={`${subject.name} preparation`}
        description={`Read the ${track.shortTitle} syllabus in order. Open any chapter to see its topics and study notes.`}
        backHref={`/subjects/${track.slug}`}
        backLabel={`${track.shortTitle} subjects`}
      />

      <section className={`${GLASS} mt-6 overflow-hidden`} aria-labelledby="topic-library-title">
        <header
          className="border-b border-white/70 px-5 py-5 sm:px-6"
          style={{
            background: `linear-gradient(115deg, ${visual.tint}, rgba(255,255,255,.78))`,
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: visual.color }}
              >
                <BookOpen className="size-5" aria-hidden />
              </span>
              <div>
                <p
                  className="text-xs font-semibold tracking-[0.14em] uppercase"
                  style={{ color: visual.color }}
                >
                  {subject.code} reading library
                </p>
                <h2
                  id="topic-library-title"
                  className="text-xl font-semibold tracking-tight text-slate-950"
                >
                  {subject.name} topics
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {totalTopics} published topic{totalTopics === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <Input
                type="search"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search topics"
                aria-label={`Search ${subject.name} topics`}
                className="h-11 rounded-xl border-white/80 bg-white/80 pl-9 shadow-sm"
              />
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-800">
            <span className="font-semibold">How to study:</span> open a chapter, read its
            summary, then continue through the child topics in order.
          </div>

          {pending ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((index) => (
                <Skeleton key={index} className="h-16 rounded-xl bg-white/55" />
              ))}
            </div>
          ) : error ? (
            <CatalogError
              title="Could not load topics"
              description="The public topic library is temporarily unavailable."
              onRetry={onRetry}
            />
          ) : topics.length === 0 ? (
            <CatalogEmpty
              icon={Search}
              title={normalizedSearch ? 'No matching topics' : 'No topics published yet'}
              description={
                normalizedSearch
                  ? 'Try another chapter or topic name.'
                  : 'Preparation topics will appear here after they are published.'
              }
              compact
            />
          ) : (
            <ul className="space-y-2">
              {topics.map((topic, index) => (
                <PublicTopicNode
                  key={topic.id}
                  topic={topic}
                  number={`${index + 1}`}
                  color={visual.color}
                  forceOpen={normalizedSearch.length > 0}
                  trackSlug={track.slug}
                  subjectId={subject.id}
                />
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function PublicTopicNode({
  topic,
  number,
  color,
  forceOpen,
  trackSlug,
  subjectId,
}: {
  topic: TopicTreeNode;
  number: string;
  color: string;
  forceOpen: boolean;
  trackSlug: string;
  subjectId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const open = forceOpen || expanded;
  const hasChildren = topic.children.length > 0;
  const contentId = `topic-${topic.id}`;
  const detailQuery = usePublicTrackTopic(
    trackSlug,
    subjectId,
    topic.id,
    open,
  );
  const savedStudyContent = detailQuery.data?.studyContent;
  const studyContent = savedStudyContent?.trim() ? savedStudyContent : undefined;
  const resources = detailQuery.data?.resources ?? [];

  return (
    <li className="overflow-hidden rounded-xl border border-white/80 bg-white/65 shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/85 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 focus-visible:outline-none"
        aria-expanded={open}
        aria-controls={contentId}
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
          style={{ backgroundColor: `${color}14`, color }}
        >
          {number}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-slate-800">
            {topic.topicName}
          </span>
          <span className="mt-0.5 block text-xs text-slate-500">
            {hasChildren
              ? `${topic.children.length} section${topic.children.length === 1 ? '' : 's'}`
              : 'Reading topic'}
          </span>
        </span>
        <ChevronRight
          className={cn(
            'size-4 shrink-0 text-slate-400 transition-transform',
            open && 'rotate-90',
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div id={contentId} className="border-t border-white/80 bg-slate-50/45 px-4 py-4 sm:px-5">
          {detailQuery.isPending ? (
            <div className="space-y-2" aria-label={`Loading ${topic.topicName} study materials`}>
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-4/5 rounded-md" />
            </div>
          ) : detailQuery.isError ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2.5">
              <p className="text-xs text-amber-800">
                The study text and PDF materials could not be loaded.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-lg bg-white"
                onClick={() => void detailQuery.refetch()}
              >
                <RotateCw className="size-3.5" aria-hidden />
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <article className="flex gap-3">
                <BookOpen className="mt-0.5 size-4 shrink-0" style={{ color }} aria-hidden />
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Study notes
                  </p>
                  <div className="mt-1 text-sm leading-6 wrap-break-word whitespace-pre-wrap text-slate-600">
                    {studyContent ||
                      topic.description?.trim() ||
                      'Study material for this topic is being prepared. You can still open the sections below to continue browsing.'}
                  </div>
                </div>
              </article>

              {resources.length > 0 ? (
                <section
                  className="rounded-xl border border-slate-200 bg-white/75 p-3"
                  aria-label={`${topic.topicName} PDF downloads`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <FileText className="size-4 text-red-600" aria-hidden />
                    <h3 className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                      PDF materials
                    </h3>
                  </div>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {resources.map((resource) => (
                      <li key={resource.id}>
                        <a
                          href={getPublicTopicResourceDownloadUrl(
                            trackSlug,
                            subjectId,
                            topic.id,
                            resource.id,
                          )}
                          className="group flex min-h-12 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50/45 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                          aria-label={`Download ${resource.title || resource.originalName} PDF`}
                        >
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                            <FileText className="size-3.5" aria-hidden />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-medium text-slate-700">
                              {resource.title || resource.originalName}
                            </span>
                            <span className="block text-[10px] text-slate-500">
                              PDF · {formatFileSize(resource.bytes)}
                            </span>
                          </span>
                          <Download
                            className="size-3.5 shrink-0 text-slate-400 transition group-hover:text-blue-600"
                            aria-hidden
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          )}

          {hasChildren ? (
            <ul className="mt-4 space-y-2 border-l border-slate-200 pl-3 sm:pl-4">
              {topic.children.map((child, index) => (
                <PublicTopicNode
                  key={child.id}
                  topic={child}
                  number={`${number}.${index + 1}`}
                  color={color}
                  forceOpen={forceOpen}
                  trackSlug={trackSlug}
                  subjectId={subjectId}
                />
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function CatalogHeading({
  step,
  title,
  description,
  backHref,
  backLabel,
}: {
  step: string;
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-blue-700 uppercase">{step}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
      </div>
      <Button asChild variant="outline" className="rounded-xl border-white/80 bg-white/70">
        <Link href={backHref}>
          <ArrowLeft className="size-4" aria-hidden />
          {backLabel}
        </Link>
      </Button>
    </div>
  );
}

function CatalogRouteMissing({
  title,
  description,
  href,
  linkLabel,
}: {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className={`${GLASS} p-10 text-center`}>
      <Library className="mx-auto size-8 text-slate-300" aria-hidden />
      <h2 className="mt-3 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      <Button asChild variant="outline" className="mt-5 rounded-xl bg-white/70">
        <Link href={href}>
          <ArrowLeft className="size-4" aria-hidden />
          {linkLabel}
        </Link>
      </Button>
    </div>
  );
}

function CatalogError({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry: () => void;
}) {
  return (
    <div className={`${GLASS} mt-6 p-10 text-center`}>
      <RotateCw className="mx-auto size-8 text-slate-300" aria-hidden />
      <h3 className="mt-3 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      <Button variant="outline" className="mt-4 rounded-xl bg-white/70" onClick={onRetry}>
        <RotateCw className="size-4" aria-hidden />
        Try again
      </Button>
    </div>
  );
}

function CatalogEmpty({
  icon: Icon,
  title,
  description,
  compact = false,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'mt-6 rounded-2xl border border-dashed border-slate-200 bg-white/45 text-center',
        compact ? 'p-8' : 'p-12',
      )}
    >
      <Icon className="mx-auto size-8 text-slate-300" aria-hidden />
      <h3 className="mt-3 text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
  );
}
