import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import type { AgentsAssistantAction } from "@/types/agents-platform";

function parseJson<T>(raw: string): T {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned) as T;
}

async function generateJson<T>(prompt: string): Promise<T & { provider: string }> {
  const providerName = getDefaultTextProvider();
  const resolved = providerManager.resolve(providerName);
  if (!resolved || !providerManager.isConfigured(resolved)) {
    throw new Error("No AI provider configured.");
  }
  const raw = await providerManager.generateText(
    { prompt, system: "Return valid JSON only.", temperature: 0.7 },
    resolved,
  );
  return { ...parseJson<T>(raw), provider: resolved };
}

const PROMPTS: Record<AgentsAssistantAction, (input: { text: string; context?: string }) => string> = {
  analyze_agent_performance: (i) => `Analyze AI agent performance and return JSON with insights, metrics, recommendations.\n\n${i.text}\n${i.context ?? ""}`,
  recommend_tools: (i) => `Recommend agent tools for this use case. Return JSON with tools array and rationale.\n\n${i.text}`,
  optimize_workflow: (i) => `Optimize this agent workflow. Return JSON with steps, improvements, risks.\n\n${i.text}\n${i.context ?? ""}`,
  summarize_executions: (i) => `Summarize agent execution history. Return JSON with summary, patterns, failures.\n\n${i.text}`,
  natural_language_query: (i) => `Answer this question about agent platform data. Return JSON with answer, evidence.\n\n${i.text}`,
};

export async function runAgentsAssistant(action: AgentsAssistantAction, input: { text: string; context?: string }) {
  const prompt = PROMPTS[action](input);
  return generateJson<Record<string, unknown>>(prompt);
}
