import type { Metadata } from 'next';
import { QuestionsView } from '@/features/admin/components/questions-view';

export const metadata: Metadata = { title: 'Questions' };

export default function AdminQuestionsPage() {
  return <QuestionsView />;
}
