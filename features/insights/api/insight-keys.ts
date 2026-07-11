export const insightKeys = {
  all: ["insights"] as const,
  details: () => [...insightKeys.all, "detail"] as const,
  detail: (interactionId: string) =>
    [...insightKeys.details(), interactionId] as const,
};
