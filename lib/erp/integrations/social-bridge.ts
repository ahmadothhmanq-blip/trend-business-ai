/**
 * Read-only Social Media bridge — sales attribution foundation.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export async function getSocialBridge(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("social_posts")
    .select("id, platform, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  return { posts: data ?? [], postCount: data?.length ?? 0 };
}
