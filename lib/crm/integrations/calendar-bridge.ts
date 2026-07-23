/** Calendar meetings foundation — read-only from marketing/social schedules. */

import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCalendarMeetingsBridge(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("marketing_calendar_events")
    .select("id, title, event_date, status")
    .eq("user_id", userId)
    .order("event_date", { ascending: true })
    .limit(15);
  return { events: data ?? [] };
}
