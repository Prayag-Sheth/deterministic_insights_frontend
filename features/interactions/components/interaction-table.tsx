"use client";

import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, startTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { DataTable } from "@/components/shared/data-table";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { getCustomer } from "@/features/customers/api/customers-api";
import { customerKeys } from "@/features/customers/api/customer-keys";
import { buildInteractionsUrl } from "@/features/interactions/components/interaction-filters";
import {
  getInteractionTableColumns,
  type CustomerNameDisplay,
} from "@/features/interactions/components/interaction-table-columns";
import { DeleteInteractionDialog } from "@/features/interactions/components/delete-interaction-dialog";
import { useInteractionsList } from "@/features/interactions/hooks/use-interactions-list";
import {
  dateToEndOfDayIso,
  dateToStartOfDayIso,
} from "@/features/interactions/schemas/interaction-schema";
import { isApiError } from "@/lib/axios";
import type { PaginatedResponse } from "@/types/api";
import type { Customer } from "@/types/customer";
import type {
  InteractionListItem,
  InteractionType,
  SentimentType,
} from "@/types/interaction";

function collectCachedCustomerNames(
  queryClient: ReturnType<typeof useQueryClient>,
): Map<string, string> {
  const map = new Map<string, string>();

  const listEntries = queryClient.getQueriesData<PaginatedResponse<Customer>>({
    queryKey: customerKeys.lists(),
  });
  for (const [, data] of listEntries) {
    for (const customer of data?.items ?? []) {
      map.set(customer.id, customer.name);
    }
  }

  const detailEntries = queryClient.getQueriesData<Customer>({
    queryKey: customerKeys.details(),
  });
  for (const [, customer] of detailEntries) {
    if (customer) {
      map.set(customer.id, customer.name);
    }
  }

  return map;
}

export function InteractionTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("page_size") ?? "20") || 20),
  );

  const customerId = searchParams.get("customer_id") || undefined;
  const typeParam = searchParams.get("type");
  const type: InteractionType | undefined =
    typeParam === "meeting" ||
    typeParam === "call" ||
    typeParam === "email" ||
    typeParam === "demo" ||
    typeParam === "follow_up"
      ? typeParam
      : undefined;
  const sentimentParam = searchParams.get("sentiment");
  const sentiment: SentimentType | undefined =
    sentimentParam === "positive" ||
    sentimentParam === "neutral" ||
    sentimentParam === "negative"
      ? sentimentParam
      : undefined;
  const fromDate = searchParams.get("interaction_at_from") || undefined;
  const toDate = searchParams.get("interaction_at_to") || undefined;

  const filters = useMemo(
    () => ({
      page,
      page_size: pageSize,
      ...(customerId ? { customer_id: customerId } : {}),
      ...(type ? { type } : {}),
      ...(sentiment ? { sentiment } : {}),
      ...(fromDate
        ? { interaction_at_from: dateToStartOfDayIso(fromDate) }
        : {}),
      ...(toDate ? { interaction_at_to: dateToEndOfDayIso(toDate) } : {}),
    }),
    [page, pageSize, customerId, type, sentiment, fromDate, toDate],
  );

  const { data, isLoading, isFetching, isError, error, refetch, isPending } =
    useInteractionsList(filters);

  const [interactionToDelete, setInteractionToDelete] =
    useState<InteractionListItem | null>(null);

  const uniqueCustomerIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of data?.items ?? []) {
      ids.add(item.customer_id);
    }
    return Array.from(ids);
  }, [data?.items]);

  const cachedNames = useMemo(
    () => collectCachedCustomerNames(queryClient),
    // Recompute when list data arrives or customer queries settle.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: refresh when interaction rows change
    [queryClient, data?.items, uniqueCustomerIds.join("|")],
  );

  const missingCustomerIds = useMemo(
    () => uniqueCustomerIds.filter((id) => !cachedNames.has(id)),
    [uniqueCustomerIds, cachedNames],
  );

  const customerQueries = useQueries({
    queries: missingCustomerIds.map((id) => ({
      queryKey: customerKeys.detail(id),
      queryFn: () => getCustomer(id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const customerNameMap = useMemo(() => {
    const map = new Map(cachedNames);
    for (const query of customerQueries) {
      if (query.data) {
        map.set(query.data.id, query.data.name);
      }
    }
    return map;
  }, [cachedNames, customerQueries]);

  const pendingCustomerIds = useMemo(() => {
    const pending = new Set<string>();
    missingCustomerIds.forEach((id, index) => {
      const query = customerQueries[index];
      if (!query || query.isPending || query.isLoading) {
        pending.add(id);
      }
    });
    return pending;
  }, [missingCustomerIds, customerQueries]);

  function resolveCustomerName(customerIdValue: string): CustomerNameDisplay {
    const name = customerNameMap.get(customerIdValue);
    if (name) {
      return { status: "ready", name };
    }
    if (pendingCustomerIds.has(customerIdValue)) {
      return { status: "loading" };
    }
    return { status: "ready", name: "Unknown customer" };
  }

  function resolveCustomerNameText(customerIdValue: string): string {
    const display = resolveCustomerName(customerIdValue);
    return display.status === "loading" ? "Loading…" : display.name;
  }

  const columns = useMemo(
    () =>
      getInteractionTableColumns({
        resolveCustomerName,
        onDelete: setInteractionToDelete,
      }),
    // resolveCustomerName identity changes with the map; columns must refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customerNameMap, pendingCustomerIds],
  );

  function onPageChange(pageIndex: number) {
    startTransition(() => {
      router.push(
        buildInteractionsUrl({
          page: pageIndex + 1,
          page_size: pageSize,
          customer_id: customerId,
          type,
          sentiment,
          interaction_at_from: fromDate,
          interaction_at_to: toDate,
        }),
      );
    });
  }

  if (isError && !data) {
    const message = isApiError(error)
      ? error.message
      : "Unable to load interactions. Please try again.";

    return (
      <ErrorState
        title="Failed to load interactions"
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
        emptyTitle="No interactions found"
        emptyMessage="Try adjusting your filters, or log a new interaction."
        emptyAction={
          <Button asChild size="sm">
            <Link href="/interactions/new">Log interaction</Link>
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

      <DeleteInteractionDialog
        interaction={interactionToDelete}
        open={interactionToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setInteractionToDelete(null);
          }
        }}
        customerName={
          interactionToDelete
            ? resolveCustomerNameText(interactionToDelete.customer_id)
            : undefined
        }
      />
    </>
  );
}
