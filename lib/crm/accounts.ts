import type { CRMAccount } from "@/types/crm";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listAccounts(supabase: SupabaseClient, userId: string) {
  return supabase
    .from("crm_accounts")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
}

export async function createAccount(
  supabase: SupabaseClient,
  row: Partial<CRMAccount> & { user_id: string; name: string },
) {
  return supabase
    .from("crm_accounts")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      name: row.name,
      industry: row.industry ?? "",
      size: row.size ?? "",
      website: row.website ?? "",
      notes: row.notes ?? "",
      custom_fields: row.custom_fields ?? {},
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function updateAccount(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: Record<string, unknown>,
) {
  return supabase
    .from("crm_accounts")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
}
