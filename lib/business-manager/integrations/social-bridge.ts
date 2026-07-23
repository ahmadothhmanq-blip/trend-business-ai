/**
 * Read-only Social Media bridge — does not modify Social Media service files.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type SocialBridgeSummary = {
  posts: number;
  scheduled: number;
  recentPosts: Array<{ id: string; title: string; status: string; platform: string }>;
};

export async function getSocialBridgeSummary(
  supabase: SupabaseClient,
  userId: string,
): Promise<SocialBridgeSummary> {
  const [postsRes, schedulesRes] = await Promise.all([
    supabase
      .from("social_posts")
      .select("id, title, status, platform")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("social_schedules")
      .select("id, status")
      .eq("user_id", userId)
      .eq("status", "scheduled"),
  ]);

  const posts = postsRes.data ?? [];
  return {
    posts: posts.length,
    scheduled: schedulesRes.data?.length ?? 0,
    recentPosts: posts.map((p) => ({
      id: p.id,
      title: p.title ?? "",
      status: p.status ?? "draft",
      platform: p.platform ?? "",
    })),
  };
}
