import { api } from '@/lib/api-client';
import type { ListQuery, Paginated } from '@/types/api';
import type { AdminDashboardStats, AdminLog } from '@/types/entities';

export function getAdminDashboard(): Promise<AdminDashboardStats> {
  return api.get<AdminDashboardStats>('/admin/dashboard');
}

export function listAdminLogs(params: ListQuery = {}): Promise<Paginated<AdminLog>> {
  return api.get<Paginated<AdminLog>>('/admin/logs', { params });
}
