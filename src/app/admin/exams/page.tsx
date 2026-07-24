import type { Metadata } from 'next';
import { AdminExamsView } from '@/features/admin/components/exams-view';

export const metadata: Metadata = { title: 'Exams' };

export default function AdminExamsPage() {
  return <AdminExamsView />;
}
