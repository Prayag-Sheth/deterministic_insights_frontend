"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteInteraction } from "@/features/interactions/api/interactions-api";
import { interactionKeys } from "@/features/interactions/api/interaction-keys";
import { isApiError } from "@/lib/axios";

export function useDeleteInteraction() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  return useMutation({
    mutationFn: (id: string) => deleteInteraction(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({
        queryKey: interactionKeys.lists(),
      });
      queryClient.removeQueries({ queryKey: interactionKeys.detail(id) });

      if (
        pathname === `/interactions/${id}` ||
        pathname.startsWith(`/interactions/${id}/`)
      ) {
        router.push("/interactions");
      }

      toast.success("Interaction deleted");
    },
    onError: (error) => {
      const message = isApiError(error)
        ? error.message
        : "Unable to delete interaction. Please try again.";
      toast.error(message);
    },
  });
}
