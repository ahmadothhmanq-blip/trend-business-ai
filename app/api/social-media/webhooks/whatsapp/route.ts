import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { createAdminClient } from "@/lib/supabase/admin";
import { enforceWebhookRateLimit } from "@/lib/api/rate-limit";
import { logWebhookEvent, parseMetaWebhookPayload, verifyMetaWebhook } from "@/lib/social-media/webhooks";

export const dynamic = "force-dynamic";

async function handleWhatsAppWebhook(request: Request) {
  const rateLimited = enforceWebhookRateLimit("whatsapp");
  if (rateLimited) return rateLimited;

  const admin = createAdminClient();
  if (!admin) return apiErrorResponse(API_ERROR_CODES.MIGRATION_REQUIRED, 503, "Service unavailable.");

  const url = new URL(request.url);
  if (request.method === "GET") {
    const challenge = verifyMetaWebhook(
      url.searchParams.get("hub.mode"),
      url.searchParams.get("hub.verify_token"),
      url.searchParams.get("hub.challenge"),
      process.env.SOCIAL_META_WEBHOOK_VERIFY_TOKEN ?? "",
    );
    if (challenge) return new NextResponse(challenge, { status: 200 });
    return apiErrorResponse(API_ERROR_CODES.FORBIDDEN, 403, "Verification failed.");
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const parsed = parseMetaWebhookPayload(payload);
  await logWebhookEvent(admin, { platform: "whatsapp", eventType: parsed.eventType, payload });
  return NextResponse.json({ received: true, messages: parsed.messages.length, statuses: parsed.statusUpdates.length });
}

export async function GET(request: Request) {
  return handleWhatsAppWebhook(request);
}

export async function POST(request: Request) {
  return handleWhatsAppWebhook(request);
}
