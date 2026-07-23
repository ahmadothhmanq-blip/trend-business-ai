import type { SupabaseClient } from "@supabase/supabase-js";
import type { CyberEvent, CyberAlert, CyberDetectionRule } from "@/types/cyber";

export async function ingestEvent(supabase: SupabaseClient, row: Partial<CyberEvent> & { user_id: string; message: string }) {
  return supabase.from("cyber_events").insert({
    user_id: row.user_id,
    organization_id: row.organization_id ?? null,
    asset_id: row.asset_id ?? null,
    event_type: row.event_type ?? "generic",
    source: row.source ?? "system",
    severity: row.severity ?? "info",
    message: row.message,
    payload: row.payload ?? {},
    recorded_at: row.recorded_at ?? new Date().toISOString(),
  }).select("*").single();
}

export async function listEvents(supabase: SupabaseClient, userId: string) {
  return supabase.from("cyber_events").select("*").eq("user_id", userId).order("recorded_at", { ascending: false }).limit(100);
}

export async function listAlerts(supabase: SupabaseClient, userId: string) {
  return supabase.from("cyber_alerts").select("*").eq("user_id", userId).order("created_at", { ascending: false });
}

export async function createAlert(supabase: SupabaseClient, row: Partial<CyberAlert> & { user_id: string; title: string }) {
  return supabase.from("cyber_alerts").insert({
    user_id: row.user_id,
    organization_id: row.organization_id ?? null,
    event_id: row.event_id ?? null,
    title: row.title,
    severity: row.severity ?? "medium",
    status: row.status ?? "open",
    assigned_to: row.assigned_to ?? null,
    metadata: row.metadata ?? {},
  }).select("*").single();
}

export async function updateAlertStatus(supabase: SupabaseClient, userId: string, alertId: string, status: CyberAlert["status"]) {
  return supabase.from("cyber_alerts").update({ status, updated_at: new Date().toISOString() }).eq("id", alertId).eq("user_id", userId).select("*").single();
}

export async function listDetectionRules(supabase: SupabaseClient, userId: string) {
  return supabase.from("cyber_detection_rules").select("*").eq("user_id", userId);
}

export async function createDetectionRule(supabase: SupabaseClient, row: Partial<CyberDetectionRule> & { user_id: string; name: string }) {
  return supabase.from("cyber_detection_rules").insert({
    user_id: row.user_id,
    organization_id: row.organization_id ?? null,
    name: row.name,
    description: row.description ?? "",
    conditions: row.conditions ?? {},
    actions: row.actions ?? {},
    is_active: row.is_active ?? true,
  }).select("*").single();
}

export async function evaluateRules(supabase: SupabaseClient, userId: string, event: CyberEvent) {
  const { data: rules } = await listDetectionRules(supabase, userId);
  const triggered = (rules ?? []).filter((r) => r.is_active && (r.conditions as { severity?: string }).severity === event.severity);
  for (const rule of triggered) {
    await createAlert(supabase, {
      user_id: userId,
      title: `Rule: ${rule.name}`,
      severity: event.severity,
      event_id: event.id,
      metadata: { ruleId: rule.id },
    });
  }
  return triggered.length;
}
