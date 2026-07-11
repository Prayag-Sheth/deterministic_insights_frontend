"use client";

import { format } from "date-fns";
import Link from "next/link";
import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useCustomer } from "@/features/customers/hooks/use-customer";
import { INTERACTION_TYPE_LABELS } from "@/features/interactions/schemas/interaction-schema";
import type { InteractionDetail } from "@/types/interaction";

interface InteractionDetailsCardProps {
  interaction: InteractionDetail;
}

export function InteractionDetailsCard({
  interaction,
}: InteractionDetailsCardProps) {
  const {
    data: customer,
    isPending: customerPending,
    isError: customerError,
  } = useCustomer(interaction.customer_id);

  let customerValue: ReactNode;
  if (customer?.name) {
    customerValue = (
      <Link
        href={`/customers/${interaction.customer_id}`}
        className="font-medium text-foreground hover:underline"
      >
        {customer.name}
      </Link>
    );
  } else if (customerPending) {
    customerValue = <Skeleton className="h-4 w-32" />;
  } else if (customerError) {
    customerValue = "Unknown customer";
  } else {
    customerValue = "Unknown customer";
  }

  const fields: { label: string; value: ReactNode }[] = [
    {
      label: "Customer",
      value: customerValue,
    },
    {
      label: "Type",
      value: INTERACTION_TYPE_LABELS[interaction.type],
    },
    {
      label: "Date & time",
      value: format(new Date(interaction.interaction_at), "PPp"),
    },
    {
      label: "Notes",
      value: (
        <p className="whitespace-pre-wrap text-sm text-foreground">
          {interaction.raw_notes}
        </p>
      ),
    },
    {
      label: "Created",
      value: format(new Date(interaction.created_at), "PPp"),
    },
    {
      label: "Updated",
      value: format(new Date(interaction.updated_at), "PPp"),
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <dl className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.label}
            className={
              field.label === "Notes" ? "space-y-1 sm:col-span-2" : "space-y-1"
            }
          >
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {field.label}
            </dt>
            <dd className="text-sm text-foreground break-words">
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
