"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { authKeys } from "@/features/auth/api/auth-keys";
import { clearStoredAccessToken } from "@/lib/auth-storage";
import { clearAccessToken } from "@/lib/auth-token";
import { useAppDispatch } from "@/store/hooks";
import { clearCredentials } from "@/store/slices/auth-slice";

export function useLogout() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useCallback(() => {
    clearAccessToken();
    clearStoredAccessToken();
    dispatch(clearCredentials());
    queryClient.removeQueries({ queryKey: authKeys.currentUser() });
    router.replace("/login");
  }, [dispatch, queryClient, router]);
}
