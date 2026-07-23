import type { ErpStockMovement } from "@/types/erp";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listStockMovements(supabase: SupabaseClient, userId: string, companyId?: string) {
  let q = supabase.from("erp_stock_movements").select("*").eq("user_id", userId);
  if (companyId) q = q.eq("company_id", companyId);
  return q.order("occurred_at", { ascending: false });
}

export async function recordStockMovement(
  supabase: SupabaseClient,
  row: Partial<ErpStockMovement> & {
    user_id: string;
    company_id: string;
    product_id: string;
    warehouse_id: string;
    movement_type: ErpStockMovement["movement_type"];
    quantity: number;
  },
) {
  return supabase
    .from("erp_stock_movements")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      company_id: row.company_id,
      product_id: row.product_id,
      warehouse_id: row.warehouse_id,
      movement_type: row.movement_type,
      quantity: row.quantity,
      reference: row.reference ?? "",
      notes: row.notes ?? "",
      occurred_at: row.occurred_at ?? new Date().toISOString(),
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function getStockLevels(supabase: SupabaseClient, userId: string, companyId: string) {
  const { data: movements } = await supabase
    .from("erp_stock_movements")
    .select("product_id, warehouse_id, movement_type, quantity")
    .eq("user_id", userId)
    .eq("company_id", companyId);

  const levels = new Map<string, number>();
  for (const m of movements ?? []) {
    const key = `${m.product_id}:${m.warehouse_id}`;
    const qty = Number(m.quantity ?? 0);
    const delta = m.movement_type === "out" ? -qty : qty;
    levels.set(key, (levels.get(key) ?? 0) + delta);
  }
  return levels;
}

export async function computeInventoryValueCents(
  supabase: SupabaseClient,
  userId: string,
  companyId: string,
): Promise<number> {
  const levels = await getStockLevels(supabase, userId, companyId);
  const productIds = [...new Set([...levels.keys()].map((k) => k.split(":")[0]))];
  if (!productIds.length) return 0;

  const { data: products } = await supabase
    .from("erp_products")
    .select("id, cost_cents")
    .eq("user_id", userId)
    .in("id", productIds);

  const costMap = new Map((products ?? []).map((p) => [p.id, Number(p.cost_cents ?? 0)]));
  let total = 0;
  for (const [key, qty] of levels) {
    const productId = key.split(":")[0];
    total += (costMap.get(productId) ?? 0) * qty;
  }
  return Math.round(total);
}
