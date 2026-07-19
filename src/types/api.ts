/**
 * Shared API transport types.
 *
 * Every backend endpoint responds with the same envelope
 * (`Server/src/common/interceptors/response.interceptor.ts`), and every
 * paginated list uses `{ items, meta }`
 * (`Server/src/common/utils/pagination.util.ts`).
 */

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

export type SortOrder = 'asc' | 'desc';

/** Base query accepted by every paginated list endpoint. */
export interface ListQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}
