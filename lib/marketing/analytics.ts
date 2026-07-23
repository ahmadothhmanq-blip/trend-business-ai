/**
 * Marketing analytics aggregation.
 */

import type { MarketingAnalytics } from "@/types/marketing";
import type { SupabaseClient } from "@supabase/supabase-js";

export type MarketingAnalyticsSummary = {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalLeads: number;
  totalRevenue: number;
  totalSpend: number;
  avgRoi: number;
  avgEngagementRate: number;
  recordCount: number;
  byChannel: Record<string, MarketingAnalyticsSummary>;
};

export function summarizeMarketingAnalytics(rows: MarketingAnalytics[]): MarketingAnalyticsSummary {
  if (rows.length === 0) {
    return {
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalLeads: 0,
      totalRevenue: 0,
      totalSpend: 0,
      avgRoi: 0,
      avgEngagementRate: 0,
      recordCount: 0,
      byChannel: {},
    };
  }

  const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0);
  const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);
  const totalConversions = rows.reduce((s, r) => s + r.conversions, 0);
  const totalLeads = rows.reduce((s, r) => s + r.leads, 0);
  const totalRevenue = rows.reduce((s, r) => s + Number(r.revenue), 0);
  const totalSpend = rows.reduce((s, r) => s + Number(r.spend), 0);
  const avgRoi =
    Math.round((rows.reduce((s, r) => s + Number(r.roi), 0) / rows.length) * 100) / 100;
  const avgEngagementRate =
    Math.round((rows.reduce((s, r) => s + Number(r.engagement_rate), 0) / rows.length) * 100) / 100;

  const byChannel: Record<string, MarketingAnalyticsSummary> = {};
  for (const channel of [...new Set(rows.map((r) => r.channel))]) {
    byChannel[channel] = summarizeMarketingAnalytics(rows.filter((r) => r.channel === channel));
  }

  return {
    totalImpressions,
    totalClicks,
    totalConversions,
    totalLeads,
    totalRevenue,
    totalSpend,
    avgRoi,
    avgEngagementRate,
    recordCount: rows.length,
    byChannel,
  };
}

export async function getMarketingAnalytics(
  supabase: SupabaseClient,
  userId: string,
  filters?: { campaignId?: string; channel?: string },
) {
  let query = supabase
    .from("marketing_analytics")
    .select("*")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: false })
    .limit(500);

  if (filters?.campaignId) query = query.eq("campaign_id", filters.campaignId);
  if (filters?.channel) query = query.eq("channel", filters.channel);

  const { data, error } = await query;
  const rows = (data ?? []) as MarketingAnalytics[];
  return { rows, summary: summarizeMarketingAnalytics(rows), error };
}

export async function recordMarketingAnalytics(
  supabase: SupabaseClient,
  args: {
    userId: string;
    campaignId?: string | null;
    channel: string;
    impressions?: number;
    clicks?: number;
    conversions?: number;
    leads?: number;
    revenue?: number;
    spend?: number;
    roi?: number;
    engagementRate?: number;
  },
) {
  const spend = args.spend ?? 0;
  const revenue = args.revenue ?? 0;
  const roi = args.roi ?? (spend > 0 ? Math.round(((revenue - spend) / spend) * 10000) / 100 : 0);

  return supabase
    .from("marketing_analytics")
    .insert({
      user_id: args.userId,
      campaign_id: args.campaignId ?? null,
      channel: args.channel,
      impressions: args.impressions ?? 0,
      clicks: args.clicks ?? 0,
      conversions: args.conversions ?? 0,
      leads: args.leads ?? 0,
      revenue,
      spend,
      roi,
      engagement_rate: args.engagementRate ?? 0,
    })
    .select("*")
    .single();
}
