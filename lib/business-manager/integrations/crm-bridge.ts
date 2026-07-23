/**
 * Read-only CRM bridge — does not modify CRM service files.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type CrmBridgeSummary = {
  contacts: number;
  deals: number;
  openDeals: number;
  recentContacts: Array<{ id: string; name: string; email: string; company: string }>;
};

export async function getCrmBridgeSummary(
  supabase: SupabaseClient,
  userId: string,
): Promise<CrmBridgeSummary> {
  const [contactsRes, dealsRes] = await Promise.all([
    supabase
      .from("growth_contacts")
      .select("id, name, email, company")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase.from("growth_deals").select("id, stage").eq("user_id", userId),
  ]);

  const deals = dealsRes.data ?? [];
  const openDeals = deals.filter((d) => d.stage !== "won" && d.stage !== "lost").length;

  return {
    contacts: contactsRes.data?.length ?? 0,
    deals: deals.length,
    openDeals,
    recentContacts: (contactsRes.data ?? []).map((c) => ({
      id: c.id,
      name: c.name ?? "",
      email: c.email ?? "",
      company: c.company ?? "",
    })),
  };
}
