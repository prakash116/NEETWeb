'use client';

import { useQuery } from '@tanstack/react-query';
import { getLandingSummary } from './api';

export function useLandingSummary() {
  return useQuery({
    queryKey: ['landing', 'summary'],
    queryFn: getLandingSummary,
    staleTime: 300_000,
    retry: 1,
  });
}
