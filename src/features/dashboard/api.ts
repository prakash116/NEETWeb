import { api } from '@/lib/api-client';
import type { StudentDashboardStats } from '@/types/entities';

export function getStudentDashboard(): Promise<StudentDashboardStats> {
  return api.get<StudentDashboardStats>('/student/dashboard');
}
