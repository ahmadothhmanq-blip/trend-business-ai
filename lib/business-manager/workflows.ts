import type { Workflow } from "@/types/business-manager";
import type { SupabaseClient } from "@supabase/supabase-js";

export const WORKFLOW_STEP_TYPES = [
  "task",
  "approval",
  "notification",
  "document",
  "review",
] as const;

export async function listWorkflows(
  supabase: SupabaseClient,
  userId: string,
  filters?: { organizationId?: string; projectId?: string },
) {
  let query = supabase
    .from("business_workflows")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (filters?.organizationId) query = query.eq("organization_id", filters.organizationId);
  if (filters?.projectId) query = query.eq("project_id", filters.projectId);
  return query;
}

export async function createWorkflow(
  supabase: SupabaseClient,
  row: Partial<Workflow> & { user_id: string; name: string },
) {
  return supabase
    .from("business_workflows")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      project_id: row.project_id ?? null,
      name: row.name,
      description: row.description ?? "",
      status: row.status ?? "draft",
      steps: row.steps ?? [],
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function updateWorkflow(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: Record<string, unknown>,
) {
  return supabase
    .from("business_workflows")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
}

export function defaultOnboardingWorkflow(): Workflow["steps"] {
  return [
    { id: "step-1", label: "Define scope", type: "task", config: {} },
    { id: "step-2", label: "Manager approval", type: "approval", config: { role: "manager" } },
    { id: "step-3", label: "Assign team", type: "task", config: {} },
    { id: "step-4", label: "Kickoff notification", type: "notification", config: {} },
  ];
}
