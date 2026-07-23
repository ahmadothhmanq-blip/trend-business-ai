import type { ErpPurchaseOrder, ErpApproval } from "@/types/erp";
import type { SupabaseClient } from "@supabase/supabase-js";
import { recordStockMovement } from "./inventory";
import { logErpAudit } from "./audit";

export async function listPurchaseOrders(supabase: SupabaseClient, userId: string, companyId?: string) {
  let q = supabase.from("erp_purchase_orders").select("*").eq("user_id", userId);
  if (companyId) q = q.eq("company_id", companyId);
  return q.order("created_at", { ascending: false });
}

export async function createPurchaseOrder(
  supabase: SupabaseClient,
  row: Partial<ErpPurchaseOrder> & { user_id: string; company_id: string; supplier_id?: string | null },
) {
  const poNumber = row.po_number || `PO-${Date.now()}`;
  return supabase
    .from("erp_purchase_orders")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      company_id: row.company_id,
      po_number: poNumber,
      supplier_id: row.supplier_id ?? null,
      status: row.status ?? "draft",
      total_cents: row.total_cents ?? 0,
      currency: row.currency ?? "USD",
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function receivePurchaseOrder(
  supabase: SupabaseClient,
  userId: string,
  poId: string,
  input: { productId: string; warehouseId: string; quantity: number },
) {
  const { data: po, error } = await supabase
    .from("erp_purchase_orders")
    .select("*")
    .eq("user_id", userId)
    .eq("id", poId)
    .single();
  if (error || !po) return { error: error ?? new Error("PO not found") };

  await recordStockMovement(supabase, {
    user_id: userId,
    company_id: po.company_id,
    product_id: input.productId,
    warehouse_id: input.warehouseId,
    movement_type: "in",
    quantity: input.quantity,
    reference: po.po_number,
    notes: "PO receipt",
  });

  await supabase
    .from("erp_purchase_orders")
    .update({ status: "received", updated_at: new Date().toISOString() })
    .eq("id", poId)
    .eq("user_id", userId);

  return { success: true };
}

export async function listApprovals(supabase: SupabaseClient, userId: string, companyId?: string) {
  let q = supabase.from("erp_approvals").select("*").eq("user_id", userId);
  if (companyId) q = q.eq("company_id", companyId);
  return q.order("created_at", { ascending: false });
}

export async function createApproval(
  supabase: SupabaseClient,
  row: Partial<ErpApproval> & { user_id: string; company_id: string; entity_type: string; entity_id: string; title: string },
) {
  return supabase
    .from("erp_approvals")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      company_id: row.company_id,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      title: row.title,
      status: row.status ?? "pending",
      requested_by: row.requested_by ?? "",
      reviewed_by: row.reviewed_by ?? "",
      notes: row.notes ?? "",
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function updateApprovalStatus(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  status: ErpApproval["status"],
  reviewedBy: string,
) {
  const result = await supabase
    .from("erp_approvals")
    .update({ status, reviewed_by: reviewedBy, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (result.data) {
    await logErpAudit(supabase, {
      user_id: userId,
      company_id: result.data.company_id,
      action: `approval_${status}`,
      entity_type: "approval",
      entity_id: id,
      details: { reviewedBy },
    });
  }
  return result;
}
