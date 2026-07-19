import type { Metadata } from 'next';
import { AdminDashboardView } from '@/features/admin/components/admin-dashboard-view';

export const metadata: Metadata = { title: 'Admin dashboard' };

export default function AdminDashboardPage() {
  return <AdminDashboardView />;
}
