/** Read-only Business Manager bridge — does not modify Business Manager service files. */

import type { SupabaseClient } from "@supabase/supabase-js";

export async function getBusinessManagerTaskBridge(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("business_tasks")
    .select("id, title, status, due_date")
    .eq("user_id", userId)
    .order("due_date", { ascending: true })
    .limit(10);
  return { tasks: data ?? [], taskCount: data?.length ?? 0 };
}
