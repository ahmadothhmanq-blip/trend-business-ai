/**
 * Billing bridge — separates platform subscription billing from ERP business invoices.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export async function getBillingBridge(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("billing_invoices")
    .select("id, status, amount_cents, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);
  const rows = data ?? [];
  return {
    platformInvoices: rows.length,
    recentPlatformInvoices: rows.map((r) => ({
      id: r.id,
      status: r.status ?? "unknown",
      amountCents: Number(r.amount_cents ?? 0),
      created_at: r.created_at,
    })),
    note: "Platform SaaS billing — separate from erp_invoices",
  };
}
