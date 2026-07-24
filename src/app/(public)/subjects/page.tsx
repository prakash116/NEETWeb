import type { Metadata } from 'next';
import { SubjectsView } from '@/features/subjects/components/subjects-view';

export const metadata: Metadata = {
  title: 'Subjects',
  description:
    'Browse class-wise subjects and topic-based study material for exam preparation.',
};

export default function SubjectsPage() {
  return <SubjectsView />;
}
