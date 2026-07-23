import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { listProducts, createProduct } from "@/lib/erp/products";
import { NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  companyId: z.string().uuid(),
  sku: z.string().min(1),
  name: z.string().min(1),
  priceCents: z.number().int().min(0).optional(),
  costCents: z.number().int().min(0).optional(),
  categoryId: z.string().uuid().optional(),
});

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const companyId = new URL(request.url).searchParams.get("companyId") ?? undefined;
  const { data, error } = await listProducts(auth.supabase, auth.user!.id, companyId ?? undefined);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ products: [] });
    return databaseErrorResponse("erp.products.list", error);
  }
  return NextResponse.json({ products: data ?? [] });
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

  const { data, error } = await createProduct(auth.supabase, {
    user_id: auth.user!.id,
    company_id: parsed.data.companyId,
    sku: parsed.data.sku,
    name: parsed.data.name,
    price_cents: parsed.data.priceCents,
    cost_cents: parsed.data.costCents,
    category_id: parsed.data.categoryId ?? null,
  });
  if (error) return databaseErrorResponse("erp.products.create", error);
  return NextResponse.json({ product: data });
}
