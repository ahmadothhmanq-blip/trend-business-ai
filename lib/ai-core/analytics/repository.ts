/**
 * Supabase persistence for website analytics events (migration 041).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  TrackAnalyticsInput,
  WebsiteAnalyticsEvent,
} from "@/lib/ai-core/analytics/types";

type AnalyticsRow = {
  id: string;
  generation_id: string;
  event_name: string;
  session_id: string;
  visitor_id: string;
  page_path: string;
  referrer: string | null;
  source: string;
  device: string;
  experiment_id: string | null;
  variant_id: string | null;
  target: string | null;
  value_cents: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

function rowToEvent(row: AnalyticsRow): WebsiteAnalyticsEvent {
  return {
    id: row.id,
    generationId: row.generation_id,
    eventName: row.event_name as WebsiteAnalyticsEvent["eventName"],
    sessionId: row.session_id,
    visitorId: row.visitor_id,
    pagePath: row.page_path,
    referrer: row.referrer,
    source: row.source as WebsiteAnalyticsEvent["source"],
    device: row.device as WebsiteAnalyticsEvent["device"],
    experimentId: row.experiment_id,
    variantId: row.variant_id,
    target: row.target,
    valueCents: row.value_cents,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

export function isAnalyticsTableMissing(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const msg = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42P01" ||
    msg.includes("website_analytics_events") ||
    (msg.includes("relation") && msg.includes("does not exist"))
  );
}

export async function insertAnalyticsEventDb(
  client: SupabaseClient,
  event: WebsiteAnalyticsEvent,
): Promise<WebsiteAnalyticsEvent | null> {
  const { data, error } = await client
    .from("website_analytics_events")
    .insert({
      generation_id: event.generationId,
      event_name: event.eventName,
      session_id: event.sessionId,
      visitor_id: event.visitorId,
      page_path: event.pagePath,
      referrer: event.referrer,
      source: event.source,
      device: event.device,
      experiment_id: event.experimentId,
      variant_id: event.variantId,
      target: event.target,
      value_cents: event.valueCents,
      metadata: event.metadata ?? {},
    })
    .select("*")
    .single();

  if (error || !data) return null;
  return rowToEvent(data as AnalyticsRow);
}

export async function listAnalyticsEventsDb(
  client: SupabaseClient,
  generationId: string,
  sinceIso?: string,
  limit = 20_000,
): Promise<WebsiteAnalyticsEvent[]> {
  let query = client
    .from("website_analytics_events")
    .select("*")
    .eq("generation_id", generationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (sinceIso) {
    query = query.gte("created_at", sinceIso);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return (data as AnalyticsRow[]).map(rowToEvent).reverse();
}

export function buildAnalyticsEventFromInput(
  input: TrackAnalyticsInput,
  ids: { sessionId: string; visitorId: string; source: WebsiteAnalyticsEvent["source"]; device: WebsiteAnalyticsEvent["device"] },
): WebsiteAnalyticsEvent {
  return {
    id: `evt-live-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    generationId: input.generationId,
    eventName: input.eventName,
    sessionId: ids.sessionId,
    visitorId: ids.visitorId,
    pagePath: input.pagePath || "/",
    referrer: input.referrer ?? null,
    source: ids.source,
    device: ids.device,
    experimentId: input.experimentId ?? null,
    variantId: input.variantId ?? null,
    target: input.target ?? null,
    valueCents: input.valueCents ?? null,
    metadata: input.metadata,
    createdAt: new Date().toISOString(),
  };
}
