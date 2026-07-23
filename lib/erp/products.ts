import type { ErpProduct, ErpCategory } from "@/types/erp";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listProducts(supabase: SupabaseClient, userId: string, companyId?: string) {
  let q = supabase.from("erp_products").select("*").eq("user_id", userId);
  if (companyId) q = q.eq("company_id", companyId);
  return q.order("name");
}

export async function createProduct(
  supabase: SupabaseClient,
  row: Partial<ErpProduct> & { user_id: string; company_id: string; sku: string; name: string },
) {
  return supabase
    .from("erp_products")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      company_id: row.company_id,
      category_id: row.category_id ?? null,
      sku: row.sku,
      name: row.name,
      description: row.description ?? "",
      price_cents: row.price_cents ?? 0,
      cost_cents: row.cost_cents ?? 0,
      currency: row.currency ?? "USD",
      unit: row.unit ?? "ea",
      is_active: row.is_active ?? true,
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function listCategories(supabase: SupabaseClient, userId: string, companyId?: string) {
  let q = supabase.from("erp_categories").select("*").eq("user_id", userId);
  if (companyId) q = q.eq("company_id", companyId);
  return q.order("name");
}

export async function createCategory(
  supabase: SupabaseClient,
  row: Partial<ErpCategory> & { user_id: string; company_id: string; name: string },
) {
  return supabase
    .from("erp_categories")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      company_id: row.company_id,
      name: row.name,
      description: row.description ?? "",
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}
