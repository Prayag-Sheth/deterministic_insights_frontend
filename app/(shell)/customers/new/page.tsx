"use client";

import Link from "next/link";
import { toast } from "sonner";

import { CustomerForm } from "@/features/customers/components/customer-form";
import { useCreateCustomer } from "@/features/customers/hooks/use-create-customer";
import type { CustomerFormOutput } from "@/features/customers/schemas/customer-schema";
import { isApiError } from "@/lib/axios";

export default function NewCustomerPage() {
  const createCustomer = useCreateCustomer();

  async function onSubmit(values: CustomerFormOutput) {
    try {
      await createCustomer.mutateAsync({
        name: values.name,
        company: values.company,
        email: values.email,
        phone: values.phone,
        status: values.status,
      });
      toast.success("Customer created");
    } catch (error) {
      if (!isApiError(error) || error.details.length === 0) {
        toast.error(
          isApiError(error)
            ? error.message
            : "Unable to create customer. Please try again.",
        );
      }
      throw error;
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          <Link href="/customers" className="hover:underline">
            Customers
          </Link>
          <span className="mx-1.5">/</span>
          New
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Add customer</h1>
        <p className="text-sm text-muted-foreground">
          Create a customer record. Ownership is assigned to you automatically.
        </p>
      </div>

      <CustomerForm
        mode="create"
        onSubmit={onSubmit}
        isSubmitting={createCustomer.isPending}
        cancelHref="/customers"
      />

      {createCustomer.isError &&
      (!isApiError(createCustomer.error) ||
        createCustomer.error.details.length === 0) ? (
        <p className="text-sm text-destructive" role="alert">
          {isApiError(createCustomer.error)
            ? createCustomer.error.message
            : "Unable to create customer. Please try again."}
        </p>
      ) : null}
    </div>
  );
}
