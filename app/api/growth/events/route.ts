import { NextResponse } from "next/server";
import { createGrowthAnonClient } from "@/lib/growth/client";
import { eventTrackSchema } from "@/lib/growth/schemas";
import { enforceMutationRateLimitAsync } from "@/lib/api/rate-limit";
import { createClient } from "@/lib/supabase/server";

/** Fire-and-forget analytics: always succeed from the client's perspective. */
function trackingOk(extra?: Record<string, unknown>) {
  return NextResponse.json({ success: true, ...extra });
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anon";

    // Best-effort rate limit only — never return 429/503 from this route.
    try {
      await enforceMutationRateLimitAsync(`growth-event:${ip}`);
    } catch (error) {
      console.error("growth events rate limit failed; continuing", error);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      console.error("growth events invalid JSON; skipping", error);
      return trackingOk({ skipped: true });
    }

    const parsed = eventTrackSchema.safeParse(body);
    if (!parsed.success) {
      console.error(
        "growth events validation failed; skipping",
        parsed.error.issues[0]?.message,
      );
      return trackingOk({ skipped: true });
    }

    let userId: string | null = null;
    let authedClient: Awaited<ReturnType<typeof createClient>> | null = null;
    try {
      authedClient = await createClient();
      const { data } = await authedClient.auth.getUser();
      userId = data.user?.id ?? null;
    } catch (error) {
      console.error("growth events auth lookup failed; continuing anon", error);
      userId = null;
      authedClient = null;
    }

    const metadata = parsed.data.metadata ?? {};
    try {
      if (JSON.stringify(metadata).length > 4000) {
        console.error("growth events metadata too large; skipping");
        return trackingOk({ skipped: true });
      }
    } catch (error) {
      console.error("growth events metadata check failed; skipping", error);
      return trackingOk({ skipped: true });
    }

    try {
      const client =
        userId && authedClient ? authedClient : createGrowthAnonClient();
      const { error } = await client.from("growth_events").insert({
        user_id: userId,
        session_id: parsed.data.sessionId ?? null,
        event_name: parsed.data.eventName,
        event_category: parsed.data.eventCategory,
        page_path: parsed.data.pagePath ?? null,
        referrer: parsed.data.referrer ?? null,
        utm_source: parsed.data.utmSource ?? null,
        utm_medium: parsed.data.utmMedium ?? null,
        utm_campaign: parsed.data.utmCampaign ?? null,
        value_cents: parsed.data.valueCents ?? null,
        metadata,
      });

      if (error) {
        console.error("growth events insert failed", error);
        return trackingOk({ skipped: true });
      }
    } catch (error) {
      console.error("growth events insert threw; skipping", error);
      return trackingOk({ skipped: true });
    }

    return trackingOk();
  } catch (error) {
    console.error("growth events unexpected failure", error);
    return trackingOk({ skipped: true });
  }
}
