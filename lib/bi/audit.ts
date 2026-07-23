import type { SupabaseClient } from "@supabase/supabase-js";

export async function logBiAudit(
  supabase: SupabaseClient,
  row: { user_id: string; action: string; entity_type: string; entity_id?: string | null; details?: Record<string, unknown> },
) {
  return supabase.from("bi_audit_log").insert({
    user_id: row.user_id,
    action: row.action,
    entity_type: row.entity_type,
    entity_id: row.entity_id ?? null,
    details: row.details ?? {},
  });
}
