import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listInvoices, createInvoice, updateInvoice } from "@/lib/erp/invoices";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  companyId: z.string().uuid(),
  customerName: z.string().min(1),
  customerEmail: z.string().optional(),
  amountCents: z.number().int().min(0),
  crmContactId: z.string().uuid().optional(),
  crmDealId: z.string().uuid().optional(),
  salesOrderId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const companyId = new URL(request.url).searchParams.get("companyId") ?? undefined;
  const { data, error } = await listInvoices(auth.supabase, auth.user!.id, companyId ?? undefined);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ invoices: [] });
    return databaseErrorResponse("erp.invoices.list", error);
  }
  return NextResponse.json({ invoices: data ?? [] });
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

  const { data, error } = await createInvoice(auth.supabase, {
    user_id: auth.user!.id,
    company_id: parsed.data.companyId,
    customer_name: parsed.data.customerName,
    customer_email: parsed.data.customerEmail,
    amount_cents: parsed.data.amountCents,
    crm_contact_id: parsed.data.crmContactId ?? null,
    crm_deal_id: parsed.data.crmDealId ?? null,
    sales_order_id: parsed.data.salesOrderId ?? null,
  });
  if (error) return databaseErrorResponse("erp.invoices.create", error);
  return NextResponse.json({ invoice: data });
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const body = await parseJsonBody<{ id?: string; status?: string }>(request);
  if (body instanceof NextResponse) return body;
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const patch: Record<string, unknown> = {};
  if (body.status) patch.status = body.status;
  if (body.status === "paid") patch.paid_at = new Date().toISOString();
  const { data, error } = await updateInvoice(auth.supabase, auth.user!.id, body.id, patch);
  if (error) return databaseErrorResponse("erp.invoices.update", error);
  return NextResponse.json({ invoice: data });
}
