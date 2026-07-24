import type { Metadata } from 'next';
import { SubjectsView } from '@/features/subjects/components/subjects-view';

export const metadata: Metadata = {
  title: 'Preparation Subjects',
  description: 'Choose a subject and browse its topic-wise preparation library.',
};

export default async function TrackSubjectsPage({
  params,
}: {
  params: Promise<{ trackSlug: string }>;
}) {
  const { trackSlug } = await params;
  return <SubjectsView trackSlug={trackSlug} />;
}
