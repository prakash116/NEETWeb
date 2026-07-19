import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  archiveQuestion,
  createQuestion,
  listQuestions,
  updateQuestion,
  type QuestionListParams,
  type QuestionPayload,
} from '@/features/questions/api';
import {
  archiveSubject,
  createSubject,
  updateSubject,
  type SubjectPayload,
} from '@/features/subjects/api';
import {
  archiveTopic,
  createTopic,
  getTopicTree,
  updateTopic,
  type TopicPayload,
  type TopicUpdatePayload,
} from '@/features/topics/api';
import { ApiError } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { getAdminDashboard, listAdminLogs } from './api';

export function useAdminDashboard(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.dashboard.admin,
    queryFn: getAdminDashboard,
    enabled,
  });
}

export function useAdminLogs(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.adminLogs.list({ page: 1, limit: 8 }),
    queryFn: () => listAdminLogs({ page: 1, limit: 8 }),
    enabled,
  });
}

export function useTopicTree(subjectId: string | null) {
  return useQuery({
    queryKey: queryKeys.topics.tree(subjectId ?? 'none'),
    queryFn: () => getTopicTree(subjectId as string),
    enabled: subjectId !== null,
  });
}

function errorToast(error: unknown, fallback: string) {
  toast.error(error instanceof ApiError ? error.message : fallback);
}

function useContentInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.subjects.root });
    void queryClient.invalidateQueries({ queryKey: queryKeys.topics.root });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.admin });
  };
}

export function useCreateSubject() {
  const invalidate = useContentInvalidation();
  return useMutation({
    mutationFn: (payload: SubjectPayload) => createSubject(payload),
    onSuccess: (subject) => {
      invalidate();
      toast.success(`Subject "${subject.name}" created`);
    },
    onError: (error) => errorToast(error, 'Could not create subject'),
  });
}

export function useUpdateSubject() {
  const invalidate = useContentInvalidation();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SubjectPayload> }) =>
      updateSubject(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success('Subject updated');
    },
    onError: (error) => errorToast(error, 'Could not update subject'),
  });
}

export function useArchiveSubject() {
  const invalidate = useContentInvalidation();
  return useMutation({
    mutationFn: (id: string) => archiveSubject(id),
    onSuccess: () => {
      invalidate();
      toast.success('Subject archived');
    },
    onError: (error) => errorToast(error, 'Could not archive subject'),
  });
}

export function useCreateTopic() {
  const invalidate = useContentInvalidation();
  return useMutation({
    mutationFn: (payload: TopicPayload) => createTopic(payload),
    onSuccess: (topic) => {
      invalidate();
      toast.success(`Topic "${topic.topicName}" created`);
    },
    onError: (error) => errorToast(error, 'Could not create topic'),
  });
}

export function useUpdateTopic() {
  const invalidate = useContentInvalidation();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TopicUpdatePayload }) =>
      updateTopic(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success('Topic updated');
    },
    onError: (error) => errorToast(error, 'Could not update topic'),
  });
}

export function useQuestionsList(params: QuestionListParams, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.questions.list(params as Record<string, unknown>),
    queryFn: () => listQuestions(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useCreateQuestion() {
  const invalidate = useContentInvalidation();
  return useMutation({
    mutationFn: (payload: QuestionPayload) => createQuestion(payload),
    onSuccess: () => {
      invalidate();
      toast.success('Question created');
    },
    onError: (error) => errorToast(error, 'Could not create question'),
  });
}

export function useUpdateQuestion() {
  const invalidate = useContentInvalidation();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<QuestionPayload> }) =>
      updateQuestion(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success('Question updated');
    },
    onError: (error) => errorToast(error, 'Could not update question'),
  });
}

export function useArchiveQuestion() {
  const invalidate = useContentInvalidation();
  return useMutation({
    mutationFn: (id: string) => archiveQuestion(id),
    onSuccess: () => {
      invalidate();
      toast.success('Question archived');
    },
    onError: (error) => errorToast(error, 'Could not archive question'),
  });
}

export function useArchiveTopic() {
  const invalidate = useContentInvalidation();
  return useMutation({
    mutationFn: (id: string) => archiveTopic(id),
    onSuccess: () => {
      invalidate();
      toast.success('Topic archived');
    },
    onError: (error) => errorToast(error, 'Could not archive topic'),
  });
}
