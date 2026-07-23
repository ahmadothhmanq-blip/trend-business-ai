/**
 * Read-only CRM connector for BI.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCrmBiData(supabase: SupabaseClient, userId: string) {
  const [contacts, deals, leads] = await Promise.all([
    supabase.from("crm_contacts").select("id, lifecycle_stage, created_at").eq("user_id", userId),
    supabase.from("crm_deals").select("id, stage, value_cents, created_at").eq("user_id", userId),
    supabase.from("crm_leads").select("id, status").eq("user_id", userId),
  ]);

  const dealRows = deals.data ?? [];
  const leadRows = leads.data ?? [];
  const openDeals = dealRows.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const pipelineValueCents = openDeals.reduce((s, d) => s + Number(d.value_cents ?? 0), 0);
  const converted = leadRows.filter((l) => l.status === "converted").length;
  const conversionRate = leadRows.length > 0 ? Math.round((converted / leadRows.length) * 100) : 0;

  return {
    contacts: contacts.data ?? [],
    deals: dealRows,
    leads: leadRows,
    contactCount: contacts.data?.length ?? 0,
    dealCount: dealRows.length,
    pipelineValueCents,
    conversionRate,
  };
}
