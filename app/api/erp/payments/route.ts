import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listPayments, createPayment } from "@/lib/erp/payments";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  companyId: z.string().uuid(),
  amountCents: z.number().int().min(0),
  invoiceId: z.string().uuid().optional(),
  expenseId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const companyId = new URL(request.url).searchParams.get("companyId") ?? undefined;
  const { data, error } = await listPayments(auth.supabase, auth.user!.id, companyId ?? undefined);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ payments: [] });
    return databaseErrorResponse("erp.payments.list", error);
  }
  return NextResponse.json({ payments: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { data, error } = await createPayment(auth.supabase, {
    user_id: auth.user!.id,
    company_id: parsed.data.companyId,
    amount_cents: parsed.data.amountCents,
    invoice_id: parsed.data.invoiceId ?? null,
    expense_id: parsed.data.expenseId ?? null,
    status: "completed",
    paid_at: new Date().toISOString(),
  });
  if (error) return databaseErrorResponse("erp.payments.create", error);
  return NextResponse.json({ payment: data });
}
