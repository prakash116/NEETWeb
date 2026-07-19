import { api } from '@/lib/api-client';
import type { ListQuery, Paginated } from '@/types/api';
import type { Exam } from '@/types/entities';

/** Students receive published exams only. */
export function listExams(params: ListQuery = {}): Promise<Paginated<Exam>> {
  return api.get<Paginated<Exam>>('/exams', { params });
}
