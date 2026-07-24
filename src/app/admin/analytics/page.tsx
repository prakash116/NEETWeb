import type { Metadata } from 'next';
import { AnalyticsView } from '@/features/admin/components/analytics-view';

export const metadata: Metadata = { title: 'Analytics' };

export default function AdminAnalyticsPage() {
  return <AnalyticsView />;
}
