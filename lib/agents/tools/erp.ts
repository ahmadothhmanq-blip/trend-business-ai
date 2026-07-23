import type { SupabaseClient } from "@supabase/supabase-js";

export async function getErpInvoices(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("erp_invoices").select("id, invoice_number, status, total_cents, created_at").eq("user_id", userId).limit(50);
  const rows = data ?? [];
  return { invoices: rows, totalRevenueCents: rows.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total_cents ?? 0), 0) };
}

export async function getErpExpenses(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("erp_expenses").select("id, title, amount_cents, status, created_at").eq("user_id", userId).limit(50);
  const rows = data ?? [];
  return { expenses: rows, totalExpensesCents: rows.reduce((s, e) => s + Number(e.amount_cents ?? 0), 0) };
}

export async function getInventorySummary(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("erp_products").select("id, name, stock_quantity, unit_price_cents").eq("user_id", userId).limit(50);
  const rows = data ?? [];
  const inventoryValueCents = rows.reduce((s, p) => s + Number(p.stock_quantity ?? 0) * Number(p.unit_price_cents ?? 0), 0);
  return { products: rows, productCount: rows.length, inventoryValueCents };
}
