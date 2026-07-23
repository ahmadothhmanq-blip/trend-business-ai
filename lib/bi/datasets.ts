import type { BiDataset } from "@/types/bi";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listDatasets(supabase: SupabaseClient, userId: string) {
  return supabase.from("bi_datasets").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
}

export async function createDataset(
  supabase: SupabaseClient,
  row: Partial<BiDataset> & { user_id: string; name: string },
) {
  return supabase
    .from("bi_datasets")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      data_source_id: row.data_source_id ?? null,
      name: row.name,
      description: row.description ?? "",
      schema_definition: row.schema_definition ?? {},
      row_count: row.row_count ?? 0,
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}
