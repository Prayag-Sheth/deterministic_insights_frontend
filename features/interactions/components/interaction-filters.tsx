"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { startTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomersList } from "@/features/customers/hooks/use-customers-list";
import { INTERACTION_TYPE_LABELS } from "@/features/interactions/schemas/interaction-schema";
import type { InteractionType, SentimentType } from "@/types/interaction";

function buildInteractionsUrl(params: {
  page?: number;
  page_size?: number;
  customer_id?: string;
  type?: string;
  sentiment?: string;
  interaction_at_from?: string;
  interaction_at_to?: string;
}): string {
  const next = new URLSearchParams();

  const page = params.page ?? 1;
  const pageSize = params.page_size ?? 20;

  if (page !== 1) {
    next.set("page", String(page));
  }
  if (pageSize !== 20) {
    next.set("page_size", String(pageSize));
  }
  if (params.customer_id) {
    next.set("customer_id", params.customer_id);
  }
  if (
    params.type === "meeting" ||
    params.type === "call" ||
    params.type === "email" ||
    params.type === "demo" ||
    params.type === "follow_up"
  ) {
    next.set("type", params.type);
  }
  if (
    params.sentiment === "positive" ||
    params.sentiment === "neutral" ||
    params.sentiment === "negative"
  ) {
    next.set("sentiment", params.sentiment);
  }
  if (params.interaction_at_from) {
    next.set("interaction_at_from", params.interaction_at_from);
  }
  if (params.interaction_at_to) {
    next.set("interaction_at_to", params.interaction_at_to);
  }

  const query = next.toString();
  return query ? `/interactions?${query}` : "/interactions";
}

const TYPE_OPTIONS = Object.entries(INTERACTION_TYPE_LABELS) as [
  InteractionType,
  string,
][];

export function InteractionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const customerId = searchParams.get("customer_id") ?? "";
  const typeParam = searchParams.get("type");
  const type: InteractionType | "" =
    typeParam === "meeting" ||
    typeParam === "call" ||
    typeParam === "email" ||
    typeParam === "demo" ||
    typeParam === "follow_up"
      ? typeParam
      : "";
  const sentimentParam = searchParams.get("sentiment");
  const sentiment: SentimentType | "" =
    sentimentParam === "positive" ||
    sentimentParam === "neutral" ||
    sentimentParam === "negative"
      ? sentimentParam
      : "";
  const interactionAtFrom = searchParams.get("interaction_at_from") ?? "";
  const interactionAtTo = searchParams.get("interaction_at_to") ?? "";
  const pageSize = Number(searchParams.get("page_size") ?? "20") || 20;

  const { data: customersData } = useCustomersList({
    page: 1,
    page_size: 100,
  });

  function navigate(overrides: {
    page?: number;
    page_size?: number;
    customer_id?: string;
    type?: string;
    sentiment?: string;
    interaction_at_from?: string;
    interaction_at_to?: string;
  }) {
    startTransition(() => {
      router.push(
        buildInteractionsUrl({
          page: overrides.page ?? 1,
          page_size: overrides.page_size ?? pageSize,
          customer_id:
            overrides.customer_id !== undefined
              ? overrides.customer_id
              : customerId,
          type: overrides.type !== undefined ? overrides.type : type,
          sentiment:
            overrides.sentiment !== undefined ? overrides.sentiment : sentiment,
          interaction_at_from:
            overrides.interaction_at_from !== undefined
              ? overrides.interaction_at_from
              : interactionAtFrom,
          interaction_at_to:
            overrides.interaction_at_to !== undefined
              ? overrides.interaction_at_to
              : interactionAtTo,
        }),
      );
    });
  }

  function onClear() {
    startTransition(() => {
      router.push("/interactions");
    });
  }

  const hasFilters = Boolean(
    customerId || type || sentiment || interactionAtFrom || interactionAtTo,
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="interaction-customer-filter">Customer</Label>
          <Select
            value={customerId || "all"}
            onValueChange={(value) =>
              navigate({
                customer_id: value === "all" ? "" : value,
                page: 1,
              })
            }
          >
            <SelectTrigger id="interaction-customer-filter" className="w-full">
              <SelectValue placeholder="All customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All customers</SelectItem>
              {(customersData?.items ?? []).map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                  {customer.status === "inactive" ? " (inactive)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="interaction-type-filter">Type</Label>
          <Select
            value={type || "all"}
            onValueChange={(value) =>
              navigate({ type: value === "all" ? "" : value, page: 1 })
            }
          >
            <SelectTrigger id="interaction-type-filter" className="w-full">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {TYPE_OPTIONS.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="interaction-sentiment-filter">Sentiment</Label>
          <Select
            value={sentiment || "all"}
            onValueChange={(value) =>
              navigate({ sentiment: value === "all" ? "" : value, page: 1 })
            }
          >
            <SelectTrigger id="interaction-sentiment-filter" className="w-full">
              <SelectValue placeholder="All sentiments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sentiments</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="interaction-from-filter">From</Label>
          <Input
            id="interaction-from-filter"
            type="date"
            value={interactionAtFrom}
            onChange={(event) =>
              navigate({
                interaction_at_from: event.target.value,
                page: 1,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="interaction-to-filter">To</Label>
          <Input
            id="interaction-to-filter"
            type="date"
            value={interactionAtTo}
            onChange={(event) =>
              navigate({
                interaction_at_to: event.target.value,
                page: 1,
              })
            }
          />
        </div>
      </div>

      {hasFilters ? (
        <Button type="button" variant="ghost" onClick={onClear}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}

export { buildInteractionsUrl };
