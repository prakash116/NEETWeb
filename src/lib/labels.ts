/**
 * Human labels and badge tones for every backend enum, plus the fixed
 * subject color assignments (FRONTEND-DESIGN.md §2.3 — validated palette;
 * a subject keeps its color everywhere, never re-assigned).
 */

import type {
  AccountStatus,
  AnswerOption,
  EntityStatus,
  ExamAttemptStatus,
  ExamOutcome,
  ExamStatus,
  QuestionDifficulty,
  QuestionImportStatus,
  QuestionStatus,
} from '@/types/entities';

export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'destructive';

export interface StatusMeta {
  label: string;
  tone: StatusTone;
}

export const ACCOUNT_STATUS_META: Record<AccountStatus, StatusMeta> = {
  active: { label: 'Active', tone: 'success' },
  blocked: { label: 'Blocked', tone: 'destructive' },
  suspended: { label: 'Suspended', tone: 'warning' },
};

export const ENTITY_STATUS_META: Record<EntityStatus, StatusMeta> = {
  active: { label: 'Active', tone: 'success' },
  inactive: { label: 'Inactive', tone: 'neutral' },
};

export const EXAM_STATUS_META: Record<ExamStatus, StatusMeta> = {
  draft: { label: 'Draft', tone: 'neutral' },
  published: { label: 'Published', tone: 'success' },
  unpublished: { label: 'Unpublished', tone: 'warning' },
  archived: { label: 'Archived', tone: 'neutral' },
};

export const ATTEMPT_STATUS_META: Record<ExamAttemptStatus, StatusMeta> = {
  active: { label: 'In progress', tone: 'info' },
  submitted: { label: 'Submitted', tone: 'success' },
  failed: { label: 'Failed', tone: 'destructive' },
};

export const EXAM_OUTCOME_META: Record<ExamOutcome, StatusMeta> = {
  pending: { label: 'Pending', tone: 'neutral' },
  passed: { label: 'Passed', tone: 'success' },
  failed: { label: 'Failed', tone: 'destructive' },
};

export const DIFFICULTY_META: Record<QuestionDifficulty, StatusMeta> = {
  easy: { label: 'Easy', tone: 'success' },
  medium: { label: 'Medium', tone: 'warning' },
  hard: { label: 'Hard', tone: 'destructive' },
};

export const QUESTION_STATUS_META: Record<QuestionStatus, StatusMeta> = {
  active: { label: 'Active', tone: 'success' },
  inactive: { label: 'Inactive', tone: 'neutral' },
  archived: { label: 'Archived', tone: 'neutral' },
};

export const IMPORT_STATUS_META: Record<QuestionImportStatus, StatusMeta> = {
  pending: { label: 'Pending', tone: 'neutral' },
  processing: { label: 'Processing', tone: 'info' },
  completed: { label: 'Completed', tone: 'success' },
  failed: { label: 'Failed', tone: 'destructive' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

export const ANSWER_OPTION_LABELS: Record<AnswerOption, string> = {
  A: 'Option A',
  B: 'Option B',
  C: 'Option C',
  D: 'Option D',
};

// ── Subject identity colors (fixed categorical order, CVD-validated) ──

export interface SubjectVisual {
  /** Series/fill color for charts and icon tiles. */
  color: string;
  /** Light tint for card/chip backgrounds. */
  tint: string;
}

/** Keyed by subject `code` as seeded in the backend. */
export const SUBJECT_VISUALS: Record<string, SubjectVisual> = {
  PHY: { color: '#2563eb', tint: '#eff6ff' },
  CHE: { color: '#ea580c', tint: '#fff7ed' },
  BOT: { color: '#047857', tint: '#ecfdf5' },
  ZOO: { color: '#e11d48', tint: '#fff1f2' },
};

/** Aggregate/overall series (e.g. overall score line) — never a subject. */
export const AGGREGATE_SERIES_COLOR = '#7c3aed';

export const DEFAULT_SUBJECT_VISUAL: SubjectVisual = { color: '#475569', tint: '#f1f5f9' };

export function subjectVisual(code?: string): SubjectVisual {
  if (!code) return DEFAULT_SUBJECT_VISUAL;
  return SUBJECT_VISUALS[code.toUpperCase()] ?? DEFAULT_SUBJECT_VISUAL;
}
