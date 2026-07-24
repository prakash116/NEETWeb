import type { Metadata } from 'next';
import { ExamRunnerView } from '@/features/exams/components/exam-runner-view';

export const metadata: Metadata = { title: 'Exam in progress' };

export default function ExamAttemptPage() {
  return <ExamRunnerView />;
}
