import type { SupabaseClient } from "@supabase/supabase-js";
import type { CyberIncident, CyberCase, CyberPlaybook, CyberCaseEvent } from "@/types/cyber";

export async function listIncidents(supabase: SupabaseClient, userId: string) {
  return supabase.from("cyber_incidents").select("*").eq("user_id", userId).order("created_at", { ascending: false });
}

export async function createIncident(supabase: SupabaseClient, row: Partial<CyberIncident> & { user_id: string; title: string }) {
  return supabase.from("cyber_incidents").insert({
    user_id: row.user_id,
    organization_id: row.organization_id ?? null,
    title: row.title,
    description: row.description ?? "",
    severity: row.severity ?? "high",
    status: row.status ?? "open",
    assigned_to: row.assigned_to ?? null,
    detected_at: row.detected_at ?? new Date().toISOString(),
    metadata: row.metadata ?? {},
  }).select("*").single();
}

export async function updateIncident(supabase: SupabaseClient, userId: string, id: string, updates: Partial<CyberIncident>) {
  const patch: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
  if (updates.status === "resolved" || updates.status === "closed") patch.resolved_at = new Date().toISOString();
  return supabase.from("cyber_incidents").update(patch).eq("id", id).eq("user_id", userId).select("*").single();
}

export async function listCases(supabase: SupabaseClient, userId: string) {
  return supabase.from("cyber_cases").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
}

export async function createCase(supabase: SupabaseClient, row: Partial<CyberCase> & { user_id: string; title: string }) {
  const { data: c } = await supabase.from("cyber_cases").insert({
    user_id: row.user_id,
    organization_id: row.organization_id ?? null,
    incident_id: row.incident_id ?? null,
    title: row.title,
    status: row.status ?? "open",
    priority: row.priority ?? "medium",
    assignee: row.assignee ?? null,
    metadata: row.metadata ?? {},
  }).select("*").single();
  if (c) {
    await addCaseEvent(supabase, { user_id: row.user_id, case_id: c.id, event_type: "created", content: "Case opened" });
  }
  return { data: c, error: null };
}

export async function addCaseEvent(supabase: SupabaseClient, row: Partial<CyberCaseEvent> & { user_id: string; case_id: string; content: string }) {
  return supabase.from("cyber_case_events").insert({
    user_id: row.user_id,
    case_id: row.case_id,
    event_type: row.event_type ?? "note",
    content: row.content,
    metadata: row.metadata ?? {},
  }).select("*").single();
}

export async function listCaseEvents(supabase: SupabaseClient, userId: string, caseId: string) {
  return supabase.from("cyber_case_events").select("*").eq("user_id", userId).eq("case_id", caseId).order("created_at");
}

export async function listPlaybooks(supabase: SupabaseClient, userId: string) {
  return supabase.from("cyber_playbooks").select("*").eq("user_id", userId);
}

export async function createPlaybook(supabase: SupabaseClient, row: Partial<CyberPlaybook> & { user_id: string; name: string }) {
  return supabase.from("cyber_playbooks").insert({
    user_id: row.user_id,
    organization_id: row.organization_id ?? null,
    name: row.name,
    description: row.description ?? "",
    steps: row.steps ?? [],
    trigger_type: row.trigger_type ?? "manual",
    is_active: row.is_active ?? true,
    metadata: row.metadata ?? {},
  }).select("*").single();
}
