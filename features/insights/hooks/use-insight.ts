"use client";

import { useQuery } from "@tanstack/react-query";

import { getInsight } from "@/features/insights/api/insights-api";
import { insightKeys } from "@/features/insights/api/insight-keys";
import { isApiError } from "@/lib/axios";
import type { InsightResponse } from "@/types/insight";

/**
 * Fetches the insight for an interaction.
 * 404 → null (empty state), not a page-level error.
 */
export function useInsight(interactionId: string) {
  return useQuery<InsightResponse | null>({
    queryKey: insightKeys.detail(interactionId),
    queryFn: async () => {
      try {
        return await getInsight(interactionId);
      } catch (error) {
        if (isApiError(error) && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: Boolean(interactionId),
  });
}
