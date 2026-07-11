import { GuestRoute } from "@/features/auth/components/guest-route";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestRoute>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.97_0_0)_0%,_transparent_55%)]" />
        <div className="relative w-full max-w-sm">{children}</div>
      </div>
    </GuestRoute>
  );
}
