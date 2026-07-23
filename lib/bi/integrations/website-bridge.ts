/**
 * Read-only Website Builder analytics connector for BI.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getWebsiteBiData(supabase: SupabaseClient, userId: string) {
  const { data: generations } = await supabase
    .from("website_generations")
    .select("id")
    .eq("user_id", userId)
    .limit(20);
  const ids = (generations ?? []).map((g) => g.id);
  if (!ids.length) return { events: [], pageViews: 0, eventCount: 0 };

  const { data: events } = await supabase
    .from("website_analytics_events")
    .select("event_name, created_at")
    .in("generation_id", ids)
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = events ?? [];
  const pageViews = rows.filter((e) => e.event_name === "page_view").length;
  return { events: rows, pageViews, eventCount: rows.length };
}
