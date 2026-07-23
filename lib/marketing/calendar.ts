/**
 * Marketing calendar — campaigns, launches, tasks, read-only external events.
 */

import type { MarketingCalendarEvent } from "@/types/marketing";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listCalendarEvents(
  supabase: SupabaseClient,
  userId: string,
  range?: { from: string; to: string },
) {
  let query = supabase
    .from("marketing_calendar_events")
    .select("*")
    .eq("user_id", userId)
    .order("scheduled_at", { ascending: true });

  if (range?.from) query = query.gte("scheduled_at", range.from);
  if (range?.to) query = query.lte("scheduled_at", range.to);

  return query;
}

export async function createCalendarEvent(supabase: SupabaseClient, row: Record<string, unknown>) {
  return supabase.from("marketing_calendar_events").insert(row).select("*").single();
}

/** Read-only: pull Content Studio document due dates into calendar view */
export async function fetchContentStudioEvents(
  supabase: SupabaseClient,
  userId: string,
): Promise<Partial<MarketingCalendarEvent>[]> {
  const { data } = await supabase
    .from("content_documents")
    .select("id, title, updated_at, status")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(20);

  return (data ?? []).map((doc) => ({
    id: `content-${doc.id}`,
    title: doc.title as string,
    event_type: "content" as const,
    scheduled_at: doc.updated_at as string,
    status: doc.status as string,
    source: "content_studio",
    external_ref: doc.id as string,
  }));
}

/** Read-only: pull Social Media scheduled posts into calendar view */
export async function fetchSocialMediaEvents(
  supabase: SupabaseClient,
  userId: string,
): Promise<Partial<MarketingCalendarEvent>[]> {
  const { data: schedules } = await supabase
    .from("social_schedules")
    .select("id, scheduled_at, status, post_id")
    .eq("user_id", userId)
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at")
    .limit(30);

  if (!schedules?.length) return [];

  const postIds = schedules.map((s) => s.post_id);
  const { data: posts } = await supabase
    .from("social_posts")
    .select("id, title")
    .in("id", postIds);

  const titleMap = new Map((posts ?? []).map((p) => [p.id, p.title]));

  return schedules.map((s) => ({
    id: `social-${s.id}`,
    title: String(titleMap.get(s.post_id) ?? "Social post"),
    event_type: "social" as const,
    scheduled_at: s.scheduled_at as string,
    status: s.status as string,
    source: "social_media_manager",
    external_ref: s.post_id as string,
  }));
}

export async function getMergedCalendar(
  supabase: SupabaseClient,
  userId: string,
  range?: { from: string; to: string },
) {
  const [own, content, social] = await Promise.all([
    listCalendarEvents(supabase, userId, range),
    fetchContentStudioEvents(supabase, userId),
    fetchSocialMediaEvents(supabase, userId),
  ]);

  const events = [
    ...((own.data ?? []) as MarketingCalendarEvent[]),
    ...(content as MarketingCalendarEvent[]),
    ...(social as MarketingCalendarEvent[]),
  ].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  return { events, error: own.error };
}
