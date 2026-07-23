/** Read-only Marketing AI bridge — does not modify Marketing service files. */

import type { SupabaseClient } from "@supabase/supabase-js";

export async function getMarketingLeadBridge(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("marketing_campaigns")
    .select("id, name, status")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(10);
  return { campaigns: data ?? [], campaignCount: data?.length ?? 0 };
}
