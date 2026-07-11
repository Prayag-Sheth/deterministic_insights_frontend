"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { getCurrentUser } from "@/features/auth/api/auth-api";
import { authKeys } from "@/features/auth/api/auth-keys";
import {
  clearStoredAccessToken,
  getStoredAccessToken,
} from "@/lib/auth-storage";
import { clearAccessToken, setAccessToken } from "@/lib/auth-token";
import { registerUnauthorizedHandler } from "@/lib/axios";
import { useAppDispatch } from "@/store/hooks";
import {
  clearCredentials,
  setCredentials,
  setSessionLoading,
} from "@/store/slices/auth-slice";

export function SessionLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();
  const restoredRef = useRef(false);

  useEffect(() => {
    const unregister = registerUnauthorizedHandler(() => {
      clearAccessToken();
      clearStoredAccessToken();
      dispatch(clearCredentials());
      queryClient.removeQueries({ queryKey: authKeys.currentUser() });
      router.replace("/login");
    });

    return unregister;
  }, [dispatch, queryClient, router]);

  useEffect(() => {
    if (restoredRef.current) {
      return;
    }
    restoredRef.current = true;

    async function restoreSession() {
      const token = getStoredAccessToken();

      if (!token) {
        clearAccessToken();
        dispatch(clearCredentials());
        dispatch(setSessionLoading(false));
        return;
      }

      setAccessToken(token);

      try {
        const currentUser = await queryClient.fetchQuery({
          queryKey: authKeys.currentUser(),
          queryFn: getCurrentUser,
        });
        dispatch(setCredentials({ accessToken: token, currentUser }));
      } catch {
        clearAccessToken();
        clearStoredAccessToken();
        dispatch(clearCredentials());
        queryClient.removeQueries({ queryKey: authKeys.currentUser() });
        dispatch(setSessionLoading(false));
      }
    }

    void restoreSession();
  }, [dispatch, queryClient]);

  return <>{children}</>;
}
