import { QueryClient } from "@tanstack/react-query";

import { isApiError } from "@/lib/axios";

const NO_RETRY_STATUSES = new Set([401, 403, 404]);

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) {
    return false;
  }

  if (isApiError(error) && error.status !== undefined) {
    if (NO_RETRY_STATUSES.has(error.status)) {
      return false;
    }
  }

  return true;
}

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
