import type { ErpPayment } from "@/types/erp";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listPayments(supabase: SupabaseClient, userId: string, companyId?: string) {
  let q = supabase.from("erp_payments").select("*").eq("user_id", userId);
  if (companyId) q = q.eq("company_id", companyId);
  return q.order("created_at", { ascending: false });
}

export async function createPayment(
  supabase: SupabaseClient,
  row: Partial<ErpPayment> & { user_id: string; company_id: string; amount_cents: number },
) {
  return supabase
    .from("erp_payments")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      company_id: row.company_id,
      invoice_id: row.invoice_id ?? null,
      expense_id: row.expense_id ?? null,
      reference: row.reference ?? `PAY-${Date.now()}`,
      status: row.status ?? "pending",
      amount_cents: row.amount_cents,
      currency: row.currency ?? "USD",
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}
