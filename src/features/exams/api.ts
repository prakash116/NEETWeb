import { api, ApiError } from '@/lib/api-client';
import type { ListQuery, Paginated } from '@/types/api';
import type {
  AnswerOption,
  AttemptSubmitResult,
  ClientExamEventType,
  Exam,
  ExamAttempt,
  ExamEventAck,
  SavedAnswer,
} from '@/types/entities';

export interface ExamListParams extends ListQuery {
  subjectId?: string;
  status?: string;
}

/** Students receive published exams only; admins see every status. */
export function listExams(params: ExamListParams = {}): Promise<Paginated<Exam>> {
  return api.get<Paginated<Exam>>('/exams', { params });
}

// ───────────────────────── Exams (admin) ─────────────────────────

export interface ExamPayload {
  examCode: string;
  examName: string;
  subjectId: string;
  topicIds: string[];
  totalQuestions: number;
  marksPerQuestion: number;
  negativeMarks: number;
  /** Minutes per question (server default 5). */
  questionTime?: number;
  passingMarks: number;
  instructions: string;
}

export function createExam(payload: ExamPayload): Promise<Exam> {
  return api.post<Exam>('/exams', payload);
}

export function updateExam(id: string, payload: Partial<ExamPayload>): Promise<Exam> {
  return api.patch<Exam>(`/exams/${id}`, payload);
}

/** Validates the active question pool server-side before going live. */
export function publishExam(id: string): Promise<Exam> {
  return api.patch<Exam>(`/exams/${id}/publish`);
}

export function unpublishExam(id: string): Promise<Exam> {
  return api.patch<Exam>(`/exams/${id}/unpublish`);
}

/** Server rejects deleting an exam that already has student attempts. */
export function deleteExam(id: string): Promise<null> {
  return api.delete<null>(`/exams/${id}`);
}

// ───────────────────────── Attempts (student) ─────────────────────────

export function startExam(examId: string): Promise<ExamAttempt> {
  return api.post<ExamAttempt>('/exam-attempts/start', { examId });
}

/** Resolves to null when the student has no exam in progress (server 404). */
export async function getActiveAttempt(): Promise<ExamAttempt | null> {
  try {
    return await api.get<ExamAttempt>('/exam-attempts/active');
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export interface AutosavePayload {
  questionId: string;
  selectedAnswer: AnswerOption | null;
  /** Cumulative seconds spent on this question. */
  timeTaken: number;
  /** Monotonically increasing per-question revision, starting at 1. */
  version: number;
}

export function autosaveAnswer(attemptId: string, payload: AutosavePayload): Promise<SavedAnswer> {
  return api.patch<SavedAnswer>(`/exam-attempts/${attemptId}/answers`, payload);
}

export interface ExamEventPayload {
  type: ClientExamEventType;
  clientEventId: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export function recordExamEvent(
  attemptId: string,
  payload: ExamEventPayload,
): Promise<ExamEventAck> {
  return api.post<ExamEventAck>(`/exam-attempts/${attemptId}/events`, payload);
}

export function submitAttempt(attemptId: string): Promise<AttemptSubmitResult> {
  return api.post<AttemptSubmitResult>(`/exam-attempts/${attemptId}/submit`);
}
