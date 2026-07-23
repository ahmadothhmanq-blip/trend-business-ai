/** Email communication foundation — growth email campaigns read-only. */

import type { SupabaseClient } from "@supabase/supabase-js";

export async function getEmailCommunicationBridge(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("growth_email_campaigns")
    .select("id, name, subject, status, stats")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  return { campaigns: data ?? [] };
}
