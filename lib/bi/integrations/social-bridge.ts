/**
 * Read-only Social Media connector for BI.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getSocialBiData(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("social_analytics")
    .select("id, platform, impressions, likes, comments, shares, recorded_at")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: false })
    .limit(50);
  const rows = data ?? [];
  const totalImpressions = rows.reduce((s, r) => s + Number(r.impressions ?? 0), 0);
  const totalEngagements = rows.reduce((s, r) => s + Number(r.likes ?? 0) + Number(r.comments ?? 0) + Number(r.shares ?? 0), 0);
  return { analytics: rows, totalImpressions, totalEngagements };
}
