"use client";

import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { Spinner } from "@/components/shared/spinner";
import { ActionItemsList } from "@/features/insights/components/action-items-list";
import { GenerateInsightButton } from "@/features/insights/components/generate-insight-button";
import { RiskList } from "@/features/insights/components/risk-list";
import { useGenerateInsight } from "@/features/insights/hooks/use-generate-insight";
import { useInsight } from "@/features/insights/hooks/use-insight";
import { hasInsightContent } from "@/features/insights/lib/has-insight-content";
import { insightUpdatedAtLabel } from "@/features/insights/lib/insight-updated-at-label";
import { InteractionSentimentBadge } from "@/features/interactions/components/interaction-sentiment-badge";
import { InteractionStatusBadge } from "@/features/interactions/components/interaction-status-badge";
import { isApiError } from "@/lib/axios";
import type { InsightResponse } from "@/types/insight";

const EMPTY_INSIGHT_COPY = "No AI insight generated yet.";

interface InsightCardProps {
  interactionId: string;
  rawNotes: string;
}

interface InsightContentProps {
  insight: InsightResponse;
  hasNotes: boolean;
  isGenerating: boolean;
  regenerateLabel: "Regenerate" | "Retry";
  onGenerate: () => void;
  showFailureWarning?: boolean;
}

function InsightContent({
  insight,
  hasNotes,
  isGenerating,
  regenerateLabel,
  onGenerate,
  showFailureWarning = false,
}: InsightContentProps) {
  return (
    <div className="space-y-5">
      {showFailureWarning ? (
        <div
          role="alert"
          className="flex gap-3 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm"
        >
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400"
            aria-hidden
          />
          <div className="space-y-1">
            <p className="font-medium text-foreground">
              Last regeneration failed
            </p>
            <p className="text-muted-foreground">
              {insight.error
                ? `Reason: ${insight.error}`
                : "Previous insight content is still shown below."}
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Sentiment
          </p>
          <InteractionSentimentBadge sentiment={insight.sentiment} />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Status
          </p>
          <InteractionStatusBadge status={insight.status} />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Summary
        </p>
        <p className="whitespace-pre-wrap text-sm text-foreground">
          {insight.summary ?? "—"}
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Action items
        </p>
        <ActionItemsList items={insight.action_items} />
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Risks
        </p>
        <RiskList risks={insight.risks} />
      </div>

      <p className="text-xs text-muted-foreground">
        {insightUpdatedAtLabel(insight.status)}{" "}
        {format(new Date(insight.updated_at), "PPp")}
      </p>

      <GenerateInsightButton
        label={regenerateLabel}
        hasNotes={hasNotes}
        isGenerating={isGenerating}
        onGenerate={onGenerate}
      />
    </div>
  );
}

export function InsightCard({ interactionId, rawNotes }: InsightCardProps) {
  const {
    data: insight,
    isPending: isLoading,
    isError,
    error,
    refetch,
  } = useInsight(interactionId);
  const generateMutation = useGenerateInsight(interactionId);

  const hasNotes = rawNotes.trim().length > 0;
  const isGenerating = generateMutation.isPending;
  // React Query data is `undefined` until the first fetch settles; treat like null.
  const hasInsight = insight != null;
  const isEmptyOrFirstGen =
    !hasInsight ||
    (insight.status === "pending" && !hasInsightContent(insight));
  // Server-reported pending only — mutation loading is owned by GenerateInsightButton.
  const showServerPendingUi =
    !isGenerating &&
    hasInsight &&
    insight.status === "pending" &&
    !hasInsightContent(insight);

  function handleGenerate() {
    generateMutation.mutate();
  }

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold tracking-tight">AI Insight</h2>

      {isLoading ? (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground"
        >
          <Spinner size="lg" />
          <p className="text-sm">Loading insight…</p>
        </div>
      ) : isError ? (
        <ErrorState
          title="Failed to load insight"
          message={
            isApiError(error)
              ? error.message
              : "Unable to load insight. The interaction is still available."
          }
          onRetry={() => void refetch()}
          className="py-6"
        />
      ) : showServerPendingUi && hasInsight ? (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground"
        >
          <Spinner size="lg" />
          <p className="text-sm">Generating insight…</p>
          {insight.updated_at ? (
            <p className="text-xs">
              {insightUpdatedAtLabel(insight.status)}{" "}
              {format(new Date(insight.updated_at), "PPp")}
            </p>
          ) : null}
          <GenerateInsightButton
            label="Generate insight"
            hasNotes={hasNotes}
            isGenerating={false}
            disabled
            onGenerate={handleGenerate}
          />
        </div>
      ) : isEmptyOrFirstGen || !hasInsight ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{EMPTY_INSIGHT_COPY}</p>
          <GenerateInsightButton
            label="Generate insight"
            hasNotes={hasNotes}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
        </div>
      ) : insight.status === "failed" && !hasInsightContent(insight) ? (
        <div className="space-y-4">
          <InteractionStatusBadge status={insight.status} />
          {insight.error ? (
            <p className="text-sm text-destructive">{insight.error}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Insight generation failed.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {insightUpdatedAtLabel(insight.status)}{" "}
            {format(new Date(insight.updated_at), "PPp")}
          </p>
          <GenerateInsightButton
            label="Retry"
            hasNotes={hasNotes}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
        </div>
      ) : insight.status === "failed" && hasInsightContent(insight) ? (
        <InsightContent
          insight={insight}
          hasNotes={hasNotes}
          isGenerating={isGenerating}
          regenerateLabel="Retry"
          onGenerate={handleGenerate}
          showFailureWarning
        />
      ) : (
        <InsightContent
          insight={insight}
          hasNotes={hasNotes}
          isGenerating={isGenerating}
          regenerateLabel="Regenerate"
          onGenerate={handleGenerate}
        />
      )}
    </section>
  );
}
