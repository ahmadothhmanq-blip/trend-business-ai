import type { ErpCompany } from "@/types/erp";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listCompanies(supabase: SupabaseClient, userId: string) {
  return supabase.from("erp_companies").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
}

export async function createCompany(
  supabase: SupabaseClient,
  row: Partial<ErpCompany> & { user_id: string; name: string },
) {
  return supabase
    .from("erp_companies")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      name: row.name,
      legal_name: row.legal_name ?? "",
      tax_id: row.tax_id ?? "",
      currency: row.currency ?? "USD",
      fiscal_year_start: row.fiscal_year_start ?? "01-01",
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function ensureDefaultCompany(supabase: SupabaseClient, userId: string) {
  const { data: existing } = await supabase.from("erp_companies").select("id").eq("user_id", userId).limit(1);
  if (existing?.length) return { companyId: existing[0].id as string, created: false };
  const { data, error } = await createCompany(supabase, { user_id: userId, name: "My Company" });
  if (error || !data) throw error ?? new Error("Failed to create company");
  return { companyId: data.id, created: true };
}
