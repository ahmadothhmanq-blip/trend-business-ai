import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listStockMovements, recordStockMovement } from "@/lib/erp/inventory";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  companyId: z.string().uuid(),
  productId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  movementType: z.enum(["in", "out", "adjustment", "transfer"]),
  quantity: z.number().positive(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const companyId = new URL(request.url).searchParams.get("companyId") ?? undefined;
  const { data, error } = await listStockMovements(auth.supabase, auth.user!.id, companyId ?? undefined);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ movements: [] });
    return databaseErrorResponse("erp.inventory.list", error);
  }
  return NextResponse.json({ movements: data ?? [] });
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
  const { data, error } = await recordStockMovement(auth.supabase, {
    user_id: auth.user!.id,
    company_id: parsed.data.companyId,
    product_id: parsed.data.productId,
    warehouse_id: parsed.data.warehouseId,
    movement_type: parsed.data.movementType,
    quantity: parsed.data.quantity,
    reference: parsed.data.reference,
    notes: parsed.data.notes,
  });
  if (error) return databaseErrorResponse("erp.inventory.create", error);
  return NextResponse.json({ movement: data });
}
