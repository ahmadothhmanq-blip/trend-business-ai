import type { ErpSupplier } from "@/types/erp";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listSuppliers(supabase: SupabaseClient, userId: string, companyId?: string) {
  let q = supabase.from("erp_suppliers").select("*").eq("user_id", userId);
  if (companyId) q = q.eq("company_id", companyId);
  return q.order("name");
}

export async function createSupplier(
  supabase: SupabaseClient,
  row: Partial<ErpSupplier> & { user_id: string; company_id: string; name: string },
) {
  return supabase
    .from("erp_suppliers")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      company_id: row.company_id,
      name: row.name,
      email: row.email ?? "",
      phone: row.phone ?? "",
      address: row.address ?? "",
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}
