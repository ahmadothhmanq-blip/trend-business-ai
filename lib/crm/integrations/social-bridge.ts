/** Read-only Social Media bridge — does not modify Social Media service files. */

import type { SupabaseClient } from "@supabase/supabase-js";

export async function getSocialInteractionBridge(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("social_posts")
    .select("id, title, platform, status")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(10);
  return { posts: data ?? [], postCount: data?.length ?? 0 };
}
