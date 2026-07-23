import { requireUser } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import { getErpAnalytics } from "@/lib/erp/analytics";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;
  const companyId = new URL(request.url).searchParams.get("companyId") ?? undefined;
  const { summary, error } = await getErpAnalytics(auth.supabase, auth.user!.id, companyId);
  if (error) {
    if (/relation/i.test(error.message ?? "")) return NextResponse.json({ summary: { revenueCents: 0, expensesCents: 0, profitCents: 0, inventoryValueCents: 0, openInvoices: 0, paidInvoices: 0, salesOrders: 0, purchaseOrders: 0, activeEmployees: 0, pendingApprovals: 0, cashFlowCents: 0, byInvoiceStatus: {} } });
    return databaseErrorResponse("erp.analytics", error);
  }
  return NextResponse.json({ summary });
}
