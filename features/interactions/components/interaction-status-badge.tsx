import { cn } from "@/lib/utils";
import type { InsightStatus } from "@/types/interaction";

const statusStyles: Record<InsightStatus, string> = {
  pending:
    "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-400/30",
  completed:
    "bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-400/30",
  failed:
    "bg-red-50 text-red-800 ring-red-600/20 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-400/30",
};

interface InteractionStatusBadgeProps {
  status: InsightStatus | null;
  className?: string;
}

export function InteractionStatusBadge({
  status,
  className,
}: InteractionStatusBadgeProps) {
  if (!status) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>—</span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset",
        statusStyles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
