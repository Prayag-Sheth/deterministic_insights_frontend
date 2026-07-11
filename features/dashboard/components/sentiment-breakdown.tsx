import { cn } from "@/lib/utils";
import type { SentimentBreakdown as SentimentBreakdownMetrics } from "@/types/dashboard";
import type { SentimentType } from "@/types/interaction";

interface SentimentBreakdownProps {
  sentiment: SentimentBreakdownMetrics;
  className?: string;
}

const SENTIMENT_ORDER: SentimentType[] = ["positive", "neutral", "negative"];

const barStyles: Record<SentimentType, string> = {
  positive: "bg-emerald-600 dark:bg-emerald-500",
  neutral: "bg-zinc-400 dark:bg-zinc-500",
  negative: "bg-red-600 dark:bg-red-500",
};

function percentOf(count: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((count / total) * 100);
}

export function SentimentBreakdown({
  sentiment,
  className,
}: SentimentBreakdownProps) {
  const total = sentiment.positive + sentiment.neutral + sentiment.negative;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 sm:p-6",
        className,
      )}
    >
      <h2 className="text-sm font-semibold tracking-tight text-foreground">
        Sentiment breakdown
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Completed insights by sentiment
        {total > 0 ? ` (${total} total)` : ""}
      </p>

      <ul className="mt-5 space-y-5">
        {SENTIMENT_ORDER.map((key) => {
          const count = sentiment[key];
          const pct = percentOf(count, total);
          return (
            <li key={key} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="capitalize text-foreground">{key}</span>
                <span className="tabular-nums text-muted-foreground">
                  {count}
                  {total > 0 ? ` (${pct}%)` : ""}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    barStyles[key],
                  )}
                  style={{ width: `${pct}%` }}
                  role="presentation"
                />
              </div>
            </li>
          );
        })}
      </ul>

      {total === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No completed insights with sentiment yet.
        </p>
      ) : null}
    </div>
  );
}
