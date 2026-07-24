import { useQuery } from '@tanstack/react-query';
import { listExams } from '@/features/exams/api';
import { listResults } from '@/features/results/api';
import { listSubjects } from '@/features/subjects/api';
import { queryKeys } from '@/lib/query-keys';
import { getStudentDashboard } from './api';

export function useStudentDashboard(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.dashboard.student,
    queryFn: getStudentDashboard,
    enabled,
  });
}

export function useRecentResults(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.results.list(),
    queryFn: listResults,
    enabled,
  });
}

export function usePublishedExams(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.exams.list({ page: 1, limit: 60 }),
    queryFn: () => listExams({ page: 1, limit: 60 }),
    enabled,
  });
}

export function useSubjects(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.subjects.list({ page: 1, limit: 50 }),
    queryFn: () => listSubjects({ page: 1, limit: 50 }),
    enabled,
    staleTime: 300_000,
  });
}
