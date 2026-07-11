"use client";

import { format } from "date-fns";

import { CardSkeleton } from "@/components/shared/card-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { ActivityCard } from "@/features/dashboard/components/activity-card";
import { KpiCard } from "@/features/dashboard/components/kpi-card";
import { RecentInsights } from "@/features/dashboard/components/recent-insights";
import { RecentInteractions } from "@/features/dashboard/components/recent-interactions";
import { SentimentBreakdown } from "@/features/dashboard/components/sentiment-breakdown";
import { useDashboardOverview } from "@/features/dashboard/hooks/use-dashboard-overview";
import { isApiError } from "@/lib/axios";

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton
            key={`kpi-skel-${index}`}
            className="min-h-[6.5rem] p-4"
          />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <CardSkeleton
            key={`activity-skel-${index}`}
            className="min-h-[6.5rem] p-4"
          />
        ))}
      </div>
      <CardSkeleton className="min-h-[12rem]" />
      <div className="grid gap-4 lg:grid-cols-2">
        <TableSkeleton columns={3} rows={5} />
        <TableSkeleton columns={5} rows={5} />
      </div>
    </div>
  );
}

export function DashboardOverview() {
  const { data, isLoading, isPending, error, refetch } = useDashboardOverview();

  if ((isLoading || isPending) && !data) {
    return <DashboardLoadingSkeleton />;
  }

  if (!data) {
    const message = isApiError(error)
      ? error.message
      : "Failed to load dashboard overview.";
    return (
      <ErrorState
        title="Unable to load dashboard"
        message={message}
        onRetry={() => void refetch()}
      />
    );
  }

  const {
    customers,
    interactions,
    insights,
    recent_interactions,
    recent_insights,
  } = data;

  return (
    <div className="flex h-full min-h-full flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <KpiCard label="Total Customers" value={customers.total} />
        <KpiCard label="Active Customers" value={customers.active} />
        <KpiCard label="Inactive Customers" value={customers.inactive} />
        <KpiCard label="Total Interactions" value={interactions.total} />
        <KpiCard label="Total Insights" value={insights.total} />
        <KpiCard label="Failed Insights" value={insights.failed} tone="warning" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ActivityCard label="Today" value={interactions.today} />
        <ActivityCard label="This Week" value={interactions.week} />
        <ActivityCard label="This Month" value={interactions.month} />
      </div>

      <SentimentBreakdown sentiment={insights.sentiment} />

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        <RecentInteractions items={recent_interactions} className="h-full" />
        <RecentInsights items={recent_insights} className="h-full" />
      </div>

      <p className="shrink-0 pt-1 text-xs text-muted-foreground">
        Last updated{" "}
        <time dateTime={data.generated_at}>
          {format(new Date(data.generated_at), "PPp")}
        </time>
      </p>
    </div>
  );
}
