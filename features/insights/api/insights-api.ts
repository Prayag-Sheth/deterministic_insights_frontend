import { apiClient } from "@/lib/axios";
import type { InsightResponse } from "@/types/insight";

/**
 * Default generate timeout (ms). Longer than the global Axios timeout (30s)
 * so LLM generation can complete. Override via
 * NEXT_PUBLIC_INSIGHT_GENERATE_TIMEOUT_MS.
 */
export const DEFAULT_INSIGHT_GENERATE_TIMEOUT_MS = 120_000;

export function resolveInsightGenerateTimeoutMs(): number {
  const raw = process.env.NEXT_PUBLIC_INSIGHT_GENERATE_TIMEOUT_MS;
  if (raw === undefined || raw === "") {
    return DEFAULT_INSIGHT_GENERATE_TIMEOUT_MS;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_INSIGHT_GENERATE_TIMEOUT_MS;
  }
  return parsed;
}

export async function getInsight(
  interactionId: string,
): Promise<InsightResponse> {
  const { data } = await apiClient.get<InsightResponse>(
    `/insights/${interactionId}`,
  );
  return data;
}

export async function generateInsight(
  interactionId: string,
): Promise<InsightResponse> {
  const { data } = await apiClient.post<InsightResponse>(
    `/interactions/${interactionId}/generate-insight`,
    undefined,
    { timeout: resolveInsightGenerateTimeoutMs() },
  );
  return data;
}
