import type { BiReport, BiScheduledReport, BiQuery } from "@/types/bi";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listBiReports(supabase: SupabaseClient, userId: string) {
  return supabase.from("bi_reports").select("*").eq("user_id", userId).order("generated_at", { ascending: false });
}

export async function createBiReport(
  supabase: SupabaseClient,
  row: Partial<BiReport> & { user_id: string; title: string; report_type: string },
) {
  return supabase
    .from("bi_reports")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      title: row.title,
      report_type: row.report_type,
      payload: row.payload ?? {},
      generated_at: row.generated_at ?? new Date().toISOString(),
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function listScheduledReports(supabase: SupabaseClient, userId: string) {
  return supabase.from("bi_scheduled_reports").select("*").eq("user_id", userId).order("created_at", { ascending: false });
}

export async function createScheduledReport(
  supabase: SupabaseClient,
  row: Partial<BiScheduledReport> & { user_id: string; title: string; frequency: BiScheduledReport["frequency"] },
) {
  return supabase
    .from("bi_scheduled_reports")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      report_id: row.report_id ?? null,
      title: row.title,
      frequency: row.frequency,
      is_active: row.is_active ?? true,
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function listQueries(supabase: SupabaseClient, userId: string) {
  return supabase.from("bi_queries").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
}

export async function saveQuery(
  supabase: SupabaseClient,
  row: Partial<BiQuery> & { user_id: string; name: string; query_text: string },
) {
  return supabase
    .from("bi_queries")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      name: row.name,
      query_text: row.query_text,
      dataset_id: row.dataset_id ?? null,
      result_cache: row.result_cache ?? {},
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}
