import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentTrigger } from "@/types/agents-platform";
import { runPlatformAgent } from "./runner";
import { runWorkflow } from "./workflows";

export async function listTriggers(supabase: SupabaseClient, userId: string) {
  return supabase.from("agent_triggers").select("*").eq("user_id", userId).order("created_at", { ascending: false });
}

export async function createTrigger(
  supabase: SupabaseClient,
  row: Partial<AgentTrigger> & { user_id: string; name: string; trigger_type: AgentTrigger["trigger_type"] },
) {
  return supabase.from("agent_triggers").insert({
    user_id: row.user_id,
    organization_id: row.organization_id ?? null,
    agent_id: row.agent_id ?? null,
    workflow_id: row.workflow_id ?? null,
    trigger_type: row.trigger_type,
    name: row.name,
    config: row.config ?? {},
    is_active: row.is_active ?? true,
    metadata: row.metadata ?? {},
  }).select("*").single();
}

export async function fireTrigger(
  supabase: SupabaseClient,
  userId: string,
  triggerId: string,
  payload: Record<string, unknown> = {},
) {
  const { data: trigger, error } = await supabase.from("agent_triggers").select("*").eq("id", triggerId).eq("user_id", userId).single();
  if (error || !trigger) throw new Error("Trigger not found");
  if (!trigger.is_active) throw new Error("Trigger is inactive");

  let result: unknown;
  if (trigger.workflow_id) {
    result = await runWorkflow(supabase, userId, trigger.workflow_id, { ...trigger.config, ...payload });
  } else if (trigger.agent_id) {
    result = await runPlatformAgent({
      supabase,
      userId,
      agentId: trigger.agent_id,
      task: String(payload.task ?? trigger.name),
      context: JSON.stringify({ ...trigger.config, ...payload }),
    });
  } else {
    throw new Error("Trigger has no agent or workflow");
  }

  await supabase.from("agent_triggers").update({
    last_fired_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", triggerId);

  return result;
}
