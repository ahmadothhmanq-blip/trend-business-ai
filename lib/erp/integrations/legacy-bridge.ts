/**
 * Legacy bridge for Business Manager ERP integration panel.
 * Returns real ERP invoice metrics (not platform billing).
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
    .from("erp_invoices")
    .select("id, status, amount_cents, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const rows = data ?? [];
  return {
    invoices: rows.length,
    recentInvoices: rows.map((r) => ({
      id: r.id,
      status: r.status ?? "unknown",
      amount: Number(r.amount_cents ?? 0),
      created_at: r.created_at,
    })),
  };
}
