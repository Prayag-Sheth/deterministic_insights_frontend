"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateInteraction } from "@/features/interactions/api/interactions-api";
import { interactionKeys } from "@/features/interactions/api/interaction-keys";
import type { InteractionUpdateBody } from "@/types/interaction";

export function useUpdateInteraction(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: InteractionUpdateBody) => updateInteraction(id, body),
    onSuccess: (interaction) => {
      queryClient.setQueryData(interactionKeys.detail(id), interaction);
      void queryClient.invalidateQueries({
        queryKey: interactionKeys.lists(),
      });
    },
  });
}
