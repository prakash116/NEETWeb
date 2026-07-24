'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { ListQuery } from '@/types/api';
import {
  getPublicTrackTopic,
  getPublicTrackTopicTree,
  listPublicPreparationTracks,
  listPublicTrackSubjects,
} from './api';

const PUBLIC_CATALOG_STALE_TIME = 300_000;

export function usePublicPreparationTracks() {
  return useQuery({
    queryKey: queryKeys.publicCatalog.tracks,
    queryFn: listPublicPreparationTracks,
    staleTime: PUBLIC_CATALOG_STALE_TIME,
  });
}

export function usePublicTrackSubjects(
  trackSlug: string | null,
  params: ListQuery = {},
) {
  return useQuery({
    queryKey: queryKeys.publicCatalog.subjects(trackSlug ?? '', { ...params }),
    queryFn: () => listPublicTrackSubjects(trackSlug!, params),
    enabled: trackSlug !== null,
    staleTime: PUBLIC_CATALOG_STALE_TIME,
  });
}

export function usePublicTrackTopicTree(
  trackSlug: string | null,
  subjectId: string | null,
) {
  return useQuery({
    queryKey: queryKeys.publicCatalog.topics(trackSlug ?? '', subjectId ?? ''),
    queryFn: () => getPublicTrackTopicTree(trackSlug!, subjectId!),
    enabled: trackSlug !== null && subjectId !== null,
    staleTime: PUBLIC_CATALOG_STALE_TIME,
  });
}

export function usePublicTrackTopic(
  trackSlug: string,
  subjectId: string,
  topicId: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: queryKeys.publicCatalog.topicDetail(trackSlug, subjectId, topicId),
    queryFn: () => getPublicTrackTopic(trackSlug, subjectId, topicId),
    enabled,
    staleTime: PUBLIC_CATALOG_STALE_TIME,
  });
}
