import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import { CustomerFilters } from "@/features/customers/components/customer-filters";
import { CustomerTable } from "@/features/customers/components/customer-table";

export const metadata: Metadata = {
  title: "Customers",
};

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Manage customer accounts and ownership.
          </p>
        </div>
        <Button asChild>
          <Link href="/customers/new">Add customer</Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="h-9 max-w-md animate-pulse rounded-md bg-muted" />
            <TableSkeleton columns={6} />
          </div>
        }
      >
        <div className="space-y-4">
          <CustomerFilters />
          <CustomerTable />
        </div>
      </Suspense>
    </div>
  );
}
