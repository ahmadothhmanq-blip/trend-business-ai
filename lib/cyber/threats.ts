import type { SupabaseClient } from "@supabase/supabase-js";
import type { CyberThreat, CyberIoc, CyberThreatReport } from "@/types/cyber";

export async function listThreats(supabase: SupabaseClient, userId: string) {
  return supabase.from("cyber_threats").select("*").eq("user_id", userId).order("created_at", { ascending: false });
}

export async function createThreat(supabase: SupabaseClient, row: Partial<CyberThreat> & { user_id: string; title: string }) {
  return supabase.from("cyber_threats").insert({
    user_id: row.user_id,
    organization_id: row.organization_id ?? null,
    title: row.title,
    description: row.description ?? "",
    severity: row.severity ?? "medium",
    threat_type: row.threat_type ?? "unknown",
    source: row.source ?? "internal",
    status: row.status ?? "active",
    metadata: row.metadata ?? {},
  }).select("*").single();
}

export async function listIocs(supabase: SupabaseClient, userId: string, threatId?: string) {
  let q = supabase.from("cyber_iocs").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (threatId) q = q.eq("threat_id", threatId);
  return q;
}

export async function createIoc(supabase: SupabaseClient, row: Partial<CyberIoc> & { user_id: string; ioc_type: CyberIoc["ioc_type"]; value: string }) {
  return supabase.from("cyber_iocs").insert({
    user_id: row.user_id,
    organization_id: row.organization_id ?? null,
    threat_id: row.threat_id ?? null,
    ioc_type: row.ioc_type,
    value: row.value,
    confidence: row.confidence ?? 0.5,
    is_active: row.is_active ?? true,
    metadata: row.metadata ?? {},
  }).select("*").single();
}

export async function createThreatReport(supabase: SupabaseClient, row: Partial<CyberThreatReport> & { user_id: string; title: string }) {
  return supabase.from("cyber_threat_reports").insert({
    user_id: row.user_id,
    organization_id: row.organization_id ?? null,
    title: row.title,
    summary: row.summary ?? "",
    recommendations: row.recommendations ?? [],
    payload: row.payload ?? {},
  }).select("*").single();
}
