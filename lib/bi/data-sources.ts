import type { SupabaseClient } from "@supabase/supabase-js";
import type { BiDataSource } from "@/types/bi";

export async function listDataSources(supabase: SupabaseClient, userId: string) {
  return supabase.from("bi_data_sources").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
}

export async function createDataSource(
  supabase: SupabaseClient,
  row: Partial<BiDataSource> & { user_id: string; name: string; source_type: BiDataSource["source_type"] },
) {
  return supabase
    .from("bi_data_sources")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      name: row.name,
      source_type: row.source_type,
      connection_config: row.connection_config ?? {},
      is_active: row.is_active ?? true,
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}
