import { providerManager } from "@/lib/ai/provider-manager";
import { aiAgentPlugin } from "@/plugins/ai-agents";
import type { AgentPluginInput, AgentOutput } from "@/plugins/ai-agents/types";
import type { TokenUsage } from "@/lib/ai/types";

export type RunAgentInput = {
  task: string;
  agentType: string;
  systemPrompt: string;
  tools: string[];
  context?: string;
  memory?: string[];
  maxSteps?: number;
};

export type AgentRunResult = {
  output: AgentOutput;
  usage: TokenUsage;
  generationTimeMs: number;
  provider: string;
};

export async function runAgent(input: RunAgentInput): Promise<AgentRunResult> {
  const pluginInput: AgentPluginInput = {
    task: input.task,
    agentType: input.agentType,
    systemPrompt: input.systemPrompt,
    tools: input.tools,
    context: input.context,
    memory: input.memory,
    maxSteps: input.maxSteps,
  };

  const result = await providerManager.runPlugin(aiAgentPlugin, pluginInput);

  return {
    output: result.output,
    usage: result.usage,
    generationTimeMs: result.generationTimeMs,
    provider: result.provider,
  };
}
