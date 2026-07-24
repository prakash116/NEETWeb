import { api } from '@/lib/api-client';
import type { ListQuery, Paginated } from '@/types/api';
import type {
  EntityStatus,
  PreparationTrack,
  Subject,
  TopicDetail,
  TopicTreeNode,
} from '@/types/entities';
import { env } from '@/lib/env';

export interface SubjectPayload {
  name: string;
  code: string;
  description?: string;
  icon?: string;
  preparationTrackIds: string[];
  status?: EntityStatus;
}

export function listSubjects(params: ListQuery = {}): Promise<Paginated<Subject>> {
  return api.get<Paginated<Subject>>('/subjects', { params });
}

/** Public catalog read. Returns active preparation tracks in display order. */
export function listPublicPreparationTracks(): Promise<PreparationTrack[]> {
  return api.get<PreparationTrack[]>('/public/catalog/tracks');
}

/** Public catalog read. Returns active subjects assigned to one preparation track. */
export function listPublicTrackSubjects(
  trackSlug: string,
  params: ListQuery = {},
): Promise<Paginated<Subject>> {
  const slug = encodeURIComponent(trackSlug);
  return api.get<Paginated<Subject>>(`/public/catalog/tracks/${slug}/subjects`, { params });
}

/** Public catalog read. Returns the active, track-scoped topic hierarchy. */
export function getPublicTrackTopicTree(
  trackSlug: string,
  subjectId: string,
): Promise<TopicTreeNode[]> {
  const slug = encodeURIComponent(trackSlug);
  const id = encodeURIComponent(subjectId);
  return api.get<TopicTreeNode[]>(
    `/public/catalog/tracks/${slug}/subjects/${id}/topics`,
  );
}

/** Public, track-scoped full topic content and downloadable PDF metadata. */
export function getPublicTrackTopic(
  trackSlug: string,
  subjectId: string,
  topicId: string,
): Promise<TopicDetail> {
  const slug = encodeURIComponent(trackSlug);
  const subject = encodeURIComponent(subjectId);
  const topic = encodeURIComponent(topicId);
  return api.get<TopicDetail>(
    `/public/catalog/tracks/${slug}/subjects/${subject}/topics/${topic}`,
  );
}

/** Public download stays track-scoped so the backend can enforce catalog visibility. */
export function getPublicTopicResourceDownloadUrl(
  trackSlug: string,
  subjectId: string,
  topicId: string,
  resourceId: string,
): string {
  const path = [
    '/public/catalog/tracks',
    encodeURIComponent(trackSlug),
    'subjects',
    encodeURIComponent(subjectId),
    'topics',
    encodeURIComponent(topicId),
    'resources',
    encodeURIComponent(resourceId),
    'download',
  ].join('/');
  return `${env.apiUrl}${path}`;
}

export function createSubject(payload: SubjectPayload): Promise<Subject> {
  return api.post<Subject>('/subjects', payload);
}

export function updateSubject(id: string, payload: Partial<SubjectPayload>): Promise<Subject> {
  return api.patch<Subject>(`/subjects/${id}`, payload);
}

/** DELETE archives (status → inactive); restore via update({status:'active'}). */
export function archiveSubject(id: string): Promise<Subject> {
  return api.delete<Subject>(`/subjects/${id}`);
}
