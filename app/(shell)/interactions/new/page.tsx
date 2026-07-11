"use client";

import Link from "next/link";
import { toast } from "sonner";

import { InteractionForm } from "@/features/interactions/components/interaction-form";
import { useCreateInteraction } from "@/features/interactions/hooks/use-create-interaction";
import { isApiError } from "@/lib/axios";
import type { InteractionType } from "@/types/interaction";

export default function NewInteractionPage() {
  const createInteraction = useCreateInteraction();

  async function onSubmit(values: {
    customer_id: string;
    type: InteractionType;
    interaction_at: string;
    raw_notes: string;
  }) {
    try {
      await createInteraction.mutateAsync({
        customer_id: values.customer_id,
        type: values.type,
        interaction_at: values.interaction_at,
        raw_notes: values.raw_notes,
      });
      toast.success("Interaction created");
    } catch (error) {
      if (!isApiError(error) || error.details.length === 0) {
        toast.error(
          isApiError(error)
            ? error.message
            : "Unable to create interaction. Please try again.",
        );
      }
      throw error;
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
          New
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Log interaction
        </h1>
        <p className="text-sm text-muted-foreground">
          Record a meeting, call, or other customer touchpoint.
        </p>
      </div>

      <InteractionForm
        mode="create"
        onSubmit={onSubmit}
        isSubmitting={createInteraction.isPending}
        cancelHref="/interactions"
      />

      {createInteraction.isError &&
      (!isApiError(createInteraction.error) ||
        createInteraction.error.details.length === 0) ? (
        <p className="text-sm text-destructive" role="alert">
          {isApiError(createInteraction.error)
            ? createInteraction.error.message
            : "Unable to create interaction. Please try again."}
        </p>
      ) : null}
    </div>
  );
}
