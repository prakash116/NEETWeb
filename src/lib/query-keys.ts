/**
 * Central TanStack Query key factory. Mutations invalidate by the `root`
 * prefix of the entity they touch.
 */

type Params = Record<string, unknown>;

export const queryKeys = {
  subjects: {
    root: ['subjects'] as const,
    list: (params?: Params) => ['subjects', 'list', params ?? {}] as const,
    detail: (id: string) => ['subjects', 'detail', id] as const,
  },
  topics: {
    root: ['topics'] as const,
    list: (params?: Params) => ['topics', 'list', params ?? {}] as const,
    tree: (subjectId: string) => ['topics', 'tree', subjectId] as const,
    detail: (id: string) => ['topics', 'detail', id] as const,
  },
  questions: {
    root: ['questions'] as const,
    list: (params?: Params) => ['questions', 'list', params ?? {}] as const,
    detail: (id: string) => ['questions', 'detail', id] as const,
  },
  questionImports: {
    root: ['question-imports'] as const,
    list: (params?: Params) => ['question-imports', 'list', params ?? {}] as const,
    detail: (id: string) => ['question-imports', 'detail', id] as const,
  },
  exams: {
    root: ['exams'] as const,
    list: (params?: Params) => ['exams', 'list', params ?? {}] as const,
    detail: (id: string) => ['exams', 'detail', id] as const,
  },
  examAttempts: {
    root: ['exam-attempts'] as const,
    active: ['exam-attempts', 'active'] as const,
  },
  results: {
    root: ['results'] as const,
    list: (params?: Params) => ['results', 'list', params ?? {}] as const,
    detail: (id: string) => ['results', 'detail', id] as const,
  },
  notifications: {
    root: ['notifications'] as const,
    list: ['notifications', 'list'] as const,
  },
  users: {
    root: ['users'] as const,
    list: (params?: Params) => ['users', 'list', params ?? {}] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  profile: {
    root: ['profile'] as const,
    me: ['profile', 'me'] as const,
    address: ['profile', 'address'] as const,
  },
  dashboard: {
    student: ['dashboard', 'student'] as const,
    studentTopics: ['dashboard', 'student', 'topics'] as const,
    admin: ['dashboard', 'admin'] as const,
  },
  settings: {
    root: ['settings'] as const,
  },
  adminLogs: {
    root: ['admin-logs'] as const,
    list: (params?: Params) => ['admin-logs', 'list', params ?? {}] as const,
  },
};
