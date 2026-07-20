/**
 * Analytics event store — Supabase persistence with in-memory fallback.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildAnalyticsEventFromInput,
  insertAnalyticsEventDb,
  isAnalyticsTableMissing,
  listAnalyticsEventsDb,
} from "@/lib/ai-core/analytics/repository";
import type {
  AnalyticsDeviceType,
  AnalyticsTrafficSource,
  TrackAnalyticsInput,
  WebsiteAnalyticsEvent,
} from "@/lib/ai-core/analytics/types";
import { createAdminClient } from "@/lib/supabase/admin";

type StoreState = {
  events: WebsiteAnalyticsEvent[];
  seededGenerations: Set<string>;
};

const globalStore = globalThis as typeof globalThis & {
  __tbaWebsiteAnalytics?: StoreState;
};

function getState(): StoreState {
  if (!globalStore.__tbaWebsiteAnalytics) {
    globalStore.__tbaWebsiteAnalytics = {
      events: [],
      seededGenerations: new Set(),
    };
  }
  return globalStore.__tbaWebsiteAnalytics;
}

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h + input.charCodeAt(i) * (i + 1)) % 10_007;
  }
  return h;
}

function inferSource(referrer?: string | null): AnalyticsTrafficSource {
  if (!referrer) return "direct";
  const r = referrer.toLowerCase();
  if (r.includes("google") || r.includes("bing") || r.includes("duckduckgo")) {
    return "organic";
  }
  if (
    r.includes("facebook") ||
    r.includes("instagram") ||
    r.includes("twitter") ||
    r.includes("linkedin") ||
    r.includes("tiktok")
  ) {
    return "social";
  }
  if (r.includes("mail") || r.includes("newsletter")) return "email";
  if (r.includes("gclid") || r.includes("ads")) return "paid";
  return "referral";
}

function inferDevice(uaHint?: string | null): AnalyticsDeviceType {
  const ua = (uaHint || "").toLowerCase();
  if (ua.includes("mobile") || ua.includes("iphone") || ua.includes("android")) {
    return "mobile";
  }
  if (ua.includes("ipad") || ua.includes("tablet")) return "tablet";
  return "desktop";
}

function seedMemoryAnalytics(generationId: string): void {
  const state = getState();
  if (state.seededGenerations.has(generationId)) return;
  state.seededGenerations.add(generationId);

  const base = hash(generationId);
  const days = 14;
  const sources: AnalyticsTrafficSource[] = [
    "direct",
    "organic",
    "social",
    "referral",
    "email",
    "paid",
  ];
  const devices: AnalyticsDeviceType[] = ["desktop", "mobile", "tablet"];
  const pages = ["/", "/pricing", "/about", "/contact", "/services"];

  const now = Date.now();
  for (let d = 0; d < days; d += 1) {
    const dayViews = 18 + ((base + d * 17) % 55);
    for (let i = 0; i < dayViews; i += 1) {
      const createdAt = new Date(
        now - d * 86_400_000 - (i % 20) * 3_600_000,
      ).toISOString();
      const visitorId = `v-${generationId.slice(0, 6)}-${(base + d * 3 + i) % 120}`;
      const sessionId = `s-${generationId.slice(0, 6)}-${d}-${Math.floor(i / 3)}`;
      const source = sources[(base + i) % sources.length]!;
      const device = devices[(base + i * 2) % devices.length]!;
      const pagePath = pages[(base + i) % pages.length]!;

      state.events.push({
        id: `evt-${generationId}-${d}-${i}-pv`,
        generationId,
        eventName: "page_view",
        sessionId,
        visitorId,
        pagePath,
        source,
        device,
        createdAt,
      });
    }
  }
}

/** @deprecated Demo seed only when DB unavailable in development */
export function ensureSeededAnalytics(generationId: string): void {
  if (process.env.NODE_ENV === "production") return;
  seedMemoryAnalytics(generationId);
}

export async function trackAnalyticsEvent(
  input: TrackAnalyticsInput,
  client?: SupabaseClient | null,
): Promise<WebsiteAnalyticsEvent> {
  const sessionId =
    input.sessionId?.trim() ||
    `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const visitorId =
    input.visitorId?.trim() ||
    `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const source =
    input.source || inferSource(input.referrer) || "direct";
  const device =
    input.device ||
    inferDevice(
      typeof input.metadata?.userAgent === "string"
        ? input.metadata.userAgent
        : null,
    );

  const event = buildAnalyticsEventFromInput(input, {
    sessionId,
    visitorId,
    source,
    device,
  });

  const dbClient = client ?? createAdminClient();
  if (dbClient) {
    const persisted = await insertAnalyticsEventDb(dbClient, event);
    if (persisted) return persisted;
  }

  const state = getState();
  state.events.push(event);
  if (state.events.length > 50_000) {
    state.events.splice(0, state.events.length - 40_000);
  }
  return event;
}

export async function listAnalyticsEvents(
  generationId: string,
  sinceIso?: string,
  client?: SupabaseClient | null,
): Promise<WebsiteAnalyticsEvent[]> {
  if (client) {
    const rows = await listAnalyticsEventsDb(client, generationId, sinceIso);
    if (rows.length > 0) return rows;
    const { error } = await client
      .from("website_analytics_events")
      .select("id")
      .eq("generation_id", generationId)
      .limit(1);
    if (!isAnalyticsTableMissing(error)) return rows;
  }

  if (process.env.NODE_ENV !== "production") {
    seedMemoryAnalytics(generationId);
  }
  const since = sinceIso ? Date.parse(sinceIso) : 0;
  return getState().events.filter(
    (e) =>
      e.generationId === generationId &&
      (!since || Date.parse(e.createdAt) >= since),
  );
}

export function isAnalyticsSeeded(generationId: string): boolean {
  return getState().seededGenerations.has(generationId);
}
