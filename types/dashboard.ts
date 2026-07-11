import type {
  InsightStatus,
  InteractionType,
  SentimentType,
} from "./interaction";

/** Mirrors backend CustomerMetrics. */
export interface CustomerMetrics {
  total: number;
  active: number;
  inactive: number;
}

/** Mirrors backend InteractionMetrics. */
export interface InteractionMetrics {
  total: number;
  today: number;
  week: number;
  month: number;
}

/** Mirrors backend SentimentBreakdown. */
export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

/** Mirrors backend InsightMetrics. */
export interface InsightMetrics {
  total: number;
  failed: number;
  sentiment: SentimentBreakdown;
}

/** Mirrors backend DashboardRecentInteraction (no raw_notes / sentiment). */
export interface DashboardRecentInteraction {
  id: string;
  customer_id: string;
  customer_name: string;
  created_by: string;
  type: InteractionType;
  interaction_at: string;
  created_at: string;
  updated_at: string;
}

/** Mirrors backend DashboardRecentInsight (no action_items / risks). */
export interface DashboardRecentInsight {
  id: string;
  interaction_id: string;
  interaction_type: InteractionType;
  customer_name: string;
  summary: string | null;
  sentiment: SentimentType | null;
  status: InsightStatus;
  created_at: string;
  updated_at: string;
}

/** Mirrors backend DashboardOverviewResponse. */
export interface DashboardOverviewResponse {
  customers: CustomerMetrics;
  interactions: InteractionMetrics;
  insights: InsightMetrics;
  recent_interactions: DashboardRecentInteraction[];
  recent_insights: DashboardRecentInsight[];
  generated_at: string;
}
