"use client";

import { AppDialog } from "@/components/shared/app-dialog";
import { useDeleteCustomer } from "@/features/customers/hooks/use-delete-customer";
import type { Customer } from "@/types/customer";

interface DeleteCustomerDialogProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCustomerDialog({
  customer,
  open,
  onOpenChange,
}: DeleteCustomerDialogProps) {
  const deleteCustomer = useDeleteCustomer();

  async function onConfirm() {
    if (!customer) {
      return;
    }

    try {
      await deleteCustomer.mutateAsync(customer.id);
      onOpenChange(false);
    } catch {
      // Error toast is handled in the mutation hook.
    }
  }

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete customer"
      description={
        customer
          ? `Are you sure you want to delete ${customer.name}? This soft-deletes the customer and their interactions.`
          : "Are you sure you want to delete this customer?"
      }
      confirmLabel="Delete"
      confirmVariant="destructive"
      onConfirm={() => void onConfirm()}
      isConfirmLoading={deleteCustomer.isPending}
    />
  );
}
