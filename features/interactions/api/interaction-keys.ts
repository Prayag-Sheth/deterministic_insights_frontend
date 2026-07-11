import type { InteractionListParams } from "@/types/interaction";

export const interactionKeys = {
  all: ["interactions"] as const,
  lists: () => [...interactionKeys.all, "list"] as const,
  list: (filters: InteractionListParams) =>
    [...interactionKeys.lists(), filters] as const,
  details: () => [...interactionKeys.all, "detail"] as const,
  detail: (id: string) => [...interactionKeys.details(), id] as const,
};
