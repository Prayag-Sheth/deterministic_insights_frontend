"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { CardSkeleton } from "@/components/shared/card-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { useCustomer } from "@/features/customers/hooks/use-customer";
import { InteractionForm } from "@/features/interactions/components/interaction-form";
import { useInteraction } from "@/features/interactions/hooks/use-interaction";
import { useUpdateInteraction } from "@/features/interactions/hooks/use-update-interaction";
import {
  INTERACTION_TYPE_LABELS,
  isoToDatetimeLocal,
} from "@/features/interactions/schemas/interaction-schema";
import { isApiError } from "@/lib/axios";
import type { InteractionType } from "@/types/interaction";

export default function EditInteractionPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const {
    data: interaction,
    isPending,
    isError,
    error,
    refetch,
  } = useInteraction(id);
  const {
    data: customer,
    isPending: customerPending,
    isError: customerError,
  } = useCustomer(interaction?.customer_id ?? "");
  const updateInteraction = useUpdateInteraction(id);

  async function onSubmit(values: {
    type: InteractionType;
    interaction_at: string;
    raw_notes: string;
  }) {
    try {
      await updateInteraction.mutateAsync({
        type: values.type,
        interaction_at: values.interaction_at,
        raw_notes: values.raw_notes,
      });
      toast.success("Interaction updated");
      router.push(`/interactions/${id}`);
    } catch (error) {
      if (!isApiError(error) || error.details.length === 0) {
        toast.error(
          isApiError(error)
            ? error.message
            : "Unable to update interaction. Please try again.",
        );
      }
      throw error;
    }
  }

  if (isError && !interaction) {
    const isNotFound = isApiError(error) && error.status === 404;

    return (
      <ErrorState
        title={
          isNotFound ? "Interaction not found" : "Failed to load interaction"
        }
        message={
          isNotFound
            ? "This interaction does not exist or you do not have access to it."
            : isApiError(error)
              ? error.message
              : "Unable to load interaction. Please try again."
        }
        onRetry={isNotFound ? undefined : () => void refetch()}
      />
    );
  }

  const typeLabel = interaction
    ? INTERACTION_TYPE_LABELS[interaction.type]
    : "…";

  let customerName = "";
  if (interaction) {
    if (customer?.name) {
      customerName = customer.name;
    } else if (customerPending) {
      customerName = "Loading…";
    } else if (customerError || !customer) {
      customerName = "Unknown customer";
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          <Link href="/interactions" className="hover:underline">
            Interactions
          </Link>
          <span className="mx-1.5">/</span>
          <Link href={`/interactions/${id}`} className="hover:underline">
            {typeLabel}
          </Link>
          <span className="mx-1.5">/</span>
          Edit
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit interaction
        </h1>
        <p className="text-sm text-muted-foreground">
          Update type, date, or notes. Customer cannot be changed.
        </p>
      </div>

      {isPending || !interaction ? (
        <CardSkeleton />
      ) : (
        <InteractionForm
          mode="edit"
          customerName={customerName}
          defaultValues={{
            type: interaction.type,
            interaction_at: isoToDatetimeLocal(interaction.interaction_at),
            raw_notes: interaction.raw_notes,
          }}
          onSubmit={onSubmit}
          isSubmitting={updateInteraction.isPending}
          cancelHref={`/interactions/${interaction.id}`}
        />
      )}
    </div>
  );
}
