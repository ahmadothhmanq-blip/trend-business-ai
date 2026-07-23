import type { BiAlert } from "@/types/bi";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listAlerts(supabase: SupabaseClient, userId: string) {
  return supabase.from("bi_alerts").select("*").eq("user_id", userId).order("created_at", { ascending: false });
}

export async function createAlert(
  supabase: SupabaseClient,
  row: Partial<BiAlert> & { user_id: string; name: string; metric_key: string; threshold: number },
) {
  return supabase
    .from("bi_alerts")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      metric_key: row.metric_key,
      name: row.name,
      condition: row.condition ?? "gt",
      threshold: row.threshold,
      status: row.status ?? "active",
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export function evaluateAlert(metricValue: number, condition: string, threshold: number): boolean {
  if (condition === "lt") return metricValue < threshold;
  if (condition === "eq") return metricValue === threshold;
  return metricValue > threshold;
}
