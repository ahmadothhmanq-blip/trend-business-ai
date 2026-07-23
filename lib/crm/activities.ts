import type { CRMActivity } from "@/types/crm";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listActivities(
  supabase: SupabaseClient,
  userId: string,
  filters?: { contactId?: string; dealId?: string; leadId?: string },
) {
  let q = supabase
    .from("crm_activities")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_at", { ascending: false })
    .limit(100);
  if (filters?.contactId) q = q.eq("contact_id", filters.contactId);
  if (filters?.dealId) q = q.eq("deal_id", filters.dealId);
  if (filters?.leadId) q = q.eq("lead_id", filters.leadId);
  return q;
}

export async function recordActivity(
  supabase: SupabaseClient,
  row: Partial<CRMActivity> & { user_id: string; activity_type: CRMActivity["activity_type"] },
) {
  return supabase
    .from("crm_activities")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      contact_id: row.contact_id ?? null,
      deal_id: row.deal_id ?? null,
      account_id: row.account_id ?? null,
      lead_id: row.lead_id ?? null,
      activity_type: row.activity_type,
      subject: row.subject ?? "",
      body: row.body ?? "",
      occurred_at: row.occurred_at ?? new Date().toISOString(),
      duration_minutes: row.duration_minutes ?? null,
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}
