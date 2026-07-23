import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listWarehouses, createWarehouse } from "@/lib/erp/warehouses";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({ companyId: z.string().uuid(), name: z.string().min(1), code: z.string().optional(), location: z.string().optional() });

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const companyId = new URL(request.url).searchParams.get("companyId") ?? undefined;
  const { data, error } = await listWarehouses(auth.supabase, auth.user!.id, companyId ?? undefined);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ warehouses: [] });
    return databaseErrorResponse("erp.warehouses.list", error);
  }
  return NextResponse.json({ warehouses: data ?? [] });
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
  const { data, error } = await createWarehouse(auth.supabase, {
    user_id: auth.user!.id,
    company_id: parsed.data.companyId,
    name: parsed.data.name,
    code: parsed.data.code,
    location: parsed.data.location,
  });
  if (error) return databaseErrorResponse("erp.warehouses.create", error);
  return NextResponse.json({ warehouse: data });
}
