import type { CRMAutomationRule } from "@/types/crm";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listAutomationRules(supabase: SupabaseClient, userId: string) {
  return supabase
    .from("crm_automation_rules")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function createAutomationRule(
  supabase: SupabaseClient,
  row: Partial<CRMAutomationRule> & { user_id: string; name: string; trigger_event: string },
) {
  return supabase
    .from("crm_automation_rules")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      name: row.name,
      trigger_event: row.trigger_event,
      status: row.status ?? "active",
      conditions: row.conditions ?? {},
      actions: row.actions ?? [],
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}
