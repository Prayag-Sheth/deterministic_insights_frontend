"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { createCustomer } from "@/features/customers/api/customers-api";
import { customerKeys } from "@/features/customers/api/customer-keys";
import type { CustomerCreateBody } from "@/types/customer";

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (body: CustomerCreateBody) => createCustomer(body),
    onSuccess: (customer) => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      router.push(`/customers/${customer.id}`);
    },
  });
}
