"use client";

import { useQuery } from "@tanstack/react-query";

import { getDashboardOverview } from "@/features/dashboard/api/dashboard-api";
import { dashboardKeys } from "@/features/dashboard/api/dashboard-keys";

export function useDashboardOverview() {
  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: getDashboardOverview,
    placeholderData: (previousData) => previousData,
  });
}
