/**
 * Read-only ERP connector for BI.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getErpBiData(supabase: SupabaseClient, userId: string) {
  const [invoices, expenses, movements, products] = await Promise.all([
    supabase.from("erp_invoices").select("status, amount_cents").eq("user_id", userId),
    supabase.from("erp_expenses").select("status, amount_cents").eq("user_id", userId),
    supabase.from("erp_stock_movements").select("movement_type, quantity, product_id").eq("user_id", userId),
    supabase.from("erp_products").select("id, cost_cents").eq("user_id", userId),
  ]);

  const inv = invoices.data ?? [];
  const exp = expenses.data ?? [];
  const revenueCents = inv.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.amount_cents ?? 0), 0);
  const expensesCents = exp
    .filter((e) => e.status === "approved" || e.status === "paid")
    .reduce((s, e) => s + Number(e.amount_cents ?? 0), 0);

  const costMap = new Map((products.data ?? []).map((p) => [p.id, Number(p.cost_cents ?? 0)]));
  const levels = new Map<string, number>();
  for (const m of movements.data ?? []) {
    const key = m.product_id as string;
    const qty = Number(m.quantity ?? 0);
    const delta = m.movement_type === "out" ? -qty : qty;
    levels.set(key, (levels.get(key) ?? 0) + delta);
  }
  let inventoryValueCents = 0;
  for (const [pid, qty] of levels) {
    inventoryValueCents += (costMap.get(pid) ?? 0) * qty;
  }

  return { invoices: inv, expenses: exp, revenueCents, expensesCents, inventoryValueCents };
}
