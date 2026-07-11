import { cn } from "@/lib/utils";
import type { SentimentType } from "@/types/interaction";

const sentimentStyles: Record<SentimentType, string> = {
  positive:
    "bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-400/30",
  neutral:
    "bg-zinc-100 text-zinc-700 ring-zinc-500/20 dark:bg-zinc-800/60 dark:text-zinc-300 dark:ring-zinc-400/30",
  negative:
    "bg-red-50 text-red-800 ring-red-600/20 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-400/30",
};

interface InteractionSentimentBadgeProps {
  sentiment: SentimentType | null;
  className?: string;
}

export function InteractionSentimentBadge({
  sentiment,
  className,
}: InteractionSentimentBadgeProps) {
  if (!sentiment) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>—</span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset",
        sentimentStyles[sentiment],
        className,
      )}
    >
      {sentiment}
    </span>
  );
}
