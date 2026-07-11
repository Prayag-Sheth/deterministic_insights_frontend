"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { CardSkeleton } from "@/components/shared/card-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { CustomerDetailsCard } from "@/features/customers/components/customer-details-card";
import { DeleteCustomerDialog } from "@/features/customers/components/delete-customer-dialog";
import { useCustomer } from "@/features/customers/hooks/use-customer";
import { isApiError } from "@/lib/axios";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const {
    data: customer,
    isPending,
    isError,
    error,
    refetch,
  } = useCustomer(id);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isError && !customer) {
    const isNotFound = isApiError(error) && error.status === 404;

    return (
      <ErrorState
        title={isNotFound ? "Customer not found" : "Failed to load customer"}
        message={
          isNotFound
            ? "This customer does not exist or you do not have access to it."
            : isApiError(error)
              ? error.message
              : "Unable to load customer. Please try again."
        }
        onRetry={isNotFound ? undefined : () => void refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            <Link href="/customers" className="hover:underline">
              Customers
            </Link>
            <span className="mx-1.5">/</span>
            {customer?.name ?? "…"}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {customer?.name ?? (
              <span className="inline-block h-7 w-48 animate-pulse rounded-md bg-muted align-middle" />
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            {customer?.company ?? (
              <span className="inline-block h-4 w-32 animate-pulse rounded-md bg-muted align-middle" />
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild disabled={!customer}>
            <Link
              href={customer ? `/customers/${customer.id}/edit` : "#"}
              aria-disabled={!customer}
              tabIndex={customer ? undefined : -1}
              className={
                !customer ? "pointer-events-none opacity-50" : undefined
              }
            >
              Edit
            </Link>
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!customer}
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {isPending || !customer ? (
        <CardSkeleton />
      ) : (
        <>
          <CustomerDetailsCard customer={customer} />
          <DeleteCustomerDialog
            customer={customer}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
          />
        </>
      )}
    </div>
  );
}
