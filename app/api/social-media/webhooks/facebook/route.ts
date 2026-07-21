import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { enforceWebhookRateLimit } from "@/lib/api/rate-limit";
import { logWebhookEvent, parseMetaWebhookPayload, verifyMetaWebhook } from "@/lib/social-media/webhooks";

export const dynamic = "force-dynamic";

async function handleMetaWebhook(request: Request, platform: string) {
  const rateLimited = enforceWebhookRateLimit(platform);
  if (rateLimited) return rateLimited;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Service unavailable." }, { status: 503 });
  }

  const url = new URL(request.url);
  if (request.method === "GET") {
    const challenge = verifyMetaWebhook(
      url.searchParams.get("hub.mode"),
      url.searchParams.get("hub.verify_token"),
      url.searchParams.get("hub.challenge"),
      process.env.SOCIAL_META_WEBHOOK_VERIFY_TOKEN ?? "",
    );
    if (challenge) return new NextResponse(challenge, { status: 200 });
    return NextResponse.json({ error: "Verification failed." }, { status: 403 });
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const parsed = parseMetaWebhookPayload(payload);

  await logWebhookEvent(admin, {
    platform,
    eventType: parsed.eventType,
    payload,
  });

  return NextResponse.json({ received: true, eventType: parsed.eventType });
}

export async function GET(request: Request) {
  return handleMetaWebhook(request, "facebook");
}

export async function POST(request: Request) {
  return handleMetaWebhook(request, "facebook");
}
