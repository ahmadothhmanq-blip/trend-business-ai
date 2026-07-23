import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listDeals, createDeal } from "@/lib/crm/deals";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().trim().min(1),
  contactId: z.string().uuid().nullable().optional(),
  accountId: z.string().uuid().nullable().optional(),
  stage: z.enum(["new", "qualified", "proposal", "negotiation", "won", "lost"]).optional(),
  valueCents: z.number().int().min(0).optional(),
  probability: z.number().int().min(0).max(100).optional(),
  expectedCloseAt: z.string().nullable().optional(),
  ownerName: z.string().default(""),
  ownerEmail: z.string().default(""),
  notes: z.string().default(""),
});

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const { data, error } = await listDeals(auth.supabase, auth.user!.id);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ deals: [] });
    return databaseErrorResponse("crm.deals.list", error);
  }
  return NextResponse.json({ deals: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  }

  const { data, error } = await createDeal(auth.supabase, {
    user_id: auth.user!.id,
    title: parsed.data.title,
    contact_id: parsed.data.contactId ?? null,
    account_id: parsed.data.accountId ?? null,
    stage: parsed.data.stage,
    value_cents: parsed.data.valueCents,
    probability: parsed.data.probability,
    expected_close_at: parsed.data.expectedCloseAt ?? null,
    owner_name: parsed.data.ownerName,
    owner_email: parsed.data.ownerEmail,
    notes: parsed.data.notes,
  });
  if (error) return databaseErrorResponse("crm.deals.create", error);
  return NextResponse.json({ deal: data });
}
