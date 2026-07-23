import type { SupabaseClient } from "@supabase/supabase-js";

export async function listReports(supabase: SupabaseClient, userId: string) {
  return supabase.from("cyber_threat_reports").select("*").eq("user_id", userId).order("generated_at", { ascending: false });
}
