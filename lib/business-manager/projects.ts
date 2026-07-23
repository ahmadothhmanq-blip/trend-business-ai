import type { BusinessProject, Milestone } from "@/types/business-manager";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listProjects(
  supabase: SupabaseClient,
  userId: string,
  filters?: { status?: string; organizationId?: string; teamId?: string },
) {
  let query = supabase
    .from("business_projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.organizationId) query = query.eq("organization_id", filters.organizationId);
  if (filters?.teamId) query = query.eq("team_id", filters.teamId);
  return query;
}

export async function getProject(supabase: SupabaseClient, userId: string, id: string) {
  return supabase
    .from("business_projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
}

export async function createProject(
  supabase: SupabaseClient,
  row: Partial<BusinessProject> & { user_id: string; name: string },
) {
  return supabase
    .from("business_projects")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      team_id: row.team_id ?? null,
      name: row.name,
      description: row.description ?? "",
      status: row.status ?? "draft",
      progress: row.progress ?? 0,
      start_date: row.start_date ?? null,
      end_date: row.end_date ?? null,
      owner_name: row.owner_name ?? "",
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function updateProject(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: Record<string, unknown>,
) {
  return supabase
    .from("business_projects")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
}

export async function archiveProject(supabase: SupabaseClient, userId: string, id: string) {
  return updateProject(supabase, userId, id, { status: "archived" });
}

export function computeProjectProgress(tasks: Array<{ status: string }>): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === "done").length;
  return Math.round((done / tasks.length) * 100);
}

export async function listMilestones(
  supabase: SupabaseClient,
  userId: string,
  projectId?: string,
) {
  let query = supabase
    .from("business_milestones")
    .select("*")
    .eq("user_id", userId)
    .order("target_date", { ascending: true });
  if (projectId) query = query.eq("project_id", projectId);
  return query;
}

export async function createMilestone(
  supabase: SupabaseClient,
  row: Partial<Milestone> & { user_id: string; project_id: string; title: string },
) {
  return supabase
    .from("business_milestones")
    .insert({
      user_id: row.user_id,
      project_id: row.project_id,
      title: row.title,
      description: row.description ?? "",
      status: row.status ?? "pending",
      target_date: row.target_date ?? null,
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function updateMilestone(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: Record<string, unknown>,
) {
  const updates: Record<string, unknown> = { ...patch, updated_at: new Date().toISOString() };
  if (patch.status === "completed" && !patch.completed_at) {
    updates.completed_at = new Date().toISOString();
  }
  return supabase
    .from("business_milestones")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
}
