/**
 * Read-only Business Manager connector for BI.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getBusinessManagerBiData(supabase: SupabaseClient, userId: string) {
  const [projects, tasks, kpis] = await Promise.all([
    supabase.from("business_projects").select("id, name, status, progress").eq("user_id", userId).limit(20),
    supabase.from("business_tasks").select("id, status, due_date").eq("user_id", userId).limit(50),
    supabase.from("business_kpis").select("id, name, current_value, target_value, category").eq("user_id", userId).limit(20),
  ]);
  const taskRows = tasks.data ?? [];
  return {
    projects: projects.data ?? [],
    tasks: taskRows,
    kpis: kpis.data ?? [],
    completedTasks: taskRows.filter((t) => t.status === "done").length,
    totalTasks: taskRows.length,
  };
}
