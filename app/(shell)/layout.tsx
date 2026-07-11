import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/features/auth/components/protected-route";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
