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
import { INTERACTION_TYPE_LABELS } from "@/features/interactions/schemas/interaction-schema";
import { cn } from "@/lib/utils";
import type { DashboardRecentInteraction } from "@/types/dashboard";

interface RecentInteractionsProps {
  items: DashboardRecentInteraction[];
  className?: string;
}

export function RecentInteractions({
  items,
  className,
}: RecentInteractionsProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 sm:p-6",
        className,
      )}
    >
      <h2 className="text-sm font-semibold tracking-tight text-foreground">
        Recent interactions
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Latest logged meetings and touchpoints
      </p>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No recent interactions.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/40">
                  <TableCell>
                    <Link
                      href={`/interactions/${row.id}`}
                      className="font-medium text-foreground hover:underline"
                      title={row.customer_name}
                    >
                      {row.customer_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/interactions/${row.id}`}
                      className="text-foreground hover:underline"
                    >
                      {INTERACTION_TYPE_LABELS[row.type]}
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    <Link
                      href={`/interactions/${row.id}`}
                      className="hover:underline"
                    >
                      {format(
                        new Date(row.interaction_at),
                        "MMM d, yyyy h:mm a",
                      )}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
