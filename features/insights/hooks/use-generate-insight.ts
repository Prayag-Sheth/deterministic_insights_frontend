"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { generateInsight } from "@/features/insights/api/insights-api";
import { insightKeys } from "@/features/insights/api/insight-keys";
import { interactionKeys } from "@/features/interactions/api/interaction-keys";
import { isApiError } from "@/lib/axios";
import type { InteractionDetail } from "@/types/interaction";

const CONFLICT_FALLBACK = "Insight generation is already in progress.";

export function useGenerateInsight(interactionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => generateInsight(interactionId),
    onSuccess: (insight) => {
      queryClient.setQueryData(insightKeys.detail(interactionId), insight);

      queryClient.setQueryData<InteractionDetail>(
        interactionKeys.detail(interactionId),
        (previous) => {
          if (!previous) {
            return previous;
          }
          return {
            ...previous,
            sentiment: insight.sentiment,
            insight_status: insight.status,
          };
        },
      );

      void queryClient.invalidateQueries({
        queryKey: interactionKeys.lists(),
      });

      if (insight.status === "completed") {
        toast.success("Insight generated");
      } else if (insight.status === "failed") {
        toast.error(insight.error ?? "Insight generation failed");
      }
    },
    onError: (error) => {
      if (isApiError(error) && error.status === 409) {
        toast.error(error.message || CONFLICT_FALLBACK);
        return;
      }
      const message = isApiError(error)
        ? error.message
        : "Unable to generate insight. Please try again.";
      toast.error(message);
    },
  });
}
