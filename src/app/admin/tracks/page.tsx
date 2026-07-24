import type { Metadata } from 'next';
import { TracksView } from '@/features/admin/components/tracks-view';

export const metadata: Metadata = { title: 'Preparation paths' };

export default function AdminTracksPage() {
  return <TracksView />;
}
