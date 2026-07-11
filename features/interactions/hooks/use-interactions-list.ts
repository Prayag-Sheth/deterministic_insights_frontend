"use client";

import { useQuery } from "@tanstack/react-query";

import { listInteractions } from "@/features/interactions/api/interactions-api";
import { interactionKeys } from "@/features/interactions/api/interaction-keys";
import type { InteractionListParams } from "@/types/interaction";

export function useInteractionsList(filters: InteractionListParams) {
  return useQuery({
    queryKey: interactionKeys.list(filters),
    queryFn: () => listInteractions(filters),
    // Keep previous page visible while filters/pagination fetch — no blank flash.
    placeholderData: (previousData) => previousData,
  });
}
