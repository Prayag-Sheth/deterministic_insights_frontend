export type InteractionType =
  "meeting" | "call" | "email" | "demo" | "follow_up";

export type SentimentType = "positive" | "neutral" | "negative";

export type InsightStatus = "pending" | "completed" | "failed";

export interface InteractionListItem {
  id: string;
  customer_id: string;
  created_by: string;
  type: InteractionType;
  interaction_at: string;
  created_at: string;
  updated_at: string;
  sentiment: SentimentType | null;
  insight_status: InsightStatus | null;
}

export interface InteractionDetail extends InteractionListItem {
  raw_notes: string;
}

export interface InteractionCreateBody {
  customer_id: string;
  type: InteractionType;
  interaction_at: string;
  raw_notes: string;
}

export interface InteractionUpdateBody {
  type?: InteractionType;
  interaction_at?: string;
  raw_notes?: string;
}

export interface InteractionListParams {
  page?: number;
  page_size?: number;
  customer_id?: string;
  type?: InteractionType;
  interaction_at_from?: string;
  interaction_at_to?: string;
  sentiment?: SentimentType;
}
