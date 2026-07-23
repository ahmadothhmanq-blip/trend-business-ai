import type { SupabaseClient } from "@supabase/supabase-js";
import { computeMetricsFromIntegrations } from "@/lib/bi/metrics";
import { collectIntegratedMetrics } from "@/lib/bi/integrations";

export async function getBiMetrics(supabase: SupabaseClient, userId: string) {
  const integrations = await collectIntegratedMetrics(supabase, userId);
  return { metrics: computeMetricsFromIntegrations(integrations) };
}

export async function getBiDashboards(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("bi_dashboards").select("id, name, is_default, updated_at").eq("user_id", userId).limit(20);
  return { dashboards: data ?? [] };
}
