import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
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
    if (result.error) return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, result.error.message);
    return NextResponse.json({ order: result.data });
  }

  return apiValidationError("Unknown action");
}
