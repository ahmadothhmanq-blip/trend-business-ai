import type { SupabaseClient } from "@supabase/supabase-js";

export async function logErpAudit(
  supabase: SupabaseClient,
  row: {
    user_id: string;
    company_id?: string | null;
    action: string;
    entity_type: string;
    entity_id?: string | null;
    details?: Record<string, unknown>;
  },
) {
  return supabase.from("erp_audit_log").insert({
    user_id: row.user_id,
    company_id: row.company_id ?? null,
    action: row.action,
    entity_type: row.entity_type,
    entity_id: row.entity_id ?? null,
    details: row.details ?? {},
  });
}
