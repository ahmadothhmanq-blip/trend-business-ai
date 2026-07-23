import type { Approval } from "@/types/business-manager";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listApprovals(
  supabase: SupabaseClient,
  userId: string,
  filters?: { status?: string; projectId?: string },
) {
  let query = supabase
    .from("business_approvals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.projectId) query = query.eq("project_id", filters.projectId);
  return query;
}

export async function createApproval(
  supabase: SupabaseClient,
  row: Partial<Approval> & { user_id: string; title: string },
) {
  return supabase
    .from("business_approvals")
    .insert({
      user_id: row.user_id,
      workflow_id: row.workflow_id ?? null,
      project_id: row.project_id ?? null,
      title: row.title,
      description: row.description ?? "",
      status: row.status ?? "pending",
      requester_name: row.requester_name ?? "",
      reviewer_name: row.reviewer_name ?? "",
      reviewer_email: row.reviewer_email ?? "",
      notes: row.notes ?? "",
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function updateApproval(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: Record<string, unknown>,
) {
  const updates: Record<string, unknown> = { ...patch, updated_at: new Date().toISOString() };
  if (
    (patch.status === "approved" || patch.status === "rejected") &&
    !patch.reviewed_at
  ) {
    updates.reviewed_at = new Date().toISOString();
  }
  return supabase
    .from("business_approvals")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
}
