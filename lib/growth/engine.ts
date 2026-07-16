import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  GrowthAffiliate,
  GrowthAffiliateCommission,
  GrowthAffiliatePayout,
  GrowthAnalyticsSummary,
  GrowthAutomation,
  GrowthContact,
  GrowthDashboardPayload,
  GrowthDeal,
  GrowthEmailCampaign,
  GrowthExperiment,
  GrowthLead,
  GrowthReferralCode,
  GrowthReferralInvite,
  GrowthSegment,
  GrowthSubscriber,
} from "@/types/growth";
import { makeAffiliateCode, makeReferralCode } from "@/lib/growth/codes";

function isMissingTable(error: { code?: string } | null) {
  return error?.code === "42P01";
}

export async function ensureAffiliateProfile(
  supabase: SupabaseClient,
  userId: string,
  email?: string | null,
): Promise<GrowthAffiliate | null> {
  const existing = await supabase
    .from("growth_affiliates")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing.data) return existing.data as GrowthAffiliate;
  if (isMissingTable(existing.error)) return null;

  const inserted = await supabase
    .from("growth_affiliates")
    .insert({
      user_id: userId,
      code: makeAffiliateCode(userId, email),
      status: "pending",
      payout_email: email ?? null,
    })
    .select("*")
    .single();

  if (inserted.error) return null;
  return inserted.data as GrowthAffiliate;
}

export async function ensureReferralProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<GrowthReferralCode | null> {
  const existing = await supabase
    .from("growth_referral_codes")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing.data) return existing.data as GrowthReferralCode;
  if (isMissingTable(existing.error)) return null;

  const inserted = await supabase
    .from("growth_referral_codes")
    .insert({
      user_id: userId,
      code: makeReferralCode(userId),
    })
    .select("*")
    .single();

  if (inserted.error) return null;
  return inserted.data as GrowthReferralCode;
}

export async function buildGrowthAnalytics(
  supabase: SupabaseClient,
  userId: string,
): Promise<GrowthAnalyticsSummary> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [eventsRes, leadsRes, subsRes, experimentsRes, campaignsRes, affiliateRes] =
    await Promise.all([
      supabase
        .from("growth_events")
        .select("event_name, event_category")
        .eq("user_id", userId)
        .gte("created_at", since),
      supabase
        .from("growth_leads")
        .select("id", { count: "exact", head: true })
        .eq("owner_user_id", userId)
        .gte("created_at", since),
      supabase
        .from("growth_subscribers")
        .select("id", { count: "exact", head: true })
        .eq("owner_user_id", userId),
      supabase
        .from("growth_experiments")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "running"),
      supabase
        .from("growth_email_campaigns")
        .select("id, name, stats")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("growth_affiliates")
        .select("total_clicks")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

  const events = (eventsRes.data ?? []) as Array<{ event_name: string; event_category: string }>;
  const pageviews = events.filter((e) => e.event_category === "pageview").length;
  const conversions = events.filter((e) => e.event_category === "conversion").length;

  const funnelSteps = ["pageview", "cta_click", "lead_submit", "signup"] as const;
  const funnel = funnelSteps.map((step) => ({
    step,
    count: events.filter((e) => e.event_name === step).length,
  }));

  const campaigns = ((campaignsRes.data ?? []) as Array<{
    id: string;
    name: string;
    stats: { sent?: number; opened?: number; clicked?: number };
  }>).map((c) => ({
    id: c.id,
    name: c.name,
    sent: c.stats?.sent ?? 0,
    opened: c.stats?.opened ?? 0,
    clicked: c.stats?.clicked ?? 0,
  }));

  return {
    pageviews,
    conversions,
    leads: leadsRes.count ?? 0,
    subscribers: subsRes.count ?? 0,
    affiliateClicks: (affiliateRes.data as { total_clicks?: number } | null)?.total_clicks ?? 0,
    experimentsRunning: experimentsRes.count ?? 0,
    funnel,
    campaigns,
  };
}

export async function loadGrowthDashboard(
  supabase: SupabaseClient,
  userId: string,
  email?: string | null,
): Promise<GrowthDashboardPayload | null> {
  const affiliate = await ensureAffiliateProfile(supabase, userId, email);
  const referral = await ensureReferralProfile(supabase, userId);
  if (affiliate === null && referral === null) {
    // Tables missing
    const probe = await supabase.from("growth_leads").select("id").limit(1);
    if (isMissingTable(probe.error)) return null;
  }

  const [
    commissions,
    payouts,
    invites,
    leads,
    contacts,
    deals,
    subscribers,
    campaigns,
    automations,
    experiments,
    segments,
    analytics,
  ] = await Promise.all([
    supabase
      .from("growth_affiliate_commissions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("growth_affiliate_payouts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("growth_referral_invites")
      .select("*")
      .eq("referrer_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("growth_leads")
      .select("*")
      .eq("owner_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("growth_contacts")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(100),
    supabase
      .from("growth_deals")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(100),
    supabase
      .from("growth_subscribers")
      .select("*")
      .eq("owner_user_id", userId)
      .order("subscribed_at", { ascending: false })
      .limit(100),
    supabase
      .from("growth_email_campaigns")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("growth_automations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("growth_experiments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("growth_segments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    buildGrowthAnalytics(supabase, userId),
  ]);

  return {
    affiliate,
    commissions: (commissions.data ?? []) as GrowthAffiliateCommission[],
    payouts: (payouts.data ?? []) as GrowthAffiliatePayout[],
    referral,
    invites: (invites.data ?? []) as GrowthReferralInvite[],
    leads: (leads.data ?? []) as GrowthLead[],
    contacts: (contacts.data ?? []) as GrowthContact[],
    deals: (deals.data ?? []) as GrowthDeal[],
    subscribers: (subscribers.data ?? []) as GrowthSubscriber[],
    campaigns: (campaigns.data ?? []) as GrowthEmailCampaign[],
    automations: (automations.data ?? []) as GrowthAutomation[],
    experiments: (experiments.data ?? []) as GrowthExperiment[],
    segments: (segments.data ?? []) as GrowthSegment[],
    analytics,
  };
}

export const GrowthEngine = {
  ensureAffiliateProfile,
  ensureReferralProfile,
  loadGrowthDashboard,
  buildGrowthAnalytics,
} as const;
