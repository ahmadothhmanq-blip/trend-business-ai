import { NextResponse } from "next/server";
import { z } from "zod";
import {
  trackAnalyticsEvent,
  type AnalyticsEventName,
} from "@/lib/ai-core/analytics";
import {
  getExperiment,
  recordVariantMetric,
} from "@/lib/ai-core/ab-testing";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  enforceWebsitePublicRateLimit,
  getRequestClientIp,
  isPublishedWebsiteGeneration,
} from "@/lib/website/public-endpoints";

export const dynamic = "force-dynamic";

/** Always succeed from the client's perspective for benign skips. */
function trackingOk(extra?: Record<string, unknown>) {
  return NextResponse.json({ success: true, ...extra });
}

const trackSchema = z.object({
  generationId: z.string().trim().min(1).max(80),
  eventName: z.enum([
    "page_view",
    "session_start",
    "button_click",
    "conversion",
    "cta_click",
    "scroll",
    "form_submit",
  ]),
  sessionId: z.string().trim().max(120).optional(),
  visitorId: z.string().trim().max(120).optional(),
  pagePath: z.string().trim().max(500).optional(),
  referrer: z.string().trim().max(500).optional().nullable(),
  source: z
    .enum([
      "direct",
      "organic",
      "social",
      "referral",
      "email",
      "paid",
      "unknown",
    ])
    .optional(),
  device: z.enum(["desktop", "tablet", "mobile"]).optional(),
  experimentId: z.string().trim().max(80).optional().nullable(),
  variantId: z.string().trim().max(80).optional().nullable(),
  target: z.string().trim().max(200).optional().nullable(),
  valueCents: z.number().int().min(0).max(100_000_000).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * POST — public website analytics track (page views, clicks, conversions).
 * Does not alter generation or publishing flows.
 */
export async function POST(request: Request) {
  const ip = getRequestClientIp(request);
  const rateLimited = await enforceWebsitePublicRateLimit("track", ip);
  if (rateLimited) return rateLimited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return trackingOk({ skipped: true, reason: "invalid_json" });
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return trackingOk({ skipped: true, reason: "invalid_payload" });
  }

  const data = parsed.data;
  const admin = createAdminClient();
  if (!admin) {
    return trackingOk({ skipped: true, reason: "storage_unavailable" });
  }

  const published = await isPublishedWebsiteGeneration(admin, data.generationId);
  if (!published) {
    return trackingOk({ skipped: true, reason: "not_published" });
  }

  const event = await trackAnalyticsEvent(
    {
      generationId: data.generationId,
      eventName: data.eventName as AnalyticsEventName,
      sessionId: data.sessionId,
      visitorId: data.visitorId,
      pagePath: data.pagePath,
      referrer: data.referrer,
      source: data.source,
      device: data.device,
      experimentId: data.experimentId,
      variantId: data.variantId,
      target: data.target,
      valueCents: data.valueCents,
      metadata: data.metadata,
    },
    admin,
  );

  if (data.experimentId && data.variantId) {
    const experiment = await getExperiment(data.experimentId, admin);
    if (
      experiment &&
      experiment.generationId === data.generationId &&
      experiment.status === "running"
    ) {
      if (data.eventName === "page_view" || data.eventName === "session_start") {
        await recordVariantMetric(
          {
            experimentId: data.experimentId,
            variantId: data.variantId,
            kind: "impression",
          },
          admin,
        );
      } else if (
        data.eventName === "button_click" ||
        data.eventName === "cta_click"
      ) {
        await recordVariantMetric(
          {
            experimentId: data.experimentId,
            variantId: data.variantId,
            kind: "click",
          },
          admin,
        );
      } else if (
        data.eventName === "conversion" ||
        data.eventName === "form_submit"
      ) {
        await recordVariantMetric(
          {
            experimentId: data.experimentId,
            variantId: data.variantId,
            kind: "conversion",
          },
          admin,
        );
      }
    }
  }

  return trackingOk({ eventId: event.id });
}
