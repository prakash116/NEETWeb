/**
 * Domain types mirroring the backend response DTOs and enums under
 * `Server/src/modules/**`. Enum values must match the server exactly —
 * they travel over the wire. Dates arrive as ISO strings.
 */

// ─────────────────────────────── Enums ───────────────────────────────

export const USER_ROLES = ['student', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ACCOUNT_STATUSES = ['active', 'blocked', 'suspended'] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const ENTITY_STATUSES = ['active', 'inactive'] as const;
export type EntityStatus = (typeof ENTITY_STATUSES)[number];

export const EXAM_STATUSES = ['draft', 'published', 'unpublished', 'archived'] as const;
export type ExamStatus = (typeof EXAM_STATUSES)[number];

export const EXAM_ATTEMPT_STATUSES = ['active', 'submitted', 'failed'] as const;
export type ExamAttemptStatus = (typeof EXAM_ATTEMPT_STATUSES)[number];

/** Server enum name: `ExamResult` (pass/fail verdict of an attempt). */
export const EXAM_OUTCOMES = ['pending', 'passed', 'failed'] as const;
export type ExamOutcome = (typeof EXAM_OUTCOMES)[number];

export const ANSWER_OPTIONS = ['A', 'B', 'C', 'D'] as const;
export type AnswerOption = (typeof ANSWER_OPTIONS)[number];

export const QUESTION_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type QuestionDifficulty = (typeof QUESTION_DIFFICULTIES)[number];

export const QUESTION_STATUSES = ['active', 'inactive', 'archived'] as const;
export type QuestionStatus = (typeof QUESTION_STATUSES)[number];

export const QUESTION_IMPORT_STATUSES = [
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
] as const;
export type QuestionImportStatus = (typeof QUESTION_IMPORT_STATUSES)[number];

/** Browser events the exam runner may report; the 4th `tab_switch` fails the exam. */
export const CLIENT_EXAM_EVENT_TYPES = [
  'page_refresh',
  'browser_close',
  'tab_switch',
  'fullscreen_exit',
  'network_disconnect',
  'network_reconnect',
] as const;
export type ClientExamEventType = (typeof CLIENT_EXAM_EVENT_TYPES)[number];

export const UPLOAD_PURPOSES = ['profile', 'question', 'subject', 'track', 'import'] as const;
export type UploadPurpose = (typeof UPLOAD_PURPOSES)[number];

// ─────────────────────────────── Auth ───────────────────────────────

export interface AuthUser {
  id: string;
  studentId?: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** e.g. "15m" */
  accessExpiresIn: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

/** Admin view of an account (`GET /users`). */
export interface User {
  id: string;
  studentId?: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
  isEmailVerified: boolean;
  permissions: string[];
  displayName?: string;
  /** Student profile name — present for students in admin lists. */
  fullName?: string;
  profilePhotoUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** `GET /users/:id/student-detail` (admin). */
export interface StudentProfileSummary {
  fullName: string;
  phoneNumber?: string;
  age?: number;
  academicClass?: string;
  schoolName?: string;
  purpose?: string;
  profilePhotoUrl?: string;
}

export interface StudentExamStats {
  totalAttended: number;
  passed: number;
  failed: number;
  averagePercentage: number;
  bestPercentage: number;
  bestRank: number | null;
}

export interface StudentDetail {
  account: User;
  profile: StudentProfileSummary | null;
  examStats: StudentExamStats;
  attempts: ResultSummary[];
}

// ─────────────────────────── Catalog content ───────────────────────────

export interface PreparationTrack {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow?: string;
  description?: string;
  focus?: string;
  icon?: string;
  color?: string;
  tint?: string;
  order: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  preparationTrackIds: string[];
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  parentTopicId?: string | null;
  topicName: string;
  description?: string;
  preparationTrackIds: string[];
  order: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TopicTreeNode extends Topic {
  children: TopicTreeNode[];
}

export interface TopicResource {
  id: string;
  topicId: string;
  title: string;
  originalName: string;
  mimeType: 'application/pdf';
  format: 'pdf';
  bytes: number;
  order: number;
  createdAt: string;
  updatedAt?: string;
}

/** Full topic content. Topic trees intentionally return summaries only. */
export interface TopicDetail extends Topic {
  studyContent?: string;
  resources: TopicResource[];
}

export interface MediaAsset {
  url: string;
  publicId: string;
  altText?: string;
}

export interface QuestionOption {
  key: AnswerOption;
  text: string;
  image?: MediaAsset;
}

export interface Question {
  id: string;
  subjectId: string;
  topicId: string;
  difficulty: QuestionDifficulty;
  question: string;
  image?: MediaAsset;
  options: QuestionOption[];
  /** Admin-only — never present in student reads. */
  correctAnswer?: AnswerOption;
  /** Admin-only — never present in student reads. */
  explanation?: string;
  marks: number;
  negativeMarks: number;
  /** Admin-only. */
  createdBy?: string;
  status: QuestionStatus;
  contentRevision: number;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionImportError {
  row: number;
  message: string;
}

export interface QuestionImport {
  id: string;
  subjectId: string;
  uploadedBy: string;
  originalFileName: string;
  storageKey: string;
  fileSize: number;
  checksumSha256?: string;
  status: QuestionImportStatus;
  totalRows: number;
  processedRows: number;
  importedRows: number;
  failedRows: number;
  errors: QuestionImportError[];
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────── Exams ───────────────────────────────

export interface Exam {
  id: string;
  examCode: string;
  examName: string;
  subjectId: string;
  topicIds: string[];
  totalQuestions: number;
  marksPerQuestion: number;
  negativeMarks: number;
  /** Minutes per question. */
  questionTime: number;
  /** Derived total duration in minutes. */
  totalTime: number;
  passingMarks: number;
  instructions: string;
  status: ExamStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  /** Present on the publish response only. */
  eligibleQuestionCount?: number;
}

/** Question snapshot inside an attempt — no correct answer, ever. */
export interface AttemptQuestion {
  id: string;
  topicId: string;
  difficulty: QuestionDifficulty;
  question: string;
  image?: MediaAsset;
  options: QuestionOption[];
}

/** `POST /exam-attempts/start` and `GET /exam-attempts/active`. */
export interface ExamAttempt {
  id: string;
  examId: string;
  examCode: string;
  examName: string;
  instructions: string;
  startedAt: string;
  /** Server-authoritative deadline — the runner timer derives from this. */
  expiresAt: string;
  status: ExamAttemptStatus;
  totalQuestions: number;
  /** Minutes per question. */
  questionTime: number;
  tabSwitchCount: number;
  questions: AttemptQuestion[];
}

/** `PATCH /exam-attempts/:id/answers` response. */
export interface SavedAnswer {
  questionId: string;
  selectedAnswer: AnswerOption | null;
  timeTaken: number;
  version: number;
  savedAt: string;
}

/** `POST /exam-attempts/:id/events` response. */
export interface ExamEventAck {
  recorded: boolean;
  tabSwitchCount: number;
  warningsRemaining: number;
  failed: boolean;
}

/** `POST /exam-attempts/:id/submit` response. */
export interface AttemptSubmitResult {
  attemptId: string;
  status: ExamAttemptStatus;
  examResult: ExamOutcome;
  totalQuestions: number;
  attempted: number;
  skipped: number;
  correct: number;
  wrong: number;
  score: number;
  percentage: number;
  autoSubmitted: boolean;
  failReason?: string;
  submittedAt?: string;
}

// ─────────────────────────────── Results ───────────────────────────────

export interface ResultSummary {
  attemptId: string;
  examId: string;
  examCode: string;
  examName: string;
  totalQuestions: number;
  attempted: number;
  skipped: number;
  correct: number;
  wrong: number;
  score: number;
  percentage: number;
  rank?: number;
  status: ExamAttemptStatus;
  examResult: ExamOutcome;
  submittedAt?: string;
}

export interface ResultAnswer {
  questionId: string;
  selectedAnswer: AnswerOption | null;
  correctAnswer: AnswerOption;
  isCorrect: boolean;
  timeTaken: number;
}

export interface ResultDetail extends ResultSummary {
  answers: ResultAnswer[];
}

// ─────────────────────────────── Student ───────────────────────────────

export interface StudentProfile {
  id: string;
  userId: string;
  email: string;
  studentId: string;
  fullName: string;
  phoneNumber?: string;
  age?: number;
  academicClass?: string;
  schoolName?: string;
  purpose?: string;
  profilePhotoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAddress {
  id: string;
  userId: string;
  address: string;
  city: string;
  district: string;
  pinCode: string;
  state: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

/** `GET /notifications` returns a plain array of these (not paginated). */
export interface AppNotification {
  id: string;
  studentId: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// ────────────────────────────── Dashboards ──────────────────────────────

/**
 * `GET /student/dashboard` — raw Mongo document (unmapped), so the id field
 * is `_id` and topic references are plain id strings.
 */
export interface StudentDashboardStats {
  _id?: string;
  studentId: string;
  totalExams: number;
  totalQuestions: number;
  totalCorrect: number;
  totalWrong: number;
  averageScore: number;
  highestScore: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  yearlyGrowth: number;
  completedTopics: string[];
  missedTopics: string[];
  streak: number;
  lastExamDate?: string;
  createdAt: string;
  updatedAt: string;
}

/** `GET /student/dashboard/topics` — raw documents, one per practiced topic. */
export interface TopicProgressEntry {
  _id?: string;
  studentId: string;
  topicId: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  percentage: number;
  completed: boolean;
  lastPracticeDate?: string;
  createdAt: string;
  updatedAt: string;
}

/** `GET /admin/dashboard`. */
export interface AdminAttemptsTrendPoint {
  /** UTC day, YYYY-MM-DD. */
  date: string;
  attempts: number;
}

export interface AdminTopStudent {
  studentId: string;
  fullName: string;
  studentCode?: string;
  examsAttended: number;
  averagePercentage: number;
  bestPercentage: number;
}

export interface AdminExamPopularity {
  examId: string;
  examName: string;
  examCode: string;
  attempts: number;
  averagePercentage: number;
}

export interface AdminSubjectPopularity {
  subjectId: string;
  subjectName: string;
  attempts: number;
}

export interface AdminDashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalSubjects: number;
  totalTopics: number;
  totalExams: number;
  totalQuestions: number;
  todaysExams: number;
  todaysRegistrations: number;
  /** Average percentage across all completed attempts. */
  averageScore: number;
  failedStudents: number;
  attemptsTrend: AdminAttemptsTrendPoint[];
  passedAttempts: number;
  failedAttempts: number;
  topStudents: AdminTopStudent[];
  examPopularity: AdminExamPopularity[];
  subjectPopularity: AdminSubjectPopularity[];
}

/** `GET /admin/dashboard/analytics`. */
export interface AdminRegistrationPoint {
  date: string;
  count: number;
}

export interface AdminScoreBucket {
  bucket: string;
  count: number;
}

export interface AdminSubjectPerformance {
  subjectId: string;
  subjectName: string;
  attempts: number;
  averagePercentage: number;
  passRate: number;
}

export interface AdminTopicAccuracy {
  topicId: string;
  topicName: string;
  subjectName: string;
  attempted: number;
  accuracy: number;
}

export interface AdminHourActivity {
  /** 0–23, IST. */
  hour: number;
  attempts: number;
}

export interface AdminPeriodSummary {
  attempts: number;
  averagePercentage: number;
}

export interface AdminAnalytics {
  registrations30d: AdminRegistrationPoint[];
  scoreDistribution: AdminScoreBucket[];
  subjectPerformance: AdminSubjectPerformance[];
  weakestTopics: AdminTopicAccuracy[];
  attemptsByHour: AdminHourActivity[];
  last7Days: AdminPeriodSummary;
  previous7Days: AdminPeriodSummary;
  last30Days: AdminPeriodSummary;
  previous30Days: AdminPeriodSummary;
}

// ─────────────────────────────── System ───────────────────────────────

/** `GET /settings` — raw document. */
export interface AppSettings {
  _id?: string;
  key: string;
  examRules: string[];
  /** Default minutes per question. */
  timer: number;
  negativeMarking: number;
  maxTabSwitch: number;
  maintenanceMode: boolean;
  createdAt: string;
  updatedAt: string;
}

/** `GET /admin/logs` items — raw documents. */
export interface AdminLog {
  _id?: string;
  adminId: string;
  action: string;
  module: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

/** `POST /uploads/image` response. */
export interface UploadResult {
  id: string;
  purpose: UploadPurpose;
  publicId: string;
  secureUrl: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
}
