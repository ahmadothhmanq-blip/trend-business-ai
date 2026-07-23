/**
 * Marketing plan helpers.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export async function listPlans(supabase: SupabaseClient, userId: string, campaignId?: string) {
  let query = supabase
    .from("marketing_plans")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (campaignId) query = query.eq("campaign_id", campaignId);
  return query;
}

export async function createPlan(supabase: SupabaseClient, row: Record<string, unknown>) {
  return supabase.from("marketing_plans").insert(row).select("*").single();
}

export async function planFromCampaign(campaign: Record<string, unknown>, userId: string) {
  const strategy = (campaign.strategy as Record<string, unknown>) ?? {};
  return {
    user_id: userId,
    campaign_id: campaign.id,
    name: `${campaign.name} Plan`,
    status: "draft",
    summary: String(strategy.messaging ?? campaign.objective ?? ""),
    goals: Array.isArray((campaign.metadata as Record<string, unknown>)?.goals)
      ? (campaign.metadata as Record<string, unknown>).goals
      : [],
    audience: String(strategy.audience ?? ""),
    offer: String(strategy.offer ?? ""),
    messaging: String(strategy.messaging ?? ""),
    channels: campaign.channels ?? [],
    timeline: campaign.timeline ?? [],
    kpis: campaign.kpis ?? [],
  };
}
