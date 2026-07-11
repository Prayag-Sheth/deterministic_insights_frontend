import { Sparkles } from "lucide-react";
import type { ElementType } from "react";

import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  /** Show the product name beside the icon mark. */
  showWordmark?: boolean;
  /** Compact sizing for sidebar / tight layouts. */
  size?: "sm" | "md";
  /** Element used for the wordmark (e.g. `h1` on the login page). */
  wordmarkAs?: ElementType;
}

export function BrandMark({
  className,
  showWordmark = true,
  size = "md",
  wordmarkAs: Wordmark = "span",
}: BrandMarkProps) {
  const iconBox =
    size === "sm"
      ? "size-7 rounded-md [&_svg]:size-3.5"
      : "size-10 rounded-lg [&_svg]:size-5";
  const wordmarkClass =
    size === "sm" ? "text-sm font-semibold" : "text-2xl font-semibold";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center bg-foreground text-background",
          iconBox,
        )}
        aria-hidden
      >
        <Sparkles strokeWidth={2} />
      </span>
      {showWordmark ? (
        <Wordmark
          className={cn("tracking-tight text-foreground", wordmarkClass)}
        >
          Deterministic Insights
        </Wordmark>
      ) : (
        <span className="sr-only">Deterministic Insights</span>
      )}
    </div>
  );
}
