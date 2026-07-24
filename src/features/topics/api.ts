import { api } from '@/lib/api-client';
import type {
  EntityStatus,
  Topic,
  TopicDetail,
  TopicResource,
  TopicTreeNode,
} from '@/types/entities';

export interface TopicPayload {
  subjectId: string;
  parentTopicId?: string | null;
  topicName: string;
  description?: string;
  studyContent?: string;
  preparationTrackIds: string[];
  order?: number;
  status?: EntityStatus;
}

export type TopicUpdatePayload = Partial<Omit<TopicPayload, 'subjectId'>>;

/** Full hierarchy for a subject, inactive topics included (admin view). */
export function getTopicTree(subjectId: string): Promise<TopicTreeNode[]> {
  return api.get<TopicTreeNode[]>(`/topics/tree/${subjectId}`);
}

/** Admin-only full topic content, including preparation text and PDF resources. */
export function getTopic(id: string): Promise<TopicDetail> {
  return api.get<TopicDetail>(`/topics/${encodeURIComponent(id)}`);
}

export interface TopicStats {
  topicId: string;
  questionCount: number;
  studentsAttempted: number;
}

/** Admin only: per-topic question and distinct-student-attempt counts. */
export function getTopicStats(subjectId: string): Promise<TopicStats[]> {
  return api.get<TopicStats[]>(`/topics/stats/${subjectId}`);
}

export function createTopic(payload: TopicPayload): Promise<TopicDetail> {
  return api.post<TopicDetail>('/topics', payload);
}

export function updateTopic(id: string, payload: TopicUpdatePayload): Promise<TopicDetail> {
  return api.patch<TopicDetail>(`/topics/${encodeURIComponent(id)}`, payload);
}

/** DELETE archives; the server rejects archiving parents with active children. */
export function archiveTopic(id: string): Promise<Topic> {
  return api.delete<Topic>(`/topics/${id}`);
}

export interface UploadTopicResourceOptions {
  title?: string;
  order?: number;
}

export interface TopicResourceDownload {
  url: string;
  fileName: string;
}

export function listTopicResources(topicId: string): Promise<TopicResource[]> {
  return api.get<TopicResource[]>(`/topics/${encodeURIComponent(topicId)}/resources`);
}

/** One PDF per multipart request; callers may sequence multiple selected files. */
export function uploadTopicResource(
  topicId: string,
  file: File,
  options: UploadTopicResourceOptions = {},
): Promise<TopicResource> {
  const formData = new FormData();
  formData.append('file', file);
  if (options.title?.trim()) formData.append('title', options.title.trim());
  if (options.order !== undefined) formData.append('order', String(options.order));
  return api.post<TopicResource>(
    `/topics/${encodeURIComponent(topicId)}/resources`,
    formData,
  );
}

export function updateTopicResource(
  topicId: string,
  resourceId: string,
  payload: { title?: string; order?: number },
): Promise<TopicResource> {
  return api.patch<TopicResource>(
    `/topics/${encodeURIComponent(topicId)}/resources/${encodeURIComponent(resourceId)}`,
    payload,
  );
}

export function deleteTopicResource(topicId: string, resourceId: string): Promise<null> {
  return api.delete<null>(
    `/topics/${encodeURIComponent(topicId)}/resources/${encodeURIComponent(resourceId)}`,
  );
}

/** Returns a short-lived provider URL after an authenticated admin request. */
export function getTopicResourceDownload(
  topicId: string,
  resourceId: string,
): Promise<TopicResourceDownload> {
  return api.get<TopicResourceDownload>(
    `/topics/${encodeURIComponent(topicId)}/resources/${encodeURIComponent(resourceId)}/download-url`,
  );
}
