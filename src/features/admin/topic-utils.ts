import type { EntityStatus, TopicTreeNode } from '@/types/entities';

export interface FlatTopic {
  id: string;
  name: string;
  depth: number;
  status: EntityStatus;
}

/** Depth-first flattening in display order — for selects and name lookups. */
export function flattenTopics(nodes: TopicTreeNode[], depth = 0): FlatTopic[] {
  const sorted = [...nodes].sort(
    (a, b) => a.order - b.order || a.topicName.localeCompare(b.topicName),
  );
  return sorted.flatMap((node) => [
    { id: node.id, name: node.topicName, depth, status: node.status },
    ...flattenTopics(node.children, depth + 1),
  ]);
}

export function topicIndentLabel(topic: FlatTopic): string {
  return topic.depth > 0 ? `${'  '.repeat(topic.depth)}└ ${topic.name}` : topic.name;
}
