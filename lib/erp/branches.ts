import type { ErpBranch } from "@/types/erp";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listBranches(supabase: SupabaseClient, userId: string, companyId?: string) {
  let q = supabase.from("erp_branches").select("*").eq("user_id", userId);
  if (companyId) q = q.eq("company_id", companyId);
  return q.order("name");
}

export async function createBranch(
  supabase: SupabaseClient,
  row: Partial<ErpBranch> & { user_id: string; company_id: string; name: string },
) {
  return supabase
    .from("erp_branches")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      company_id: row.company_id,
      name: row.name,
      code: row.code ?? "MAIN",
      address: row.address ?? "",
      is_primary: row.is_primary ?? false,
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}
