/**
 * Read-only ERP bridge — reads billing/finance data without modifying ERP modules.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type ErpBridgeSummary = {
  invoices: number;
  recentInvoices: Array<{ id: string; status: string; amount: number; created_at: string }>;
};

export async function getErpBridgeSummary(
  supabase: SupabaseClient,
  userId: string,
): Promise<ErpBridgeSummary> {
  const { data } = await supabase
    .from("billing_invoices")
    .select("id, status, amount, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const rows = data ?? [];
  return {
    invoices: rows.length,
    recentInvoices: rows.map((r) => ({
      id: r.id,
      status: r.status ?? "unknown",
      amount: Number(r.amount ?? 0),
      created_at: r.created_at,
    })),
  };
}
