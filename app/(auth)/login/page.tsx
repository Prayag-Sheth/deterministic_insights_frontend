import type { Metadata } from "next";

import { BrandMark } from "@/components/shared/brand-mark";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center space-y-3 text-center">
        <BrandMark className="flex-col gap-3" wordmarkAs="h1" />
        <p className="text-sm text-muted-foreground">
          Sign in to manage customers, interactions, and AI insights.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 shadow-xs">
        <LoginForm />
      </div>
    </div>
  );
}
