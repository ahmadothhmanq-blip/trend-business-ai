import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { updateDeal } from "@/lib/crm/deals";
import { recordActivity } from "@/lib/crm/activities";
import { NextResponse } from "next/server";
import { z } from "zod";

const patchSchema = z.object({
  stage: z.enum(["new", "qualified", "proposal", "negotiation", "won", "lost"]).optional(),
  title: z.string().optional(),
  valueCents: z.number().int().min(0).optional(),
  probability: z.number().int().min(0).max(100).optional(),
  expectedCloseAt: z.string().nullable().optional(),
  ownerName: z.string().optional(),
  notes: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id } = await context.params;
  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (parsed.data.stage) patch.stage = parsed.data.stage;
  if (parsed.data.title) patch.title = parsed.data.title;
  if (parsed.data.valueCents !== undefined) patch.value_cents = parsed.data.valueCents;
  if (parsed.data.probability !== undefined) patch.probability = parsed.data.probability;
  if (parsed.data.expectedCloseAt !== undefined) patch.expected_close_at = parsed.data.expectedCloseAt;
  if (parsed.data.ownerName) patch.owner_name = parsed.data.ownerName;
  if (parsed.data.notes !== undefined) patch.notes = parsed.data.notes;

  const { data, error } = await updateDeal(auth.supabase, auth.user!.id, id, patch);
  if (error) return databaseErrorResponse("crm.deals.update", error);

  if (parsed.data.stage) {
    await recordActivity(auth.supabase, {
      user_id: auth.user!.id,
      deal_id: id,
      activity_type: "system",
      subject: "Deal stage updated",
      body: `Stage changed to ${parsed.data.stage}.`,
    });
  }

  return NextResponse.json({ deal: data });
}
