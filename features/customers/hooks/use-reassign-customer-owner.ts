"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { reassignCustomerOwner } from "@/features/customers/api/customers-api";
import { customerKeys } from "@/features/customers/api/customer-keys";
import { isApiError } from "@/lib/axios";

export function useReassignCustomerOwner(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ownerId: string) =>
      reassignCustomerOwner(customerId, { owner_id: ownerId }),
    onSuccess: (customer) => {
      queryClient.setQueryData(customerKeys.detail(customerId), customer);
      void queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success("Owner reassigned");
    },
    onError: (error) => {
      const message = isApiError(error)
        ? error.message
        : "Unable to reassign owner. Please try again.";
      toast.error(message);
    },
  });
}
