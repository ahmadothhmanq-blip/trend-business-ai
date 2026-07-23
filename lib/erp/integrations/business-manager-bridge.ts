/**
 * Read-only Business Manager bridge for ERP operations.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export async function getBusinessManagerBridge(supabase: SupabaseClient, userId: string) {
  const [projects, tasks] = await Promise.all([
    supabase
      .from("business_projects")
      .select("id, name, status, progress")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("business_tasks")
      .select("id, title, status, due_date")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(10),
  ]);
  return {
    projects: projects.data ?? [],
    tasks: tasks.data ?? [],
    projectCount: projects.data?.length ?? 0,
    taskCount: tasks.data?.length ?? 0,
  };
}
