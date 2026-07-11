"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { CardSkeleton } from "@/components/shared/card-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomer } from "@/features/customers/hooks/use-customer";
import { InsightCard } from "@/features/insights/components/insight-card";
import { useInsight } from "@/features/insights/hooks/use-insight";
import { DeleteInteractionDialog } from "@/features/interactions/components/delete-interaction-dialog";
import { InteractionDetailsCard } from "@/features/interactions/components/interaction-details-card";
import { useInteraction } from "@/features/interactions/hooks/use-interaction";
import { INTERACTION_TYPE_LABELS } from "@/features/interactions/schemas/interaction-schema";
import { isApiError } from "@/lib/axios";

export default function InteractionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const {
    data: interaction,
    isPending,
    isError,
    error,
    refetch,
  } = useInteraction(id);
  // Start insight fetch in parallel with the interaction detail request.
  useInsight(id);
  const {
    data: customer,
    isPending: customerPending,
    isError: customerError,
  } = useCustomer(interaction?.customer_id ?? "");
  const [deleteOpen, setDeleteOpen] = useState(false);

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
    : null;

  let customerNameLabel: string | null = null;
  let customerNamePending = false;
  if (interaction) {
    if (customer?.name) {
      customerNameLabel = customer.name;
    } else if (customerPending) {
      customerNamePending = true;
    } else if (customerError || !customer) {
      customerNameLabel = "Unknown customer";
    }
  }

  const titleCustomerPart = customerNamePending
    ? null
    : (customerNameLabel ?? null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            <Link href="/interactions" className="hover:underline">
              Interactions
            </Link>
            <span className="mx-1.5">/</span>
            {typeLabel ?? "…"}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {typeLabel ? (
              <>
                {typeLabel} with{" "}
                {titleCustomerPart ?? (
                  <Skeleton className="inline-block h-7 w-36 align-middle" />
                )}
              </>
            ) : (
              <Skeleton className="inline-block h-7 w-56 align-middle" />
            )}
          </h1>
          <p className="text-sm text-muted-foreground">
            {interaction ? (
              format(new Date(interaction.interaction_at), "PPp")
            ) : (
              <Skeleton className="inline-block h-4 w-40 align-middle" />
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild disabled={!interaction}>
            <Link
              href={interaction ? `/interactions/${interaction.id}/edit` : "#"}
              aria-disabled={!interaction}
              tabIndex={interaction ? undefined : -1}
              className={
                !interaction ? "pointer-events-none opacity-50" : undefined
              }
            >
              Edit
            </Link>
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!interaction}
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {isPending || !interaction ? (
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton className="min-h-[12rem]" />
        </div>
      ) : (
        <>
          <InteractionDetailsCard interaction={interaction} />
          <InsightCard
            interactionId={interaction.id}
            rawNotes={interaction.raw_notes}
          />
          <DeleteInteractionDialog
            interaction={interaction}
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            customerName={
              customerNamePending
                ? "Loading…"
                : (customerNameLabel ?? undefined)
            }
          />
        </>
      )}
    </div>
  );
}
