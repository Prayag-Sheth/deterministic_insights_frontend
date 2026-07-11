"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { CardSkeleton } from "@/components/shared/card-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { CustomerForm } from "@/features/customers/components/customer-form";
import { useCustomer } from "@/features/customers/hooks/use-customer";
import { useUpdateCustomer } from "@/features/customers/hooks/use-update-customer";
import type { CustomerFormOutput } from "@/features/customers/schemas/customer-schema";
import { isApiError } from "@/lib/axios";

export default function EditCustomerPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const {
    data: customer,
    isPending,
    isError,
    error,
    refetch,
  } = useCustomer(id);
  const updateCustomer = useUpdateCustomer(id);

  async function onSubmit(values: CustomerFormOutput) {
    try {
      await updateCustomer.mutateAsync({
        name: values.name,
        company: values.company,
        email: values.email,
        phone: values.phone,
        status: values.status,
      });
      toast.success("Customer updated");
      router.push(`/customers/${id}`);
    } catch (error) {
      if (!isApiError(error) || error.details.length === 0) {
        toast.error(
          isApiError(error)
            ? error.message
            : "Unable to update customer. Please try again.",
        );
      }
      throw error;
    }
  }

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
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          <Link href="/customers" className="hover:underline">
            Customers
          </Link>
          <span className="mx-1.5">/</span>
          <Link href={`/customers/${id}`} className="hover:underline">
            {customer?.name ?? "…"}
          </Link>
          <span className="mx-1.5">/</span>
          Edit
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Edit customer</h1>
        <p className="text-sm text-muted-foreground">
          Update customer details. Ownership cannot be changed here.
        </p>
      </div>

      {isPending || !customer ? (
        <CardSkeleton />
      ) : (
        <CustomerForm
          mode="edit"
          defaultValues={{
            name: customer.name,
            company: customer.company,
            email: customer.email,
            phone: customer.phone ?? "",
            status: customer.status,
          }}
          onSubmit={onSubmit}
          isSubmitting={updateCustomer.isPending}
          cancelHref={`/customers/${customer.id}`}
        />
      )}
    </div>
  );
}
