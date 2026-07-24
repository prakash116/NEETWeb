import type { Metadata } from 'next';
import { StudyMaterialsView } from '@/features/admin/components/study-materials-view';

export const metadata: Metadata = { title: 'Study materials' };

export default function AdminMaterialsPage() {
  return <StudyMaterialsView />;
}
