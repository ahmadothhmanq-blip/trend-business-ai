import { NextResponse } from "next/server";
import { createGrowthAnonClient } from "@/lib/growth/client";
import { eventTrackSchema } from "@/lib/growth/schemas";
import { parseJsonBody } from "@/lib/api/helpers";
import { enforceMutationRateLimitAsync } from "@/lib/api/rate-limit";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anon";

  const rateLimited = await enforceMutationRateLimitAsync(`growth-event:${ip}`);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = eventTrackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid event" },
      { status: 400 },
    );
  }

  let userId: string | null = null;
  let authedClient: Awaited<ReturnType<typeof createClient>> | null = null;
  try {
    authedClient = await createClient();
    const { data } = await authedClient.auth.getUser();
    userId = data.user?.id ?? null;
  } catch {
    userId = null;
    authedClient = null;
  }

  const metadata = parsed.data.metadata ?? {};
  if (JSON.stringify(metadata).length > 4000) {
    return NextResponse.json({ error: "metadata too large" }, { status: 400 });
  }

  const client = userId && authedClient ? authedClient : createGrowthAnonClient();
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

  if (error?.code === "42P01") {
    return NextResponse.json({ ok: true, skipped: true });
  }
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
