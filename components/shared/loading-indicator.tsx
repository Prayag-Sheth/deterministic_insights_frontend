import { cn } from "@/lib/utils";
import { Spinner } from "@/components/shared/spinner";

interface LoadingIndicatorProps {
  label?: string;
  className?: string;
}

export function LoadingIndicator({
  label = "Loading…",
  className,
}: LoadingIndicatorProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground",
        className,
      )}
    >
      <Spinner size="lg" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
