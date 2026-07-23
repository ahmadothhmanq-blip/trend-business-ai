import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentWorkflow, WorkflowStep } from "@/types/agents";
import { runPlatformAgent } from "./runner";
import { invokeTool } from "./tool-registry";
import { logAgentAudit } from "./audit";

export type WorkflowRunResult = {
  workflowRunId: string | null;
  status: "completed" | "failed";
  stepsLog: Record<string, unknown>[];
  executionTimeMs: number;
  error?: string;
};

function getNextSteps(step: WorkflowStep, allSteps: WorkflowStep[]): WorkflowStep[] {
  if (step.next_steps?.length) {
    return allSteps.filter((s) => step.next_steps.includes(s.id));
  }
  const idx = allSteps.findIndex((s) => s.id === step.id);
  return idx >= 0 && idx < allSteps.length - 1 ? [allSteps[idx + 1]] : [];
}

export async function runWorkflow(
  supabase: SupabaseClient,
  userId: string,
  workflowId: string,
  input: Record<string, unknown> = {},
): Promise<WorkflowRunResult> {
  const start = Date.now();
  const { data: workflow, error } = await supabase.from("agent_workflows").select("*").eq("id", workflowId).eq("user_id", userId).single();
  if (error || !workflow) throw new Error("Workflow not found");

  const wf = workflow as AgentWorkflow;
  const steps = (wf.steps ?? []) as WorkflowStep[];
  const stepsLog: Record<string, unknown>[] = [];

  const { data: wfRun } = await supabase.from("agent_workflow_runs").insert({
    user_id: userId,
    workflow_id: workflowId,
    status: "running",
    steps_log: [],
    metadata: { input },
  }).select("id").single();

  let variables: Record<string, unknown> = { ...input, ...(wf.variables ?? {}) };
  let failed = false;
  let lastError: string | undefined;

  const runStep = async (step: WorkflowStep, depth = 0): Promise<void> => {
    if (depth > 50) throw new Error("Workflow depth exceeded");
    const stepStart = Date.now();
    const log: Record<string, unknown> = { stepId: step.id, stepName: step.name, type: step.type, status: "running" };

    try {
      switch (step.type) {
        case "agent": {
          const task = String(step.config.task ?? variables.task ?? "Execute workflow step");
          const agentId = step.agent_id ?? (step.config.agentId as string | undefined);
          const result = await runPlatformAgent({
            supabase,
            userId,
            task,
            agentId,
            context: JSON.stringify(variables).slice(0, 8000),
            maxSteps: Number(step.config.maxSteps ?? 4),
          });
          variables[step.output_key || step.id] = result.output;
          log.output = result.output.title;
          log.status = "completed";
          break;
        }
        case "condition": {
          const expr = String(step.config.expression ?? "true");
          const pass = expr === "true" || Boolean(variables[expr]);
          log.result = pass;
          log.status = "completed";
          if (!pass) return;
          break;
        }
        case "delay": {
          const ms = Math.min(Number(step.config.ms ?? 0), 5000);
          if (ms > 0) await new Promise((r) => setTimeout(r, ms));
          log.status = "completed";
          break;
        }
        case "transform": {
          const map = (step.config.map ?? {}) as Record<string, string>;
          for (const [k, v] of Object.entries(map)) {
            variables[k] = variables[v];
          }
          log.status = "completed";
          break;
        }
        case "notification": {
          log.message = String(step.config.message ?? "Notification");
          log.status = "completed";
          break;
        }
        case "service": {
          const toolKey = step.service ?? String(step.config.toolKey ?? "");
          const toolResult = await invokeTool(toolKey, { supabase, userId, args: variables });
          variables[step.output_key || step.id] = toolResult.data;
          log.toolResult = toolResult;
          log.status = toolResult.success ? "completed" : "failed";
          if (!toolResult.success) throw new Error(toolResult.error ?? "Service step failed");
          break;
        }
        default:
          log.status = "skipped";
      }
      log.durationMs = Date.now() - stepStart;
      stepsLog.push(log);

      for (const next of getNextSteps(step, steps)) {
        await runStep(next, depth + 1);
      }
    } catch (e) {
      log.status = "failed";
      log.error = e instanceof Error ? e.message : "Step failed";
      log.durationMs = Date.now() - stepStart;
      stepsLog.push(log);
      if (step.on_error === "skip") return;
      if (step.on_error === "retry" && step.max_retries > 0) {
        for (let i = 0; i < step.max_retries; i++) {
          try {
            await runStep({ ...step, on_error: "stop", max_retries: 0 }, depth);
            return;
          } catch { /* retry */ }
        }
      }
      failed = true;
      lastError = log.error as string;
      throw e;
    }
  };

  try {
    if (steps[0]) await runStep(steps[0]);
    const status = failed ? "failed" : "completed";
    if (wfRun?.id) {
      await supabase.from("agent_workflow_runs").update({
        status,
        steps_log: stepsLog,
        execution_time_ms: Date.now() - start,
        completed_at: new Date().toISOString(),
        error_message: lastError ?? null,
      }).eq("id", wfRun.id);
    }
    await supabase.from("agent_workflows").update({
      total_runs: (wf.total_runs ?? 0) + 1,
      last_run_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", workflowId);
    await logAgentAudit(supabase, { user_id: userId, action: "run", entity_type: "workflow", entity_id: workflowId });
    return { workflowRunId: wfRun?.id ?? null, status: failed ? "failed" : "completed", stepsLog, executionTimeMs: Date.now() - start, error: lastError };
  } catch (e) {
    if (wfRun?.id) {
      await supabase.from("agent_workflow_runs").update({
        status: "failed",
        steps_log: stepsLog,
        execution_time_ms: Date.now() - start,
        completed_at: new Date().toISOString(),
        error_message: e instanceof Error ? e.message : "Failed",
      }).eq("id", wfRun.id);
    }
    return { workflowRunId: wfRun?.id ?? null, status: "failed", stepsLog, executionTimeMs: Date.now() - start, error: e instanceof Error ? e.message : "Failed" };
  }
}
