import { parseJsonBody, requireUser } from "@/lib/api/helpers";
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
    return NextResponse.json({ error: "Invalid cancel payload." }, { status: 400 });
  }

  try {
    const manager = createBillingManager(writer.client!);
    const subscription = await manager.cancelSubscription(auth.user!.id, parsed.data.immediately);
    return NextResponse.json({ subscription });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return databaseErrorResponse("billing.cancel", error);
  }
}
