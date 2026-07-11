"use client";

import { useMemo, useState, startTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { buildCustomersUrl } from "@/features/customers/components/customer-filters";
import { getCustomerTableColumns } from "@/features/customers/components/customer-table-columns";
import { DeleteCustomerDialog } from "@/features/customers/components/delete-customer-dialog";
import { useCustomersList } from "@/features/customers/hooks/use-customers-list";
import { useUsersList } from "@/features/users/hooks/use-users-list";
import { isApiError } from "@/lib/axios";
import { useAppSelector } from "@/store/hooks";
import type { Customer, CustomerStatus } from "@/types/customer";

const USERS_LIST_PARAMS = { page: 1, page_size: 100 } as const;

export function CustomerTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const isAdmin = currentUser?.role === "admin";

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("page_size") ?? "20") || 20),
  );
  const statusParam = searchParams.get("status");
  const status: CustomerStatus | undefined =
    statusParam === "active" || statusParam === "inactive"
      ? statusParam
      : undefined;
  const search = searchParams.get("search")?.trim() || undefined;

  const filters = useMemo(
    () => ({
      page,
      page_size: pageSize,
      ...(status ? { status } : {}),
      ...(search ? { search } : {}),
    }),
    [page, pageSize, status, search],
  );

  const { data, isLoading, isFetching, isError, error, refetch, isPending } =
    useCustomersList(filters);

  const {
    data: usersData,
    isPending: usersPending,
    isFetching: usersFetching,
  } = useUsersList(USERS_LIST_PARAMS, {
    enabled: isAdmin,
  });

  const ownersLoading = isAdmin && (usersPending || (usersFetching && !usersData));

  const ownerNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const user of usersData?.items ?? []) {
      map.set(user.id, user.name);
    }
    return map;
  }, [usersData?.items]);

  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );

  const columns = useMemo(
    () =>
      getCustomerTableColumns({
        showOwnerColumn: isAdmin,
        currentUserId: currentUser?.id,
        ownerNameById,
        ownersLoading,
        onDelete: setCustomerToDelete,
      }),
    [isAdmin, currentUser?.id, ownerNameById, ownersLoading],
  );

  function onPageChange(pageIndex: number) {
    startTransition(() => {
      router.push(
        buildCustomersUrl({
          page: pageIndex + 1,
          page_size: pageSize,
          status,
          search,
        }),
      );
    });
  }

  if (isError && !data) {
    const message = isApiError(error)
      ? error.message
      : "Unable to load customers. Please try again.";

    return (
      <ErrorState
        title="Failed to load customers"
        message={message}
        onRetry={() => void refetch()}
      />
    );
  }

  const showSkeleton = !data && (isPending || isLoading);

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isSkeleton={showSkeleton}
        isLoading={Boolean(data) && isFetching}
        emptyTitle="No customers found"
        emptyMessage="Try adjusting your filters, or create a new customer."
        emptyAction={
          <Button asChild size="sm">
            <Link href="/customers/new">Add customer</Link>
          </Button>
        }
        pagination={
          data
            ? {
                pageIndex: Math.max(0, (data.page ?? page) - 1),
                pageSize: data.page_size ?? pageSize,
                pageCount: Math.max(1, data.total_pages ?? 1),
                totalItems: data.total,
                onPageChange,
              }
            : undefined
        }
      />

      <DeleteCustomerDialog
        customer={customerToDelete}
        open={customerToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCustomerToDelete(null);
          }
        }}
      />
    </>
  );
}
