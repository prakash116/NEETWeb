import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createExam,
  deleteExam,
  listExams,
  publishExam,
  unpublishExam,
  updateExam,
  type ExamListParams,
  type ExamPayload,
} from '@/features/exams/api';
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
  deleteTopicResource,
  getTopic,
  getTopicResourceDownload,
  getTopicStats,
  getTopicTree,
  uploadTopicResource,
  updateTopic,
  type TopicPayload,
  type TopicUpdatePayload,
} from '@/features/topics/api';
import { ApiError } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { AccountStatus } from '@/types/entities';
import {
  archivePreparationTrack,
  createPreparationTrack,
  getAdminAnalytics,
  getAdminDashboard,
  getStudentDetail,
  listAdminLogs,
  listPreparationTracks,
  listUsers,
  updateAccountStatus,
  updatePreparationTrack,
  type PreparationTrackPayload,
  type UserListParams,
} from './api';

export function useAdminDashboard(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.dashboard.admin,
    queryFn: getAdminDashboard,
    enabled,
  });
}

export function useAdminAnalytics(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.dashboard.adminAnalytics,
    queryFn: getAdminAnalytics,
    enabled,
  });
}

export function usePreparationTracks(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.preparationTracks.list,
    queryFn: listPreparationTracks,
    enabled,
    staleTime: 300_000,
  });
}

function useTrackInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.preparationTracks.root });
    void queryClient.invalidateQueries({ queryKey: queryKeys.publicCatalog.root });
  };
}

export function useCreateTrack() {
  const invalidate = useTrackInvalidation();
  return useMutation({
    mutationFn: (payload: PreparationTrackPayload) => createPreparationTrack(payload),
    onSuccess: (track) => {
      invalidate();
      toast.success(`Preparation path "${track.title}" created`);
    },
    onError: (error) => errorToast(error, 'Could not create the preparation path'),
  });
}

export function useUpdateTrack() {
  const invalidate = useTrackInvalidation();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<PreparationTrackPayload> }) =>
      updatePreparationTrack(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success('Preparation path updated');
    },
    onError: (error) => errorToast(error, 'Could not update the preparation path'),
  });
}

export function useArchiveTrack() {
  const invalidate = useTrackInvalidation();
  return useMutation({
    mutationFn: (id: string) => archivePreparationTrack(id),
    onSuccess: () => {
      invalidate();
      toast.success('Preparation path archived');
    },
    onError: (error) => errorToast(error, 'Could not archive the preparation path'),
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

export function useTopicDetail(topicId: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.topics.detail(topicId ?? 'none'),
    queryFn: () => getTopic(topicId as string),
    enabled: enabled && topicId !== null,
  });
}

export function useAdminExams(params: ExamListParams, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.exams.list(params as Record<string, unknown>),
    queryFn: () => listExams(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

function useExamInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.exams.root });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.admin });
  };
}

export function useCreateExam() {
  const invalidate = useExamInvalidation();
  return useMutation({
    mutationFn: (payload: ExamPayload) => createExam(payload),
    onSuccess: (exam) => {
      invalidate();
      toast.success(`Exam "${exam.examName}" created as draft`);
    },
    onError: (error) => errorToast(error, 'Could not create the exam'),
  });
}

export function useUpdateExam() {
  const invalidate = useExamInvalidation();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ExamPayload> }) =>
      updateExam(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success('Exam updated');
    },
    onError: (error) => errorToast(error, 'Could not update the exam'),
  });
}

export function usePublishExam() {
  const invalidate = useExamInvalidation();
  return useMutation({
    mutationFn: (id: string) => publishExam(id),
    onSuccess: (exam) => {
      invalidate();
      toast.success(`"${exam.examName}" is now live for students`);
    },
    onError: (error) => errorToast(error, 'Could not publish the exam'),
  });
}

export function useUnpublishExam() {
  const invalidate = useExamInvalidation();
  return useMutation({
    mutationFn: (id: string) => unpublishExam(id),
    onSuccess: () => {
      invalidate();
      toast.success('Exam unpublished');
    },
    onError: (error) => errorToast(error, 'Could not unpublish the exam'),
  });
}

export function useDeleteExam() {
  const invalidate = useExamInvalidation();
  return useMutation({
    mutationFn: (id: string) => deleteExam(id),
    onSuccess: () => {
      invalidate();
      toast.success('Exam deleted');
    },
    onError: (error) => errorToast(error, 'Could not delete the exam'),
  });
}

export function useUsersList(params: UserListParams, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.users.list(params as Record<string, unknown>),
    queryFn: () => listUsers(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useStudentDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.users.detail(id ?? 'none'),
    queryFn: () => getStudentDetail(id as string),
    enabled: id !== null,
  });
}

export function useUpdateAccountStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accountStatus }: { id: string; accountStatus: AccountStatus }) =>
      updateAccountStatus(id, accountStatus),
    onSuccess: (user) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.root });
      toast.success(
        user.accountStatus === 'active' ? 'Account unblocked' : `Account ${user.accountStatus}`,
      );
    },
    onError: (error) => errorToast(error, 'Could not update the account status'),
  });
}

export function useTopicStats(subjectId: string | null) {
  return useQuery({
    queryKey: queryKeys.topics.stats(subjectId ?? 'none'),
    queryFn: () => getTopicStats(subjectId as string),
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
    void queryClient.invalidateQueries({ queryKey: queryKeys.publicCatalog.root });
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

function useTopicResourceInvalidation() {
  const queryClient = useQueryClient();
  return (topicId: string) => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.topics.detail(topicId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.publicCatalog.root });
  };
}

export function useUploadTopicResource() {
  const invalidate = useTopicResourceInvalidation();
  return useMutation({
    mutationFn: ({ topicId, file, order }: { topicId: string; file: File; order?: number }) =>
      uploadTopicResource(topicId, file, { order }),
    onSuccess: (_resource, variables) => invalidate(variables.topicId),
    onError: (error) => errorToast(error, 'Could not upload the PDF'),
  });
}

export function useDeleteTopicResource() {
  const invalidate = useTopicResourceInvalidation();
  return useMutation({
    mutationFn: ({ topicId, resourceId }: { topicId: string; resourceId: string }) =>
      deleteTopicResource(topicId, resourceId),
    onSuccess: (_result, variables) => {
      invalidate(variables.topicId);
      toast.success('PDF removed');
    },
    onError: (error) => errorToast(error, 'Could not remove the PDF'),
  });
}

export function useTopicResourceDownload() {
  return useMutation({
    mutationFn: ({ topicId, resourceId }: { topicId: string; resourceId: string }) =>
      getTopicResourceDownload(topicId, resourceId),
    onSuccess: ({ url, fileName }) => {
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      anchor.rel = 'noopener';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    },
    onError: (error) => errorToast(error, 'Could not prepare the PDF download'),
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
