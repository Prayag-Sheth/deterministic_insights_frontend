import type { InsightStatus, SentimentType } from "./interaction";

/** Mirrors backend InsightResponse (snake_case). */
export interface InsightResponse {
  id: string;
  interaction_id: string;
  summary: string | null;
  sentiment: SentimentType | null;
  action_items: string[];
  risks: string[];
  status: InsightStatus;
  error: string | null;
  created_at: string;
  updated_at: string;
}
