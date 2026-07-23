import type { Organization } from "@/types/business-manager";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listOrganizations(supabase: SupabaseClient, userId: string) {
  return supabase
    .from("business_organizations")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
}

export async function getOrganization(supabase: SupabaseClient, userId: string, id: string) {
  return supabase
    .from("business_organizations")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
}

export async function createOrganization(
  supabase: SupabaseClient,
  row: Partial<Organization> & { user_id: string; name: string },
) {
  return supabase
    .from("business_organizations")
    .insert({
      user_id: row.user_id,
      name: row.name,
      description: row.description ?? "",
      industry: row.industry ?? "",
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function updateOrganization(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: Record<string, unknown>,
) {
  return supabase
    .from("business_organizations")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
}

export async function listDepartments(
  supabase: SupabaseClient,
  userId: string,
  organizationId?: string,
) {
  let query = supabase
    .from("business_departments")
    .select("*")
    .eq("user_id", userId)
    .order("name");
  if (organizationId) query = query.eq("organization_id", organizationId);
  return query;
}

export async function createDepartment(
  supabase: SupabaseClient,
  row: { user_id: string; organization_id: string; name: string; description?: string },
) {
  return supabase
    .from("business_departments")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id,
      name: row.name,
      description: row.description ?? "",
    })
    .select("*")
    .single();
}
