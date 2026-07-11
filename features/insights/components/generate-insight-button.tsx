"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/spinner";

interface GenerateInsightButtonProps {
  label: string;
  hasNotes: boolean;
  isGenerating: boolean;
  disabled?: boolean;
  onGenerate: () => void;
}

export function GenerateInsightButton({
  label,
  hasNotes,
  isGenerating,
  disabled = false,
  onGenerate,
}: GenerateInsightButtonProps) {
  const isDisabled = !hasNotes || isGenerating || disabled;

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        disabled={isDisabled}
        onClick={onGenerate}
        title={
          !hasNotes
            ? "Add meeting notes before generating an insight"
            : undefined
        }
      >
        {isGenerating ? (
          <>
            <Spinner size="sm" className="text-primary-foreground" />
            Generating…
          </>
        ) : (
          label
        )}
      </Button>
      {!hasNotes ? (
        <p className="text-xs text-muted-foreground">
          Add meeting notes before generating an insight.
        </p>
      ) : null}
    </div>
  );
}
