import type { Metadata } from 'next';
import { SubjectsView } from '@/features/subjects/components/subjects-view';

export const metadata: Metadata = {
  title: 'Subject Topics',
  description: 'Read a structured, topic-wise preparation syllabus without logging in.',
};

export default async function SubjectTopicsPage({
  params,
}: {
  params: Promise<{ trackSlug: string; subjectId: string }>;
}) {
  const { trackSlug, subjectId } = await params;
  return <SubjectsView trackSlug={trackSlug} subjectId={subjectId} />;
}
