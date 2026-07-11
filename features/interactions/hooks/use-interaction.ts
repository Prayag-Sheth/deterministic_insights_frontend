"use client";

import { useQuery } from "@tanstack/react-query";

import { getInteraction } from "@/features/interactions/api/interactions-api";
import { interactionKeys } from "@/features/interactions/api/interaction-keys";

export function useInteraction(id: string) {
  return useQuery({
    queryKey: interactionKeys.detail(id),
    queryFn: () => getInteraction(id),
    enabled: Boolean(id),
  });
}
