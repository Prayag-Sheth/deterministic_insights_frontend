import type { InsightResponse } from "@/types/insight";

/** True when the insight still has displayable prior generation content. */
export function hasInsightContent(
  insight: InsightResponse | null | undefined,
): boolean {
  if (insight == null) {
    return false;
  }
  return (
    (insight.summary != null && insight.summary.trim().length > 0) ||
    insight.sentiment != null ||
    insight.action_items.length > 0 ||
    insight.risks.length > 0
  );
}
