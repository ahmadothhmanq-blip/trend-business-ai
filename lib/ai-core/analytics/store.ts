/**
 * In-process analytics event store (seed + live). Prepared for DB sync.
 */

import type {
  AnalyticsDeviceType,
  AnalyticsTrafficSource,
  TrackAnalyticsInput,
  WebsiteAnalyticsEvent,
} from "@/lib/ai-core/analytics/types";

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

/**
 * Seed realistic demo analytics so dashboards aren't empty before live traffic.
 */
export function ensureSeededAnalytics(generationId: string): void {
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
  const buttons = [
    "hero-cta",
    "nav-contact",
    "pricing-primary",
    "footer-cta",
    "trust-learn-more",
  ];

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

      if (i % 4 === 0) {
        state.events.push({
          id: `evt-${generationId}-${d}-${i}-clk`,
          generationId,
          eventName: "button_click",
          sessionId,
          visitorId,
          pagePath,
          source,
          device,
          target: buttons[(base + i) % buttons.length]!,
          createdAt,
        });
      }

      if (i % 11 === 0) {
        state.events.push({
          id: `evt-${generationId}-${d}-${i}-cv`,
          generationId,
          eventName: "conversion",
          sessionId,
          visitorId,
          pagePath: pagePath === "/pricing" ? "/pricing" : "/contact",
          source,
          device,
          target: "primary-conversion",
          valueCents: 4900 + ((base + i) % 5) * 1000,
          createdAt,
        });
      }
    }
  }
}

export function trackAnalyticsEvent(
  input: TrackAnalyticsInput,
): WebsiteAnalyticsEvent {
  const state = getState();
  ensureSeededAnalytics(input.generationId);

  const sessionId =
    input.sessionId?.trim() ||
    `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const visitorId =
    input.visitorId?.trim() ||
    `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const source =
    input.source ||
    inferSource(input.referrer) ||
    "direct";
  const device =
    input.device ||
    inferDevice(
      typeof input.metadata?.userAgent === "string"
        ? input.metadata.userAgent
        : null,
    );

  const event: WebsiteAnalyticsEvent = {
    id: `evt-live-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    generationId: input.generationId,
    eventName: input.eventName,
    sessionId,
    visitorId,
    pagePath: input.pagePath || "/",
    referrer: input.referrer ?? null,
    source,
    device,
    experimentId: input.experimentId ?? null,
    variantId: input.variantId ?? null,
    target: input.target ?? null,
    valueCents: input.valueCents ?? null,
    metadata: input.metadata,
    createdAt: new Date().toISOString(),
  };

  state.events.push(event);

  // Keep memory bounded
  if (state.events.length > 50_000) {
    state.events.splice(0, state.events.length - 40_000);
  }

  return event;
}

export function listAnalyticsEvents(
  generationId: string,
  sinceIso?: string,
): WebsiteAnalyticsEvent[] {
  ensureSeededAnalytics(generationId);
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
