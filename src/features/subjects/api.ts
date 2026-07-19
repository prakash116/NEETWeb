import { api } from '@/lib/api-client';
import type { ListQuery, Paginated } from '@/types/api';
import type { EntityStatus, Subject } from '@/types/entities';

export interface SubjectPayload {
  name: string;
  code: string;
  description?: string;
  icon?: string;
  status?: EntityStatus;
}

export function listSubjects(params: ListQuery = {}): Promise<Paginated<Subject>> {
  return api.get<Paginated<Subject>>('/subjects', { params });
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
