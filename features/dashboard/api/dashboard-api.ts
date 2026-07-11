import { apiClient } from "@/lib/axios";
import type { DashboardOverviewResponse } from "@/types/dashboard";

export async function getDashboardOverview(): Promise<DashboardOverviewResponse> {
  const { data } = await apiClient.get<DashboardOverviewResponse>(
    "/dashboard/overview",
  );
  return data;
}
