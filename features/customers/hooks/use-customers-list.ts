"use client";

import { useQuery } from "@tanstack/react-query";

import { listCustomers } from "@/features/customers/api/customers-api";
import { customerKeys } from "@/features/customers/api/customer-keys";
import type { CustomerListParams } from "@/types/customer";

export function useCustomersList(filters: CustomerListParams) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => listCustomers(filters),
    // Keep previous page visible while filters/pagination fetch — no blank flash.
    placeholderData: (previousData) => previousData,
  });
}
