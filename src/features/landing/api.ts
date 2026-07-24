import { api } from '@/lib/api-client';

export interface LandingSubject {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
}

export interface LandingSummary {
  subjects: LandingSubject[];
  stats: {
    students: number;
    questions: number;
    exams: number;
    topics: number;
  };
}

/** Public — no authentication required. */
export function getLandingSummary(): Promise<LandingSummary> {
  return api.get<LandingSummary>('/public/landing');
}
