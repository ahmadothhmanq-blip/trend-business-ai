/**
 * Read-only Billing connector for BI revenue data.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getBillingBiData(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("billing_invoices")
    .select("status, amount_cents, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  const rows = data ?? [];
  const platformRevenueCents = rows.filter((r) => r.status === "paid").reduce((s, r) => s + Number(r.amount_cents ?? 0), 0);
  return { invoices: rows, platformRevenueCents, note: "Platform SaaS billing — separate from ERP revenue" };
}
