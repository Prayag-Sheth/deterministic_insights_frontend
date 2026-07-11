import { cn } from "@/lib/utils";
import type { CustomerStatus } from "@/types/customer";

const statusStyles: Record<CustomerStatus, string> = {
  active:
    "bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-400/30",
  inactive:
    "bg-zinc-100 text-zinc-700 ring-zinc-500/20 dark:bg-zinc-800/60 dark:text-zinc-300 dark:ring-zinc-400/30",
};

interface CustomerStatusBadgeProps {
  status: CustomerStatus;
  className?: string;
}

export function CustomerStatusBadge({
  status,
  className,
}: CustomerStatusBadgeProps) {
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
