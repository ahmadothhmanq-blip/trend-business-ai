/**
 * Ads marketing foundation — draft campaigns for Google & Meta.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export async function listAdsDrafts(
  supabase: SupabaseClient,
  userId: string,
  platform?: "google_ads" | "meta_ads",
) {
  let query = supabase
    .from("marketing_ads_drafts")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (platform) query = query.eq("platform", platform);
  return query;
}

export async function createAdsDraft(supabase: SupabaseClient, row: Record<string, unknown>) {
  return supabase.from("marketing_ads_drafts").insert(row).select("*").single();
}

export function draftFromCampaign(
  campaign: Record<string, unknown>,
  userId: string,
  platform: "google_ads" | "meta_ads",
) {
  const strategy = (campaign.strategy as Record<string, unknown>) ?? {};
  return {
    user_id: userId,
    campaign_id: campaign.id,
    platform,
    name: `${campaign.name} — ${platform === "google_ads" ? "Google" : "Meta"}`,
    objective: String(campaign.objective ?? "conversions"),
    status: "draft",
    budget: campaign.budget ?? null,
    audience: { target: strategy.audience ?? "", segments: [] },
    creative: {
      headline: String(strategy.messaging ?? campaign.name),
      body: String(strategy.offer ?? ""),
      cta: "Learn more",
    },
  };
}
