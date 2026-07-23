import type { SupabaseClient } from "@supabase/supabase-js";
import { collectIntegratedMetrics } from "./integrations";
import { computeMetricsFromIntegrations } from "./metrics";

export type BiAnalyticsSummary = {
  metrics: ReturnType<typeof computeMetricsFromIntegrations>;
  integrations: Awaited<ReturnType<typeof collectIntegratedMetrics>>;
  kpiCount: number;
  dashboardCount: number;
  reportCount: number;
};

export async function getBiAnalytics(supabase: SupabaseClient, userId: string): Promise<{ summary: BiAnalyticsSummary; error: Error | null }> {
  const integrations = await collectIntegratedMetrics(supabase, userId);
  const metrics = computeMetricsFromIntegrations(integrations);

  const [kpis, dashboards, reports] = await Promise.all([
    supabase.from("bi_kpis").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("bi_dashboards").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("bi_reports").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ]);

  return {
    summary: {
      metrics,
      integrations,
      kpiCount: kpis.count ?? 0,
      dashboardCount: dashboards.count ?? 0,
      reportCount: reports.count ?? 0,
    },
    error: kpis.error ?? dashboards.error ?? reports.error,
  };
}
