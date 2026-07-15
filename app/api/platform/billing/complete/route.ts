import { parseJsonBody, requireUser } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import { createBillingManager } from "@/lib/billing";
import { requireBillingWriteClient } from "@/lib/billing/write-client";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { NextResponse } from "next/server";
import { z } from "zod";

const completeSchema = z.object({
  sessionId: z.string().uuid(),
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

  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "sessionId is required." }, { status: 400 });
  }

  try {
    const manager = createBillingManager(writer.client!);
    const result = await manager.completeCheckoutSession(parsed.data.sessionId, auth.user!.id);
    const status = await createBillingManager(auth.supabase).getStatus(auth.user!.id);
    return NextResponse.json({ ...result, status });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return serverErrorResponse("billing.complete", error);
  }
}
