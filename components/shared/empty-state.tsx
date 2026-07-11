import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  message: string;
  title?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  message,
  title = "No data",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-4 py-12 text-center",
        className,
      )}
    >
      <Inbox className="size-10 text-muted-foreground" aria-hidden />
      <div className="space-y-1">
        <h3 className="text-base font-medium text-foreground">{title}</h3>
        <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}
