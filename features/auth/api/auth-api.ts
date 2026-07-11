import { apiClient } from "@/lib/axios";
import type { AuthUser, TokenResponse } from "@/types/auth";

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function login(
  credentials: LoginCredentials,
): Promise<TokenResponse> {
  const body = new URLSearchParams();
  body.set("username", credentials.email);
  body.set("password", credentials.password);

  const { data } = await apiClient.post<TokenResponse>("/auth/login", body, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>("/auth/me");
  return data;
}
