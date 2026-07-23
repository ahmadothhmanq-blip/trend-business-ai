import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import { aiAgentPlugin } from "@/plugins/ai-agents";
import type { AgentPluginInput, AgentOutput } from "@/plugins/ai-agents/types";
import type { TokenUsage } from "@/lib/ai/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { invokeToolsForAgent } from "./tool-registry";
import { loadMemoryForRun } from "./memory";
import { loadKnowledgeContext } from "./knowledge";
import { recordAnalyticsSnapshot } from "./analytics";
import { logAgentAudit } from "./audit";
import type { Agent } from "@/types/agents";

export type PlatformRunInput = {
  supabase?: SupabaseClient;
  userId?: string;
  task: string;
  agentType?: string;
  systemPrompt?: string;
  tools?: string[];
  context?: string;
  memory?: string[];
  maxSteps?: number;
  agentId?: string;
};

export type PlatformRunResult = {
  output: AgentOutput;
  usage: TokenUsage;
  generationTimeMs: number;
  provider: string;
  runId?: string;
  toolResults?: unknown[];
};

export async function runPlatformAgent(input: PlatformRunInput): Promise<PlatformRunResult> {
  let agent: Agent | null = null;
  let systemPrompt = input.systemPrompt ?? "You are a helpful AI agent. Complete the user's task thoroughly.";
  let tools = input.tools ?? [];
  let agentType = input.agentType ?? "custom";

  if (input.supabase && input.userId && input.agentId) {
    const { data } = await input.supabase.from("agents").select("*").eq("id", input.agentId).single();
    if (data) {
      agent = data as Agent;
      systemPrompt = agent.system_prompt || systemPrompt;
      tools = (agent.tools ?? []) as string[];
      agentType = agent.agent_type ?? agentType;
    }
  }

  let memory = input.memory ?? [];
  let knowledgeContext = "";
  let toolResults: unknown[] = [];

  if (input.supabase && input.userId) {
    if (input.agentId) {
      const mem = await loadMemoryForRun(input.supabase, input.userId, input.agentId);
      memory = [...memory, ...mem];
      const kb = await loadKnowledgeContext(input.supabase, input.userId, input.agentId);
      if (kb.length) knowledgeContext = kb.join("\n\n");
    }
    if (tools.length) {
      toolResults = await invokeToolsForAgent(tools, { supabase: input.supabase, userId: input.userId, agentId: input.agentId });
    }
  }

  const enrichedContext = [
    input.context ?? "",
    knowledgeContext ? `KNOWLEDGE:\n${knowledgeContext}` : "",
    toolResults.length ? `TOOL DATA:\n${JSON.stringify(toolResults, null, 2).slice(0, 12000)}` : "",
  ].filter(Boolean).join("\n\n");

  const pluginInput: AgentPluginInput = {
    task: input.task,
    agentType,
    systemPrompt,
    tools,
    context: enrichedContext,
    memory,
    maxSteps: input.maxSteps,
  };

  const start = Date.now();
  let runId: string | undefined;

  if (input.supabase && input.userId) {
    const { data: run } = await input.supabase.from("agent_runs").insert({
      user_id: input.userId,
      agent_id: input.agentId ?? null,
      task_name: input.task.slice(0, 100),
      status: "running",
      input: { task: input.task, context: input.context },
      metadata: { toolCount: toolResults.length },
    }).select("id").single();
    runId = run?.id;
  }

  try {
    const result = await providerManager.runPlugin(aiAgentPlugin, pluginInput, {
      provider: getDefaultTextProvider(),
    });

    if (input.supabase && input.userId && runId) {
      for (let i = 0; i < result.output.stepResults.length; i++) {
        const step = result.output.stepResults[i];
        await input.supabase.from("agent_run_steps").insert({
          user_id: input.userId,
          run_id: runId,
          step_index: i,
          step_name: step.stepName,
          step_type: "agent",
          status: "completed",
          output: { result: step.result, data: step.data },
          duration_ms: step.durationMs,
        });
      }
      await input.supabase.from("agent_runs").update({
        status: "completed",
        output: result.output as unknown as Record<string, unknown>,
        provider: result.provider,
        token_usage: result.usage,
        execution_time_ms: result.generationTimeMs,
        completed_at: new Date().toISOString(),
      }).eq("id", runId);
      await recordAnalyticsSnapshot(input.supabase, input.userId, input.agentId);
      await logAgentAudit(input.supabase, { user_id: input.userId, action: "run", entity_type: "agent", entity_id: input.agentId ?? null });
    }

    return {
      output: result.output,
      usage: result.usage,
      generationTimeMs: result.generationTimeMs,
      provider: result.provider,
      runId,
      toolResults,
    };
  } catch (e) {
    if (input.supabase && input.userId && runId) {
      await input.supabase.from("agent_runs").update({
        status: "failed",
        error_message: e instanceof Error ? e.message : "Failed",
        execution_time_ms: Date.now() - start,
        completed_at: new Date().toISOString(),
      }).eq("id", runId);
    }
    throw e;
  }
}
