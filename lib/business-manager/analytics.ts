import type { KPI } from "@/types/business-manager";
import type { SupabaseClient } from "@supabase/supabase-js";

export type BusinessAnalyticsSummary = {
  totalProjects: number;
  activeProjects: number;
  archivedProjects: number;
  avgProjectProgress: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  taskCompletionRate: number;
  totalTeams: number;
  totalOrganizations: number;
  pendingApprovals: number;
  activeWorkflows: number;
  kpiOnTrack: number;
  kpiOffTrack: number;
};

export function summarizeBusinessData(input: {
  projects: Array<{ status: string; progress: number }>;
  tasks: Array<{ status: string; due_date: string | null }>;
  teams: unknown[];
  organizations: unknown[];
  approvals: Array<{ status: string }>;
  workflows: Array<{ status: string }>;
  kpis: Array<{ target_value: number; current_value: number }>;
}): BusinessAnalyticsSummary {
  const now = Date.now();
  const totalProjects = input.projects.length;
  const activeProjects = input.projects.filter((p) => p.status === "active").length;
  const archivedProjects = input.projects.filter((p) => p.status === "archived").length;
  const avgProjectProgress =
    totalProjects > 0
      ? Math.round(
          input.projects.reduce((s, p) => s + (p.progress ?? 0), 0) / totalProjects,
        )
      : 0;

  const totalTasks = input.tasks.length;
  const completedTasks = input.tasks.filter((t) => t.status === "done").length;
  const overdueTasks = input.tasks.filter(
    (t) =>
      t.due_date &&
      t.status !== "done" &&
      new Date(t.due_date).getTime() < now,
  ).length;
  const taskCompletionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const pendingApprovals = input.approvals.filter((a) => a.status === "pending").length;
  const activeWorkflows = input.workflows.filter((w) => w.status === "active").length;

  let kpiOnTrack = 0;
  let kpiOffTrack = 0;
  for (const k of input.kpis) {
    const target = Number(k.target_value);
    const current = Number(k.current_value);
    if (target <= 0 || current >= target * 0.8) kpiOnTrack++;
    else kpiOffTrack++;
  }

  return {
    totalProjects,
    activeProjects,
    archivedProjects,
    avgProjectProgress,
    totalTasks,
    completedTasks,
    overdueTasks,
    taskCompletionRate,
    totalTeams: input.teams.length,
    totalOrganizations: input.organizations.length,
    pendingApprovals,
    activeWorkflows,
    kpiOnTrack,
    kpiOffTrack,
  };
}

export async function getBusinessAnalytics(supabase: SupabaseClient, userId: string) {
  const [projects, tasks, teams, organizations, approvals, workflows, kpis] =
    await Promise.all([
      supabase.from("business_projects").select("status, progress").eq("user_id", userId),
      supabase.from("business_tasks").select("status, due_date").eq("user_id", userId),
      supabase.from("business_teams").select("id").eq("user_id", userId),
      supabase.from("business_organizations").select("id").eq("user_id", userId),
      supabase.from("business_approvals").select("status").eq("user_id", userId),
      supabase.from("business_workflows").select("status").eq("user_id", userId),
      supabase.from("business_kpis").select("target_value, current_value").eq("user_id", userId),
    ]);

  const summary = summarizeBusinessData({
    projects: projects.data ?? [],
    tasks: tasks.data ?? [],
    teams: teams.data ?? [],
    organizations: organizations.data ?? [],
    approvals: approvals.data ?? [],
    workflows: workflows.data ?? [],
    kpis: kpis.data ?? [],
  });

  return { summary, error: projects.error ?? tasks.error };
}

export async function listKpis(
  supabase: SupabaseClient,
  userId: string,
  filters?: { organizationId?: string; projectId?: string },
) {
  let query = supabase
    .from("business_kpis")
    .select("*")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: false });
  if (filters?.organizationId) query = query.eq("organization_id", filters.organizationId);
  if (filters?.projectId) query = query.eq("project_id", filters.projectId);
  return query;
}

export async function createKpi(
  supabase: SupabaseClient,
  row: Partial<KPI> & { user_id: string; name: string },
) {
  return supabase
    .from("business_kpis")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      project_id: row.project_id ?? null,
      name: row.name,
      category: row.category ?? "general",
      target_value: row.target_value ?? 0,
      current_value: row.current_value ?? 0,
      unit: row.unit ?? "%",
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function updateKpi(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: Record<string, unknown>,
) {
  return supabase
    .from("business_kpis")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
}
