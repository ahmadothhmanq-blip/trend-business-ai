/**
 * Read-only Marketing connector for BI.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getMarketingBiData(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("marketing_campaigns")
    .select("id, name, status, budget, created_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(50);
  const campaigns = data ?? [];
  const totalBudgetCents = campaigns.reduce((s, c) => s + Math.round(Number(c.budget ?? 0) * 100), 0);
  return { campaigns, campaignCount: campaigns.length, totalBudgetCents, activeCampaigns: campaigns.filter((c) => c.status === "active").length };
}
