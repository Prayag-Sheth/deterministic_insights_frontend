"use client";

import { format } from "date-fns";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerStatusBadge } from "@/features/customers/components/customer-status-badge";
import { resolveOwnerDisplay } from "@/features/customers/utils/format-owner-label";
import type { Customer } from "@/types/customer";

export interface CustomerTableColumnOptions {
  showOwnerColumn: boolean;
  currentUserId: string | undefined;
  ownerNameById?: ReadonlyMap<string, string>;
  ownersLoading?: boolean;
  onDelete: (customer: Customer) => void;
}

export function getCustomerTableColumns({
  showOwnerColumn,
  currentUserId,
  ownerNameById,
  ownersLoading = false,
  onDelete,
}: CustomerTableColumnOptions): ColumnDef<Customer, unknown>[] {
  const columns: ColumnDef<Customer, unknown>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link
          href={`/customers/${row.original.id}`}
          className="font-medium text-foreground hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "company",
      header: "Company",
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="break-all">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <CustomerStatusBadge status={row.original.status} />,
    },
  ];

  if (showOwnerColumn) {
    columns.push({
      accessorKey: "owner_id",
      header: "Owner",
      cell: ({ row }) => {
        const display = resolveOwnerDisplay(
          row.original.owner_id,
          currentUserId,
          ownerNameById,
          ownersLoading,
        );
        if (display.status === "loading") {
          return <Skeleton className="h-4 w-24" />;
        }
        return display.label;
      },
    });
  }

  columns.push(
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) =>
        format(new Date(row.original.created_at), "MMM d, yyyy"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-nowrap items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/customers/${row.original.id}`}>View</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/customers/${row.original.id}/edit`}>Edit</Link>
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
  );

  return columns;
}
