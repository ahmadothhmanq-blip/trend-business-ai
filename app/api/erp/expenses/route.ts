import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listExpenses, createExpense } from "@/lib/erp/expenses";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  companyId: z.string().uuid(),
  title: z.string().min(1),
  category: z.string().optional(),
  vendorName: z.string().optional(),
  amountCents: z.number().int().min(0),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const companyId = new URL(request.url).searchParams.get("companyId") ?? undefined;
  const { data, error } = await listExpenses(auth.supabase, auth.user!.id, companyId ?? undefined);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ expenses: [] });
    return databaseErrorResponse("erp.expenses.list", error);
  }
  return NextResponse.json({ expenses: data ?? [] });
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

  const { data, error } = await createExpense(auth.supabase, {
    user_id: auth.user!.id,
    company_id: parsed.data.companyId,
    title: parsed.data.title,
    category: parsed.data.category,
    vendor_name: parsed.data.vendorName,
    amount_cents: parsed.data.amountCents,
  });
  if (error) return databaseErrorResponse("erp.expenses.create", error);
  return NextResponse.json({ expense: data });
}
