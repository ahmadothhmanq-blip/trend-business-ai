import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { enforceMutationRateLimit } from "@/lib/api/rate-limit";
import { getAllErpIntegrations } from "@/lib/erp/integrations";
import { convertDealToSalesOrder } from "@/lib/erp/sales-orders";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const integrations = await getAllErpIntegrations(auth.supabase, auth.user!.id);
  return NextResponse.json({ integrations });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const rateLimited = enforceMutationRateLimit(auth.user!.id);
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<{ action?: string; dealId?: string; companyId?: string }>(request);
  if (body instanceof NextResponse) return body;

  if (body.action === "convert-crm-deal" && body.dealId && body.companyId) {
    const result = await convertDealToSalesOrder(auth.supabase, auth.user!.id, body.companyId, body.dealId);
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    return NextResponse.json({ order: result.data });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
