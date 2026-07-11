"use client";

import { format } from "date-fns";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InteractionSentimentBadge } from "@/features/interactions/components/interaction-sentiment-badge";
import { InteractionStatusBadge } from "@/features/interactions/components/interaction-status-badge";
import { INTERACTION_TYPE_LABELS } from "@/features/interactions/schemas/interaction-schema";
import { cn } from "@/lib/utils";
import type { DashboardRecentInsight } from "@/types/dashboard";

interface RecentInsightsProps {
  items: DashboardRecentInsight[];
  className?: string;
}

function insightInteractionLabel(row: DashboardRecentInsight): string {
  return `${INTERACTION_TYPE_LABELS[row.interaction_type]} with ${row.customer_name}`;
}

function truncateSummary(summary: string | null): string {
  if (!summary) {
    return "—";
  }
  if (summary.length <= 80) {
    return summary;
  }
  return `${summary.slice(0, 80)}…`;
}

export function RecentInsights({ items, className }: RecentInsightsProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 sm:p-6",
        className,
      )}
    >
      <h2 className="text-sm font-semibold tracking-tight text-foreground">
        Recent insights
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Latest AI-generated insight results
      </p>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No recent insights.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Interaction</TableHead>
                <TableHead className="w-[50%]">Summary</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => {
                const label = insightInteractionLabel(row);
                return (
                  <TableRow key={row.id} className="hover:bg-muted/40">
                    <TableCell className="w-[25%] max-w-0">
                      <Link
                        href={`/interactions/${row.interaction_id}`}
                        className="block truncate font-medium text-foreground hover:underline"
                        title={label}
                      >
                        {label}
                      </Link>
                    </TableCell>
                    <TableCell className="w-[50%] max-w-0">
                      <span
                        className="block truncate text-sm text-foreground"
                        title={row.summary ?? undefined}
                      >
                        {truncateSummary(row.summary)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <InteractionSentimentBadge sentiment={row.sentiment} />
                    </TableCell>
                    <TableCell>
                      <InteractionStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {format(new Date(row.updated_at), "MMM d, yyyy h:mm a")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
