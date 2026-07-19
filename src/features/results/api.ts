import { api } from '@/lib/api-client';
import type { ListQuery, Paginated } from '@/types/api';
import type { ResultSummary } from '@/types/entities';

export function listResults(params: ListQuery = {}): Promise<Paginated<ResultSummary>> {
  return api.get<Paginated<ResultSummary>>('/results', { params });
}
