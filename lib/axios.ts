import axios, { AxiosError, type AxiosInstance } from "axios";

import { getAccessToken } from "@/lib/auth-token";
import type { ApiError } from "@/types/api";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30_000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function normalizeApiError(error: AxiosError): ApiError {
  const status = error.response?.status;
  const data = error.response?.data as Partial<ApiError> | undefined;

  if (
    data &&
    typeof data.message === "string" &&
    typeof data.code === "string"
  ) {
    return {
      code: data.code,
      message: data.message,
      details: Array.isArray(data.details) ? data.details : [],
      request_id: data.request_id ?? null,
      status,
    };
  }

  if (!error.response) {
    return {
      code: "network_error",
      message: error.message || "Network error. Please check your connection.",
      details: [],
      status,
    };
  }

  return {
    code: "http_error",
    message: error.message || "An unexpected error occurred",
    details: [],
    request_id: null,
    status,
  };
}

type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;

/**
 * Register a callback invoked on 401 responses (except failed login).
 * Returns an unregister function. Axios never imports Redux.
 */
export function registerUnauthorizedHandler(
  handler: UnauthorizedHandler,
): () => void {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null;
    }
  };
}

function isLoginRequest(error: AxiosError): boolean {
  const method = error.config?.method?.toLowerCase();
  const url = error.config?.url ?? "";
  return method === "post" && url.includes("/auth/login");
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError = normalizeApiError(error);

    if (apiError.status === 401 && !isLoginRequest(error)) {
      unauthorizedHandler?.();
    }

    return Promise.reject(apiError);
  },
);

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    "details" in error
  );
}
