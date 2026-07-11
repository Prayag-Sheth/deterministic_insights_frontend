"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateCustomer } from "@/features/customers/api/customers-api";
import { customerKeys } from "@/features/customers/api/customer-keys";
import type { CustomerUpdateBody } from "@/types/customer";

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CustomerUpdateBody) => updateCustomer(id, body),
    onSuccess: (customer) => {
      queryClient.setQueryData(customerKeys.detail(id), customer);
      void queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
}
