import { api } from '@/lib/api-client';
import type { ListQuery, Paginated } from '@/types/api';
import type {
  AnswerOption,
  Question,
  QuestionDifficulty,
  QuestionStatus,
} from '@/types/entities';

export interface QuestionOptionPayload {
  key: AnswerOption;
  text: string;
}

/** Mirrors `CreateQuestionDto` — exactly 4 options with unique A–D keys. */
export interface QuestionPayload {
  subjectId: string;
  topicId: string;
  difficulty: QuestionDifficulty;
  question: string;
  options: QuestionOptionPayload[];
  correctAnswer: AnswerOption;
  explanation?: string;
  marks?: number;
  negativeMarks?: number;
  status?: QuestionStatus;
}

export interface QuestionListParams extends ListQuery {
  subjectId?: string;
  topicId?: string;
  difficulty?: QuestionDifficulty;
  status?: QuestionStatus;
  search?: string;
}

export function listQuestions(params: QuestionListParams = {}): Promise<Paginated<Question>> {
  return api.get<Paginated<Question>>('/questions', { params });
}

export function createQuestion(payload: QuestionPayload): Promise<Question> {
  return api.post<Question>('/questions', payload);
}

export function updateQuestion(id: string, payload: Partial<QuestionPayload>): Promise<Question> {
  return api.patch<Question>(`/questions/${id}`, payload);
}

/** DELETE archives; restore via update({status:'active'}). */
export function archiveQuestion(id: string): Promise<Question> {
  return api.delete<Question>(`/questions/${id}`);
}
