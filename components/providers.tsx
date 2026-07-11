"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { SessionLoader } from "@/features/auth/components/session-loader";
import { makeQueryClient } from "@/lib/query-client";
import { ReduxProvider } from "@/store/provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <ReduxProvider>
      <QueryClientProvider client={queryClient}>
        <SessionLoader>{children}</SessionLoader>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
