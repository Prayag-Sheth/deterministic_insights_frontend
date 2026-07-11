"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LoadingIndicator } from "@/components/shared/loading-indicator";
import { useAppSelector } from "@/store/hooks";

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingIndicator label="Restoring session…" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingIndicator label="Redirecting…" />
      </div>
    );
  }

  return <>{children}</>;
}
