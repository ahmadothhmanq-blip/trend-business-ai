import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import { aiAgentPlugin } from "@/plugins/ai-agents";
import type { AgentPluginInput, AgentOutput } from "@/plugins/ai-agents/types";
import type { TokenUsage } from "@/lib/ai/types";
import { runPlatformAgent } from "@/lib/agents/runner";

export type RunAgentInput = {
  task: string;
  agentType: string;
  systemPrompt: string;
  tools: string[];
  context?: string;
  memory?: string[];
  maxSteps?: number;
  supabase?: import("@supabase/supabase-js").SupabaseClient;
  userId?: string;
  agentId?: string;
};

export type AgentRunResult = {
  output: AgentOutput;
  usage: TokenUsage;
  generationTimeMs: number;
  provider: string;
};

/** Legacy entry point — delegates to platform runner when supabase/userId provided. */
export async function runAgent(input: RunAgentInput): Promise<AgentRunResult> {
  if (input.supabase && input.userId) {
    const result = await runPlatformAgent({
      supabase: input.supabase,
      userId: input.userId,
      agentId: input.agentId,
      task: input.task,
      agentType: input.agentType,
      systemPrompt: input.systemPrompt,
      tools: input.tools,
      context: input.context,
      memory: input.memory,
      maxSteps: input.maxSteps,
    });
    return {
      output: result.output,
      usage: result.usage,
      generationTimeMs: result.generationTimeMs,
      provider: result.provider,
    };
  }

  const pluginInput: AgentPluginInput = {
    task: input.task,
    agentType: input.agentType,
    systemPrompt: input.systemPrompt,
    tools: input.tools,
    context: input.context,
    memory: input.memory,
    maxSteps: input.maxSteps,
  };

  const result = await providerManager.runPlugin(aiAgentPlugin, pluginInput, {
    provider: getDefaultTextProvider(),
  });

  return {
    output: result.output,
    usage: result.usage,
    generationTimeMs: result.generationTimeMs,
    provider: result.provider,
  };
}
