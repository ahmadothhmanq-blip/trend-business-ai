/**
 * Calendar bridge — meetings/events foundation.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCalendarBridge(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("marketing_calendar_events")
    .select("id, title, scheduled_at, event_type")
    .eq("user_id", userId)
    .order("scheduled_at", { ascending: true })
    .limit(10);
  return { events: data ?? [] };
}
