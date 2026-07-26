import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { createGrowthWriteClient } from "@/lib/growth/client";
import { scoreLead } from "@/lib/growth/codes";
import { leadCaptureSchema } from "@/lib/growth/schemas";
import { enforceMutationRateLimitAsync } from "@/lib/api/rate-limit";
import { parseJsonBody } from "@/lib/api/helpers";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anon";

  const rateLimited = await enforceMutationRateLimitAsync(`growth-lead:${ip}`);
  // Prod without Upstash fail-closes growth-* keys with 503 — do not block lead capture.
  if (rateLimited) {
    if (rateLimited.status >= 500) {
      console.error(
        "growth leads rate limit unavailable; continuing ingest",
        await rateLimited
          .clone()
          .json()
          .catch(() => null),
      );
    } else {
      return rateLimited;
    }
  }

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = leadCaptureSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  if (parsed.data.honeypot) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const score = scoreLead(parsed.data);
  const { client } = createGrowthWriteClient();

  // Public anon inserts cannot SELECT RETURNING under RLS — insert only.
  const { error } = await client.from("growth_leads").insert({
    email: parsed.data.email.toLowerCase(),
    name: parsed.data.name ?? null,
    company: parsed.data.company ?? null,
    phone: parsed.data.phone ?? null,
    message: parsed.data.message ?? null,
    source: parsed.data.source,
    score,
    page_path: parsed.data.pagePath ?? null,
    utm_source: parsed.data.utmSource ?? null,
    utm_medium: parsed.data.utmMedium ?? null,
    utm_campaign: parsed.data.utmCampaign ?? null,
    affiliate_code: parsed.data.affiliateCode ?? null,
    referral_code: parsed.data.referralCode ?? null,
    owner_user_id: null,
    status: "new",
  });

  if (error?.code === "42P01") {
    return apiErrorResponse(API_ERROR_CODES.MIGRATION_REQUIRED, 503, "Growth engine migration not applied. Run migration 029.");
  }

  if (error) {
    return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error.message);
  }

  await client.from("growth_events").insert({
    event_name: "lead_submit",
    event_category: "conversion",
    page_path: parsed.data.pagePath ?? null,
    utm_source: parsed.data.utmSource ?? null,
    utm_medium: parsed.data.utmMedium ?? null,
    utm_campaign: parsed.data.utmCampaign ?? null,
    metadata: { source: parsed.data.source, score },
  });

  return NextResponse.json({ ok: true, lead: { score, status: "new" } });
}
