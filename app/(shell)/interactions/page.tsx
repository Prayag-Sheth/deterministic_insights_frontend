import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { TableSkeleton } from "@/components/shared/table-skeleton";
import { Button } from "@/components/ui/button";
import { InteractionFilters } from "@/features/interactions/components/interaction-filters";
import { InteractionTable } from "@/features/interactions/components/interaction-table";

export const metadata: Metadata = {
  title: "Interactions",
};

export default function InteractionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Interactions
          </h1>
          <p className="text-sm text-muted-foreground">
            Log meetings and track customer conversations.
          </p>
        </div>
        <Button asChild>
          <Link href="/interactions/new">Log interaction</Link>
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
          <InteractionFilters />
          <InteractionTable />
        </div>
      </Suspense>
    </div>
  );
}
