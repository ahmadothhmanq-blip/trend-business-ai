/**
 * Analytics foundation — aggregation and engagement rate.
 */

import type { SocialAnalytics } from "@/types/social-media";
import type { SupabaseClient } from "@supabase/supabase-js";

export function calculateEngagementRate(metrics: {
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
}): number {
  if (metrics.impressions <= 0) return 0;
  const engagements = metrics.likes + metrics.comments + metrics.shares;
  return Math.round((engagements / metrics.impressions) * 10000) / 100;
}

export async function recordAnalytics(
  supabase: SupabaseClient,
  args: {
    userId: string;
    postId?: string | null;
    campaignId?: string | null;
    platform: string;
    impressions?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    clicks?: number;
  },
) {
  const impressions = args.impressions ?? 0;
  const likes = args.likes ?? 0;
  const comments = args.comments ?? 0;
  const shares = args.shares ?? 0;
  const clicks = args.clicks ?? 0;
  const engagement_rate = calculateEngagementRate({ impressions, likes, comments, shares });

  return supabase
    .from("social_analytics")
    .insert({
      user_id: args.userId,
      post_id: args.postId ?? null,
      campaign_id: args.campaignId ?? null,
      platform: args.platform,
      impressions,
      likes,
      comments,
      shares,
      clicks,
      engagement_rate,
    })
    .select("*")
    .single();
}

export type AnalyticsSummary = {
  totalImpressions: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalClicks: number;
  avgEngagementRate: number;
  recordCount: number;
};

export function summarizeAnalytics(rows: SocialAnalytics[]): AnalyticsSummary {
  if (rows.length === 0) {
    return {
      totalImpressions: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalClicks: 0,
      avgEngagementRate: 0,
      recordCount: 0,
    };
  }

  const totalImpressions = rows.reduce((s, r) => s + r.impressions, 0);
  const totalLikes = rows.reduce((s, r) => s + r.likes, 0);
  const totalComments = rows.reduce((s, r) => s + r.comments, 0);
  const totalShares = rows.reduce((s, r) => s + r.shares, 0);
  const totalClicks = rows.reduce((s, r) => s + (r.clicks ?? 0), 0);
  const avgEngagementRate =
    Math.round((rows.reduce((s, r) => s + Number(r.engagement_rate), 0) / rows.length) * 100) / 100;

  return {
    totalImpressions,
    totalLikes,
    totalComments,
    totalShares,
    totalClicks,
    avgEngagementRate,
    recordCount: rows.length,
  };
}

export async function getAnalyticsSummary(
  supabase: SupabaseClient,
  userId: string,
  filters?: { postId?: string; campaignId?: string; platform?: string },
) {
  let query = supabase
    .from("social_analytics")
    .select("*")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: false })
    .limit(500);

  if (filters?.postId) query = query.eq("post_id", filters.postId);
  if (filters?.campaignId) query = query.eq("campaign_id", filters.campaignId);
  if (filters?.platform) query = query.eq("platform", filters.platform);

  const { data, error } = await query;
  return { rows: (data ?? []) as SocialAnalytics[], summary: summarizeAnalytics((data ?? []) as SocialAnalytics[]), error };
}

export type LiveAnalytics = AnalyticsSummary & {
  byPlatform: Record<string, AnalyticsSummary>;
  recent: SocialAnalytics[];
};

export async function getLiveAnalytics(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ live: LiveAnalytics; error: { message: string } | null }> {
  const { rows, summary, error } = await getAnalyticsSummary(supabase, userId);
  if (error) return { live: { ...summary, byPlatform: {}, recent: [] }, error };

  const byPlatform: Record<string, AnalyticsSummary> = {};
  for (const row of rows) {
    const key = row.platform;
    if (!byPlatform[key]) {
      byPlatform[key] = summarizeAnalytics([]);
    }
    const merged = [...rows.filter((r) => r.platform === key)];
    byPlatform[key] = summarizeAnalytics(merged);
  }

  return {
    live: {
      ...summary,
      byPlatform,
      recent: rows.slice(0, 20),
    },
    error: null,
  };
}
