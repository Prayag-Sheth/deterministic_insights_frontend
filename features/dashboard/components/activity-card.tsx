import { cn } from "@/lib/utils";

interface ActivityCardProps {
  label: string;
  value: number;
  className?: string;
}

export function ActivityCard({ label, value, className }: ActivityCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-3 sm:p-4",
        className,
      )}
    >
      <p className="text-[0.6875rem] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">interactions</p>
      </div>
    </div>
  );
}
