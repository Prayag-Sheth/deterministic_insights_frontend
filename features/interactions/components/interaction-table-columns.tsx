"use client";

import { format } from "date-fns";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InteractionSentimentBadge } from "@/features/interactions/components/interaction-sentiment-badge";
import { InteractionStatusBadge } from "@/features/interactions/components/interaction-status-badge";
import { INTERACTION_TYPE_LABELS } from "@/features/interactions/schemas/interaction-schema";
import type { InteractionListItem } from "@/types/interaction";

export type CustomerNameDisplay =
  | { status: "loading" }
  | { status: "ready"; name: string };

export interface InteractionTableColumnOptions {
  resolveCustomerName: (customerId: string) => CustomerNameDisplay;
  onDelete: (interaction: InteractionListItem) => void;
}

function renderCustomerName(display: CustomerNameDisplay): ReactNode {
  if (display.status === "loading") {
    return <Skeleton className="inline-block h-4 w-28 align-middle" />;
  }
  return display.name;
}

export function getInteractionTableColumns({
  resolveCustomerName,
  onDelete,
}: InteractionTableColumnOptions): ColumnDef<InteractionListItem, unknown>[] {
  return [
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const display = resolveCustomerName(row.original.customer_id);
        return (
          <Link
            href={`/interactions/${row.original.id}`}
            className="font-medium text-foreground hover:underline"
          >
            {renderCustomerName(display)}
          </Link>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => INTERACTION_TYPE_LABELS[row.original.type],
    },
    {
      accessorKey: "interaction_at",
      header: "Date",
      cell: ({ row }) =>
        format(new Date(row.original.interaction_at), "MMM d, yyyy h:mm a"),
    },
    {
      accessorKey: "sentiment",
      header: "Sentiment",
      cell: ({ row }) => (
        <InteractionSentimentBadge sentiment={row.original.sentiment} />
      ),
    },
    {
      accessorKey: "insight_status",
      header: "Insight",
      cell: ({ row }) => (
        <InteractionStatusBadge status={row.original.insight_status} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-nowrap items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/interactions/${row.original.id}`}>View</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/interactions/${row.original.id}/edit`}>Edit</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];
}
