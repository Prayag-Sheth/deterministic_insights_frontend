"use client";

import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "@/features/auth/api/auth-api";
import { authKeys } from "@/features/auth/api/auth-keys";
import { useAppSelector } from "@/store/hooks";

export function useCurrentUser() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
  });
}
