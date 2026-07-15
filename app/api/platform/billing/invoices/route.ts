import { requireUser, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse } from "@/lib/api/errors";
import type { BillingInvoice } from "@/types/billing";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { from, to, page, limit } = paginationParams(searchParams);

  const { data, error, count } = await auth.supabase
    .from("billing_invoices")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json({ invoices: [], page, limit, total: 0 });
    }
    return databaseErrorResponse("billing.invoices", error);
  }

  return NextResponse.json({
    invoices: (data as BillingInvoice[]) ?? [],
    page,
    limit,
    total: count ?? 0,
  });
}
