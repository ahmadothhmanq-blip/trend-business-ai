import { parseJsonBody, requireUser } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { databaseErrorResponse } from "@/lib/api/errors";
import { createBillingManager } from "@/lib/billing";
import { requireBillingWriteClient } from "@/lib/billing/write-client";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { NextResponse } from "next/server";
import { z } from "zod";

const cancelSchema = z.object({
  immediately: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const limited = enforceMutationRateLimit(auth.user!.id);
  if (limited) return limited;

  const writer = requireBillingWriteClient();
  if (writer.response) return writer.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = cancelSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return apiValidationError("Invalid cancel payload.");
  }

  try {
    const manager = createBillingManager(writer.client!);
    const subscription = await manager.cancelSubscription(auth.user!.id, parsed.data.immediately);
    return NextResponse.json({ subscription });
  } catch (error) {
    if (error instanceof Error) {
      return apiValidationError(error.message);
    }
    return databaseErrorResponse("billing.cancel", error);
  }
}
