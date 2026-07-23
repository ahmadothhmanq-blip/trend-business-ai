import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import {
  listSalesOrders,
  createSalesOrder,
  convertDealToSalesOrder,
  createInvoiceFromSalesOrder,
} from "@/lib/erp/sales-orders";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  companyId: z.string().uuid(),
  customerName: z.string().min(1),
  customerEmail: z.string().optional(),
  totalCents: z.number().int().min(0).optional(),
  crmDealId: z.string().uuid().optional(),
  crmContactId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const companyId = new URL(request.url).searchParams.get("companyId") ?? undefined;
  const { data, error } = await listSalesOrders(auth.supabase, auth.user!.id, companyId ?? undefined);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ salesOrders: [] });
    return databaseErrorResponse("erp.sales-orders.list", error);
  }
  return NextResponse.json({ salesOrders: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const actionBody = body as { action?: string; dealId?: string; companyId?: string; orderId?: string };
  if (actionBody.action === "convert-deal" && actionBody.dealId && actionBody.companyId) {
    const result = await convertDealToSalesOrder(auth.supabase, auth.user!.id, actionBody.companyId, actionBody.dealId);
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    return NextResponse.json({ order: result.data });
  }
  if (actionBody.action === "create-invoice" && actionBody.orderId) {
    const result = await createInvoiceFromSalesOrder(auth.supabase, auth.user!.id, actionBody.orderId);
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    return NextResponse.json({ invoice: result.data });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await createSalesOrder(auth.supabase, {
    user_id: auth.user!.id,
    company_id: parsed.data.companyId,
    customer_name: parsed.data.customerName,
    customer_email: parsed.data.customerEmail,
    total_cents: parsed.data.totalCents,
    crm_deal_id: parsed.data.crmDealId ?? null,
    crm_contact_id: parsed.data.crmContactId ?? null,
  });
  if (error) return databaseErrorResponse("erp.sales-orders.create", error);
  return NextResponse.json({ order: data });
}
