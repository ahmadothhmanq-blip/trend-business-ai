/**
 * Read-only Calendar bridge — merges marketing & social schedules without modifying those services.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type CalendarBridgeEvent = {
  id: string;
  title: string;
  date: string;
  source: "marketing" | "social";
  status: string;
};

export async function getCalendarBridgeEvents(
  supabase: SupabaseClient,
  userId: string,
  limit = 20,
): Promise<CalendarBridgeEvent[]> {
  const [marketingRes, socialRes] = await Promise.all([
    supabase
      .from("marketing_calendar_events")
      .select("id, title, event_date, status")
      .eq("user_id", userId)
      .order("event_date", { ascending: true })
      .limit(limit),
    supabase
      .from("social_schedules")
      .select("id, scheduled_at, status, post_id")
      .eq("user_id", userId)
      .order("scheduled_at", { ascending: true })
      .limit(limit),
  ]);

  const events: CalendarBridgeEvent[] = [];

  for (const e of marketingRes.data ?? []) {
    events.push({
      id: e.id,
      title: e.title ?? "Marketing event",
      date: e.event_date ?? new Date().toISOString(),
      source: "marketing",
      status: e.status ?? "planned",
    });
  }

  for (const s of socialRes.data ?? []) {
    events.push({
      id: s.id,
      title: `Social post ${s.post_id?.slice(0, 8) ?? ""}`,
      date: s.scheduled_at ?? new Date().toISOString(),
      source: "social",
      status: s.status ?? "scheduled",
    });
  }

  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, limit);
}
