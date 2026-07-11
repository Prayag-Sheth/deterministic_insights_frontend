"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface DataTablePaginationProps {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalItems?: number;
  onPageChange: (pageIndex: number) => void;
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  /** Soft loading — keep rows visible with reduced opacity while refetching. */
  isLoading?: boolean;
  /** Hard loading — replace table with skeleton (no data yet). */
  isSkeleton?: boolean;
  emptyMessage?: string;
  emptyTitle?: string;
  emptyAction?: ReactNode;
  pagination?: DataTablePaginationProps;
  className?: string;
}

/**
 * Generic presentation-only table wrapper.
 * Knows nothing about Customers, Interactions, or Dashboard data.
 */
export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  isSkeleton = false,
  emptyMessage = "No results found.",
  emptyTitle = "No data",
  emptyAction,
  pagination,
  className,
}: DataTableProps<TData>) {
  const paginationState: PaginationState | undefined = pagination
    ? { pageIndex: pagination.pageIndex, pageSize: pagination.pageSize }
    : undefined;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: Boolean(pagination),
    pageCount: pagination?.pageCount,
    state: {
      pagination: paginationState,
    },
  });

  if (isSkeleton) {
    return <TableSkeleton columns={columns.length} className={className} />;
  }

  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
        className={cn("rounded-lg border border-dashed", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "space-y-4 transition-opacity",
        isLoading && "pointer-events-none opacity-60",
        className,
      )}
      aria-busy={isLoading || undefined}
    >
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination ? (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {pagination.totalItems !== undefined
              ? `${pagination.totalItems} total`
              : `Page ${pagination.pageIndex + 1} of ${Math.max(pagination.pageCount, 1)}`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading || pagination.pageIndex <= 0}
              onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                isLoading || pagination.pageIndex >= pagination.pageCount - 1
              }
              onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
