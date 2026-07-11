"use client";

import { useQuery } from "@tanstack/react-query";

import { listUsers } from "@/features/users/api/users-api";
import { userKeys } from "@/features/users/api/user-keys";
import type { UserListParams } from "@/types/user";

interface UseUsersListOptions {
  enabled?: boolean;
}

export function useUsersList(
  filters: UserListParams = {},
  options: UseUsersListOptions = {},
) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => listUsers(filters),
    enabled: options.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  });
}
