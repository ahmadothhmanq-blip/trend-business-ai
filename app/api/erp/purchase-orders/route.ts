import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listPurchaseOrders, createPurchaseOrder, receivePurchaseOrder } from "@/lib/erp/procurement";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  companyId: z.string().uuid(),
  supplierId: z.string().uuid().optional(),
  totalCents: z.number().int().min(0).optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const companyId = new URL(request.url).searchParams.get("companyId") ?? undefined;
  const { data, error } = await listPurchaseOrders(auth.supabase, auth.user!.id, companyId ?? undefined);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ purchaseOrders: [] });
    return databaseErrorResponse("erp.purchase-orders.list", error);
  }
  return NextResponse.json({ purchaseOrders: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const receiveBody = body as {
    action?: string;
    poId?: string;
    productId?: string;
    warehouseId?: string;
    quantity?: number;
  };
  if (receiveBody.action === "receive" && receiveBody.poId && receiveBody.productId && receiveBody.warehouseId && receiveBody.quantity) {
    const result = await receivePurchaseOrder(auth.supabase, auth.user!.id, receiveBody.poId, {
      productId: receiveBody.productId,
      warehouseId: receiveBody.warehouseId,
      quantity: receiveBody.quantity,
    });
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const { data, error } = await createPurchaseOrder(auth.supabase, {
    user_id: auth.user!.id,
    company_id: parsed.data.companyId,
    supplier_id: parsed.data.supplierId ?? null,
    total_cents: parsed.data.totalCents,
  });
  if (error) return databaseErrorResponse("erp.purchase-orders.create", error);
  return NextResponse.json({ purchaseOrder: data });
}
