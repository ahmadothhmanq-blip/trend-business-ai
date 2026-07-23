import type { ErpExpense } from "@/types/erp";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listExpenses(supabase: SupabaseClient, userId: string, companyId?: string) {
  let q = supabase.from("erp_expenses").select("*").eq("user_id", userId);
  if (companyId) q = q.eq("company_id", companyId);
  return q.order("incurred_at", { ascending: false });
}

export async function createExpense(
  supabase: SupabaseClient,
  row: Partial<ErpExpense> & { user_id: string; company_id: string; title: string; amount_cents: number },
) {
  return supabase
    .from("erp_expenses")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      company_id: row.company_id,
      title: row.title,
      category: row.category ?? "general",
      vendor_name: row.vendor_name ?? "",
      status: row.status ?? "draft",
      amount_cents: row.amount_cents,
      currency: row.currency ?? "USD",
      incurred_at: row.incurred_at ?? new Date().toISOString().slice(0, 10),
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}
