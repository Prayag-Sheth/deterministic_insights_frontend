"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { getCurrentUser, login } from "@/features/auth/api/auth-api";
import { authKeys } from "@/features/auth/api/auth-keys";
import type { LoginFormValues } from "@/features/auth/schemas/login-schema";
import { clearAccessToken, setAccessToken } from "@/lib/auth-token";
import { setStoredAccessToken } from "@/lib/auth-storage";
import { isApiError } from "@/lib/axios";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/auth-slice";

export function useLogin() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const { access_token } = await login(values);

      // Temporarily set token so /auth/me can authenticate — do not persist yet.
      setAccessToken(access_token);

      try {
        const currentUser = await getCurrentUser();
        setStoredAccessToken(access_token);
        dispatch(setCredentials({ accessToken: access_token, currentUser }));
        queryClient.setQueryData(authKeys.currentUser(), currentUser);
        return currentUser;
      } catch (error) {
        clearAccessToken();
        throw error;
      }
    },
    onSuccess: () => {
      router.replace("/dashboard");
    },
  });
}

export function getLoginErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.message === "Invalid credentials") {
      return error.message;
    }
    if (error.status === 401) {
      return "Unable to complete sign in. Please try again.";
    }
    return error.message || "Unable to sign in. Please try again.";
  }

  return "Unable to sign in. Please try again.";
}
