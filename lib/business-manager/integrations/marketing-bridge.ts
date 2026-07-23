/**
 * Read-only Marketing bridge — does not modify Marketing service files.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type MarketingBridgeSummary = {
  campaigns: number;
  activeCampaigns: number;
  recentCampaigns: Array<{ id: string; name: string; status: string }>;
};

export async function getMarketingBridgeSummary(
  supabase: SupabaseClient,
  userId: string,
): Promise<MarketingBridgeSummary> {
  const { data } = await supabase
    .from("marketing_campaigns")
    .select("id, name, status")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(10);

  const rows = data ?? [];
  return {
    campaigns: rows.length,
    activeCampaigns: rows.filter((c) => c.status === "active").length,
    recentCampaigns: rows.map((c) => ({
      id: c.id,
      name: c.name ?? "",
      status: c.status ?? "draft",
    })),
  };
}
