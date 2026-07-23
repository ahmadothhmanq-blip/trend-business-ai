import type { Task, TaskPriority, TaskStatus } from "@/types/business-manager";
import type { SupabaseClient } from "@supabase/supabase-js";

export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "review", "done", "blocked"];
export const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

export async function listTasks(
  supabase: SupabaseClient,
  userId: string,
  filters?: { projectId?: string; status?: string; organizationId?: string },
) {
  let query = supabase
    .from("business_tasks")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true, nullsFirst: false });
  if (filters?.projectId) query = query.eq("project_id", filters.projectId);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.organizationId) query = query.eq("organization_id", filters.organizationId);
  return query;
}

export async function getTask(supabase: SupabaseClient, userId: string, id: string) {
  return supabase
    .from("business_tasks")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
}

export async function createTask(
  supabase: SupabaseClient,
  row: Partial<Task> & { user_id: string; title: string },
) {
  return supabase
    .from("business_tasks")
    .insert({
      user_id: row.user_id,
      project_id: row.project_id ?? null,
      organization_id: row.organization_id ?? null,
      title: row.title,
      description: row.description ?? "",
      status: row.status ?? "todo",
      priority: row.priority ?? "medium",
      assignee_name: row.assignee_name ?? "",
      assignee_email: row.assignee_email ?? "",
      due_date: row.due_date ?? null,
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function updateTask(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: Record<string, unknown>,
) {
  const updates: Record<string, unknown> = { ...patch, updated_at: new Date().toISOString() };
  if (patch.status === "done" && !patch.completed_at) {
    updates.completed_at = new Date().toISOString();
  }
  return supabase
    .from("business_tasks")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
}

export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const groups = Object.fromEntries(TASK_STATUSES.map((s) => [s, [] as Task[]])) as Record<
    TaskStatus,
    Task[]
  >;
  for (const task of tasks) {
    const status = TASK_STATUSES.includes(task.status) ? task.status : "todo";
    groups[status].push(task);
  }
  return groups;
}
