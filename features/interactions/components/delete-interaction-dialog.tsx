"use client";

import { format } from "date-fns";

import { AppDialog } from "@/components/shared/app-dialog";
import { useDeleteInteraction } from "@/features/interactions/hooks/use-delete-interaction";
import { INTERACTION_TYPE_LABELS } from "@/features/interactions/schemas/interaction-schema";
import type { InteractionListItem } from "@/types/interaction";

interface DeleteInteractionDialogProps {
  interaction: InteractionListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName?: string;
}

export function DeleteInteractionDialog({
  interaction,
  open,
  onOpenChange,
  customerName,
}: DeleteInteractionDialogProps) {
  const deleteInteraction = useDeleteInteraction();

  async function onConfirm() {
    if (!interaction) {
      return;
    }

    try {
      await deleteInteraction.mutateAsync(interaction.id);
      onOpenChange(false);
    } catch {
      // Error toast is handled in the mutation hook.
    }
  }

  const typeLabel = interaction
    ? INTERACTION_TYPE_LABELS[interaction.type]
    : "interaction";
  const when = interaction
    ? format(new Date(interaction.interaction_at), "MMM d, yyyy")
    : "";
  const subject = customerName
    ? `${typeLabel} with ${customerName}${when ? ` on ${when}` : ""}`
    : typeLabel;

  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete interaction"
      description={
        interaction
          ? `Are you sure you want to delete this ${subject}? This soft-deletes the interaction.`
          : "Are you sure you want to delete this interaction?"
      }
      confirmLabel="Delete"
      confirmVariant="destructive"
      onConfirm={() => void onConfirm()}
      isConfirmLoading={deleteInteraction.isPending}
    />
  );
}
