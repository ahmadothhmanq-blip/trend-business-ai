import type { ErpSalesOrder } from "@/types/erp";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createInvoice } from "./invoices";
import { logErpAudit } from "./audit";

export async function listSalesOrders(supabase: SupabaseClient, userId: string, companyId?: string) {
  let q = supabase.from("erp_sales_orders").select("*").eq("user_id", userId);
  if (companyId) q = q.eq("company_id", companyId);
  return q.order("created_at", { ascending: false });
}

export async function createSalesOrder(
  supabase: SupabaseClient,
  row: Partial<ErpSalesOrder> & { user_id: string; company_id: string; customer_name: string },
) {
  const orderNumber = row.order_number || `SO-${Date.now()}`;
  return supabase
    .from("erp_sales_orders")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      company_id: row.company_id,
      order_number: orderNumber,
      customer_name: row.customer_name,
      customer_email: row.customer_email ?? "",
      crm_deal_id: row.crm_deal_id ?? null,
      crm_contact_id: row.crm_contact_id ?? null,
      status: row.status ?? "draft",
      total_cents: row.total_cents ?? 0,
      currency: row.currency ?? "USD",
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function convertDealToSalesOrder(
  supabase: SupabaseClient,
  userId: string,
  companyId: string,
  dealId: string,
) {
  const { data: deal, error } = await supabase
    .from("crm_deals")
    .select("*")
    .eq("user_id", userId)
    .eq("id", dealId)
    .single();
  if (error || !deal) return { order: null, error: error ?? new Error("Deal not found") };

  const { data: contact } = deal.contact_id
    ? await supabase.from("crm_contacts").select("email, first_name, last_name").eq("id", deal.contact_id).single()
    : { data: null };

  const customerName = contact
    ? `${contact.first_name} ${contact.last_name}`.trim() || deal.title
    : deal.title;

  const result = await createSalesOrder(supabase, {
    user_id: userId,
    company_id: companyId,
    customer_name: customerName,
    customer_email: contact?.email ?? "",
    crm_deal_id: dealId,
    crm_contact_id: deal.contact_id,
    total_cents: deal.value_cents ?? 0,
    status: "confirmed",
    metadata: { source: "crm_deal" },
  });

  if (result.data) {
    await logErpAudit(supabase, {
      user_id: userId,
      company_id: companyId,
      action: "convert_deal_to_sales_order",
      entity_type: "sales_order",
      entity_id: result.data.id,
      details: { dealId },
    });
  }
  return result;
}

export async function createInvoiceFromSalesOrder(
  supabase: SupabaseClient,
  userId: string,
  orderId: string,
) {
  const { data: order, error } = await supabase
    .from("erp_sales_orders")
    .select("*")
    .eq("user_id", userId)
    .eq("id", orderId)
    .single();
  if (error || !order) return { invoice: null, error: error ?? new Error("Order not found") };

  const inv = await createInvoice(supabase, {
    user_id: userId,
    company_id: order.company_id,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    crm_deal_id: order.crm_deal_id,
    crm_contact_id: order.crm_contact_id,
    sales_order_id: order.id,
    amount_cents: order.total_cents,
    status: "sent",
  });

  if (inv.data) {
    await supabase
      .from("erp_sales_orders")
      .update({ status: "invoiced", updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("user_id", userId);
  }
  return inv;
}
