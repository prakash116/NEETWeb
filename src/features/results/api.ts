import { api } from '@/lib/api-client';
import type { ResultDetail, ResultSummary } from '@/types/entities';

/**
 * `GET /results` returns the student's completed attempts as a PLAIN ARRAY
 * (newest first, capped at 100 server-side) — it is not paginated.
 */
export function listResults(): Promise<ResultSummary[]> {
  return api.get<ResultSummary[]>('/results');
}

export function getResult(id: string): Promise<ResultDetail> {
  return api.get<ResultDetail>(`/results/${id}`);
}
