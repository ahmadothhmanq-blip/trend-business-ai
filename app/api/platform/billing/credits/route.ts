import { parseJsonBody, requireUser } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { databaseErrorResponse } from "@/lib/api/errors";
import { createBillingManager, isBillingConfigured } from "@/lib/billing";
import { requireBillingWriteClient } from "@/lib/billing/write-client";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import type { BillingProviderId } from "@/types/billing";
import { NextResponse } from "next/server";
import { z } from "zod";

const creditsSchema = z.object({
  packId: z.string().min(1),
  provider: z.enum(["paypal", "card"]).default("paypal"),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const limited = enforceMutationRateLimit(auth.user!.id);
  if (limited) return limited;

  if (!isBillingConfigured()) {
    return apiErrorResponse(API_ERROR_CODES.MIGRATION_REQUIRED, 503, "Billing is not configured. Set PayPal credentials first.");
  }

  const writer = requireBillingWriteClient();
  if (writer.response) return writer.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = creditsSchema.safeParse(body);
  if (!parsed.success) {
    return apiErrorResponse(
      API_ERROR_CODES.INVALID_INPUT,
      400,
      "Invalid credits payload.",
      undefined,
      { details: parsed.error.flatten() },
    );
  }

  try {
    const manager = createBillingManager(writer.client!);
    const session = await manager.createCreditsCheckout({
      userId: auth.user!.id,
      packId: parsed.data.packId,
      provider: parsed.data.provider as BillingProviderId,
      email: auth.user!.email,
    });

    return NextResponse.json({
      sessionId: session.id,
      approvalUrl: session.approval_url,
      provider: session.provider,
      amountCents: session.amount_cents,
    });
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "42P01") {
      return apiErrorResponse(API_ERROR_CODES.MIGRATION_REQUIRED, 503, "Billing tables are not migrated. Apply migration 025_billing_system.sql.");
    }
    if (error instanceof Error) {
      return apiValidationError(error.message);
    }
    return databaseErrorResponse("billing.credits", error);
  }
}
