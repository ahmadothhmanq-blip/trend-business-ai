import type { CRMTask } from "@/types/crm";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listTasks(supabase: SupabaseClient, userId: string, status?: string) {
  let q = supabase
    .from("crm_tasks")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true, nullsFirst: false });
  if (status) q = q.eq("status", status);
  return q;
}

export async function createTask(
  supabase: SupabaseClient,
  row: Partial<CRMTask> & { user_id: string; title: string },
) {
  return supabase
    .from("crm_tasks")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      contact_id: row.contact_id ?? null,
      deal_id: row.deal_id ?? null,
      account_id: row.account_id ?? null,
      title: row.title,
      description: row.description ?? "",
      status: row.status ?? "todo",
      priority: row.priority ?? "medium",
      assignee_name: row.assignee_name ?? "",
      assignee_email: row.assignee_email ?? "",
      due_date: row.due_date ?? null,
      reminder_at: row.reminder_at ?? null,
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
    .from("crm_tasks")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
}
