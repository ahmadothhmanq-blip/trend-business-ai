import type { SupabaseClient } from "@supabase/supabase-js";

export async function getMarketingCampaigns(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("marketing_campaigns").select("id, name, status, budget, start_date, end_date").eq("user_id", userId).limit(30);
  return { campaigns: data ?? [], active: (data ?? []).filter((c) => c.status === "active").length };
}

export async function getMarketingAnalytics(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("marketing_analytics").select("id, channel, impressions, clicks, conversions, revenue, roi, recorded_at").eq("user_id", userId).limit(50);
  return { analytics: data ?? [] };
}
