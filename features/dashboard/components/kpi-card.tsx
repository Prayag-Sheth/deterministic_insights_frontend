import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: number;
  /** Visual emphasis when the metric needs attention (e.g. failed insights). */
  tone?: "default" | "warning";
  className?: string;
}

export function KpiCard({
  label,
  value,
  tone = "default",
  className,
}: KpiCardProps) {
  const isWarning = tone === "warning" && value > 0;

  return (
    <div
      className={cn(
        "rounded-lg border p-3 sm:p-4",
        isWarning
          ? "border-amber-500/40 bg-amber-500/10"
          : "border-border bg-card",
        className,
      )}
    >
      <p
        className={cn(
          "text-[0.6875rem] font-medium tracking-wider uppercase",
          isWarning
            ? "text-amber-800 dark:text-amber-400"
            : "text-muted-foreground",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 text-3xl font-bold tracking-tight tabular-nums",
          isWarning
            ? "text-amber-900 dark:text-amber-300"
            : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}
