/**
 * Read-only CRM bridge for ERP sales integration.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCrmDealsForErp(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("crm_deals")
    .select("id, title, stage, value_cents, contact_id, created_at")
    .eq("user_id", userId)
    .neq("stage", "lost")
    .order("updated_at", { ascending: false })
    .limit(20);
  return { deals: data ?? [], dealCount: data?.length ?? 0 };
}

export async function getCrmContactsForErp(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("crm_contacts")
    .select("id, email, first_name, last_name, lifecycle_stage")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(20);
  return { contacts: data ?? [], contactCount: data?.length ?? 0 };
}
