"use client";

import { useQuery } from "@tanstack/react-query";

import { getCustomer } from "@/features/customers/api/customers-api";
import { customerKeys } from "@/features/customers/api/customer-keys";

export function useCustomer(id: string) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => getCustomer(id),
    enabled: Boolean(id),
  });
}
