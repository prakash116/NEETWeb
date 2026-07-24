import { api } from '@/lib/api-client';
import type { ListQuery, Paginated } from '@/types/api';
import type {
  AccountStatus,
  AdminAnalytics,
  AdminDashboardStats,
  AdminLog,
  EntityStatus,
  PreparationTrack,
  StudentDetail,
  User,
  UserRole,
} from '@/types/entities';

export function getAdminDashboard(): Promise<AdminDashboardStats> {
  return api.get<AdminDashboardStats>('/admin/dashboard');
}

export function getAdminAnalytics(): Promise<AdminAnalytics> {
  return api.get<AdminAnalytics>('/admin/dashboard/analytics');
}

/** Authenticated catalog used by subject/topic assignment forms. */
export function listPreparationTracks(): Promise<PreparationTrack[]> {
  return api.get<PreparationTrack[]>('/preparation-tracks');
}

/** Mirrors `CreatePreparationTrackDto`. */
export interface PreparationTrackPayload {
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow?: string;
  description?: string;
  focus?: string;
  /** Icon key (school, book-open, graduation-cap, compass) or an image URL. */
  icon?: string;
  color?: string;
  tint?: string;
  order?: number;
  status?: EntityStatus;
}

export function createPreparationTrack(
  payload: PreparationTrackPayload,
): Promise<PreparationTrack> {
  return api.post<PreparationTrack>('/preparation-tracks', payload);
}

export function updatePreparationTrack(
  id: string,
  payload: Partial<PreparationTrackPayload>,
): Promise<PreparationTrack> {
  return api.patch<PreparationTrack>(`/preparation-tracks/${id}`, payload);
}

/** DELETE archives (status → inactive); restore via update({status:'active'}). */
export function archivePreparationTrack(id: string): Promise<PreparationTrack> {
  return api.delete<PreparationTrack>(`/preparation-tracks/${id}`);
}

export function listAdminLogs(params: ListQuery = {}): Promise<Paginated<AdminLog>> {
  return api.get<Paginated<AdminLog>>('/admin/logs', { params });
}

export interface UserListParams extends ListQuery {
  role?: UserRole;
  accountStatus?: AccountStatus;
  /** Email or student ID search. */
  search?: string;
}

export function listUsers(params: UserListParams = {}): Promise<Paginated<User>> {
  return api.get<Paginated<User>>('/users', { params });
}

export function updateAccountStatus(id: string, accountStatus: AccountStatus): Promise<User> {
  return api.patch<User>(`/users/${id}/status`, { accountStatus });
}

export function getStudentDetail(id: string): Promise<StudentDetail> {
  return api.get<StudentDetail>(`/users/${id}/student-detail`);
}
