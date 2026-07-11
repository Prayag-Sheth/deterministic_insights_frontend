"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { createInteraction } from "@/features/interactions/api/interactions-api";
import { interactionKeys } from "@/features/interactions/api/interaction-keys";
import type { InteractionCreateBody } from "@/types/interaction";

export function useCreateInteraction() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (body: InteractionCreateBody) => createInteraction(body),
    onSuccess: (interaction) => {
      void queryClient.invalidateQueries({
        queryKey: interactionKeys.lists(),
      });
      router.push(`/interactions/${interaction.id}`);
    },
  });
}
