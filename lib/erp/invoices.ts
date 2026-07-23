import type { ErpInvoice } from "@/types/erp";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listInvoices(supabase: SupabaseClient, userId: string, companyId?: string) {
  let q = supabase.from("erp_invoices").select("*").eq("user_id", userId);
  if (companyId) q = q.eq("company_id", companyId);
  return q.order("created_at", { ascending: false });
}

export async function createInvoice(
  supabase: SupabaseClient,
  row: Partial<ErpInvoice> & { user_id: string; company_id: string; customer_name: string; amount_cents: number },
) {
  const invoiceNumber = row.invoice_number || `INV-${Date.now()}`;
  return supabase
    .from("erp_invoices")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      company_id: row.company_id,
      invoice_number: invoiceNumber,
      customer_name: row.customer_name,
      customer_email: row.customer_email ?? "",
      crm_contact_id: row.crm_contact_id ?? null,
      crm_deal_id: row.crm_deal_id ?? null,
      sales_order_id: row.sales_order_id ?? null,
      status: row.status ?? "draft",
      amount_cents: row.amount_cents,
      currency: row.currency ?? "USD",
      due_at: row.due_at ?? null,
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function updateInvoice(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: Record<string, unknown>,
) {
  return supabase
    .from("erp_invoices")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
}
