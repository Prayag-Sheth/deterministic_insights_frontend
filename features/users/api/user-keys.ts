import type { UserListParams } from "@/types/user";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: UserListParams) => [...userKeys.lists(), filters] as const,
};
