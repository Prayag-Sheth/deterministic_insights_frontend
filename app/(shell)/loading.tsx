import { CardSkeleton } from "@/components/shared/card-skeleton";
import { TableSkeleton } from "@/components/shared/table-skeleton";

/** Instant shell while the destination route segment loads. */
export default function ShellLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      </div>
      <CardSkeleton className="min-h-[8rem]" />
      <TableSkeleton columns={5} rows={6} />
    </div>
  );
}
