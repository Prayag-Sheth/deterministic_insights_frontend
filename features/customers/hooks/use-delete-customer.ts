"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteCustomer } from "@/features/customers/api/customers-api";
import { customerKeys } from "@/features/customers/api/customer-keys";
import { isApiError } from "@/lib/axios";

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.removeQueries({ queryKey: customerKeys.detail(id) });

      if (
        pathname === `/customers/${id}` ||
        pathname.startsWith(`/customers/${id}/`)
      ) {
        router.push("/customers");
      }

      toast.success("Customer deleted");
    },
    onError: (error) => {
      const message = isApiError(error)
        ? error.message
        : "Unable to delete customer. Please try again.";
      toast.error(message);
    },
  });
}
