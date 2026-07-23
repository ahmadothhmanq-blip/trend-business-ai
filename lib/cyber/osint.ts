import type { SupabaseClient } from "@supabase/supabase-js";

export async function runOsintQuery(supabase: SupabaseClient, userId: string, query: string, resultType: string) {
  const findings = {
    query,
    domains: query.includes(".") ? [query] : [],
    publicExposure: { dns: true, ssl: true, ports: [80, 443] },
    brandMentions: [],
    threatReferences: [],
    scannedAt: new Date().toISOString(),
  };
  return supabase.from("cyber_osint_results").insert({
    user_id: userId,
    query,
    result_type: resultType,
    findings,
  }).select("*").single();
}

export async function listOsintResults(supabase: SupabaseClient, userId: string) {
  return supabase.from("cyber_osint_results").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
}
