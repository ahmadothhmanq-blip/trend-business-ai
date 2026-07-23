import type { ErpWarehouse } from "@/types/erp";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listWarehouses(supabase: SupabaseClient, userId: string, companyId?: string) {
  let q = supabase.from("erp_warehouses").select("*").eq("user_id", userId);
  if (companyId) q = q.eq("company_id", companyId);
  return q.order("name");
}

export async function createWarehouse(
  supabase: SupabaseClient,
  row: Partial<ErpWarehouse> & { user_id: string; company_id: string; name: string },
) {
  return supabase
    .from("erp_warehouses")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      company_id: row.company_id,
      branch_id: row.branch_id ?? null,
      name: row.name,
      code: row.code ?? "WH1",
      location: row.location ?? "",
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}
