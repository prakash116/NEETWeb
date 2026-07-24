import type { Metadata } from 'next';
import { StudentsView } from '@/features/admin/components/students-view';

export const metadata: Metadata = { title: 'Students' };

export default function AdminStudentsPage() {
  return <StudentsView />;
}
