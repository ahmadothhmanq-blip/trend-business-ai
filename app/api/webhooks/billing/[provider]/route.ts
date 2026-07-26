import { handleBillingWebhook } from "@/lib/billing";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { enforceWebhookRateLimit } from "@/lib/api/rate-limit";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ provider: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { provider: raw } = await context.params;
  if (raw !== "paypal" && raw !== "card") {
    return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Unsupported billing provider.");
  }

  const limited = enforceWebhookRateLimit(raw);
  if (limited) return limited;

  const rawBody = await request.text();
  const result = await handleBillingWebhook({
    provider: raw,
    headers: request.headers,
    rawBody,
  });

  if (!result.ok) {
    return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, result.status, result.error);
  }

  return NextResponse.json({ received: true, ...result }, { status: result.status });
}
