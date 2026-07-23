import type { SupabaseClient } from "@supabase/supabase-js";

export async function getBmProjects(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("business_projects").select("id, name, status, created_at").eq("user_id", userId).limit(30);
  return { projects: data ?? [], count: data?.length ?? 0 };
}

export async function getBmTasks(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("business_tasks").select("id, title, status, priority, due_date").eq("user_id", userId).limit(50);
  const rows = data ?? [];
  return { tasks: rows, completed: rows.filter((t) => t.status === "done").length, total: rows.length };
}

export async function getBmKpis(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("business_kpis").select("id, name, current_value, target_value, category").eq("user_id", userId).limit(20);
  return { kpis: data ?? [] };
}
