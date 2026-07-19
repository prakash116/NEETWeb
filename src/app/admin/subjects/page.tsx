import type { Metadata } from 'next';
import { SubjectsTopicsView } from '@/features/admin/components/subjects-topics-view';

export const metadata: Metadata = { title: 'Subjects & topics' };

export default function AdminSubjectsPage() {
  return <SubjectsTopicsView />;
}
