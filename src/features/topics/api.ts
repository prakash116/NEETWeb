import { api } from '@/lib/api-client';
import type { EntityStatus, TopicTreeNode, Topic } from '@/types/entities';

export interface TopicPayload {
  subjectId: string;
  parentTopicId?: string | null;
  topicName: string;
  description?: string;
  order?: number;
  status?: EntityStatus;
}

export type TopicUpdatePayload = Partial<Omit<TopicPayload, 'subjectId'>>;

/** Full hierarchy for a subject, inactive topics included (admin view). */
export function getTopicTree(subjectId: string): Promise<TopicTreeNode[]> {
  return api.get<TopicTreeNode[]>(`/topics/tree/${subjectId}`);
}

export function createTopic(payload: TopicPayload): Promise<Topic> {
  return api.post<Topic>('/topics', payload);
}

export function updateTopic(id: string, payload: TopicUpdatePayload): Promise<Topic> {
  return api.patch<Topic>(`/topics/${id}`, payload);
}

/** DELETE archives; the server rejects archiving parents with active children. */
export function archiveTopic(id: string): Promise<Topic> {
  return api.delete<Topic>(`/topics/${id}`);
}
