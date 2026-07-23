import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentSchedule } from "@/types/agents-platform";
import { runPlatformAgent } from "./runner";
import { runWorkflow } from "./workflows";

export async function listSchedules(supabase: SupabaseClient, userId: string) {
  return supabase.from("agent_schedules").select("*").eq("user_id", userId).order("created_at", { ascending: false });
}

export async function createSchedule(
  supabase: SupabaseClient,
  row: Partial<AgentSchedule> & { user_id: string; name: string; cron_expression: string },
) {
  return supabase.from("agent_schedules").insert({
    user_id: row.user_id,
    organization_id: row.organization_id ?? null,
    agent_id: row.agent_id ?? null,
    workflow_id: row.workflow_id ?? null,
    name: row.name,
    cron_expression: row.cron_expression,
    input: row.input ?? {},
    is_active: row.is_active ?? true,
    next_run_at: row.next_run_at ?? new Date().toISOString(),
    metadata: row.metadata ?? {},
  }).select("*").single();
}

export async function executeDueSchedules(supabase: SupabaseClient, userId: string) {
  const now = new Date().toISOString();
  const { data: due } = await supabase.from("agent_schedules").select("*").eq("user_id", userId).eq("is_active", true).lte("next_run_at", now).limit(10);
  const results = [];
  for (const sched of due ?? []) {
    try {
      if (sched.workflow_id) {
        await runWorkflow(supabase, userId, sched.workflow_id, sched.input ?? {});
      } else if (sched.agent_id) {
        await runPlatformAgent({
          supabase,
          userId,
          agentId: sched.agent_id,
          task: String((sched.input as Record<string, unknown>)?.task ?? sched.name),
          context: JSON.stringify(sched.input ?? {}),
        });
      }
      await supabase.from("agent_schedules").update({
        last_run_at: now,
        next_run_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        total_runs: (sched.total_runs ?? 0) + 1,
        updated_at: now,
      }).eq("id", sched.id);
      results.push({ scheduleId: sched.id, status: "completed" });
    } catch (e) {
      results.push({ scheduleId: sched.id, status: "failed", error: e instanceof Error ? e.message : "Failed" });
    }
  }
  return results;
}
