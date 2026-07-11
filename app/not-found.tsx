import Link from "next/link";

import { BrandMark } from "@/components/shared/brand-mark";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.97_0_0)_0%,_transparent_55%)]" />
      <div className="relative flex w-full max-w-sm flex-col items-center gap-8 text-center">
        <BrandMark />
        <div className="space-y-2">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            404
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or may have been
            moved.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
