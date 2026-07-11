import type { InsightStatus } from "@/types/interaction";

/** Label for Insight.updated_at based on generation status. */
export function insightUpdatedAtLabel(status: InsightStatus): string {
  switch (status) {
    case "pending":
      return "Generation started";
    case "failed":
      return "Last generation attempt";
    case "completed":
    default:
      return "Last updated";
  }
}
