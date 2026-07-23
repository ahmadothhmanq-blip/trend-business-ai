import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import { buildAssistantPrompt, buildBusinessPlanPrompt } from "@/lib/business-manager/prompts";
import type { BusinessAssistantAction, GeneratedBusinessPlan } from "@/types/business-manager";

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

export async function generateBusinessPlan(input: {
  brief: string;
  industry?: string;
  teamSize?: string;
  timeline?: string;
}): Promise<GeneratedBusinessPlan & { provider: string }> {
  const prompt = buildBusinessPlanPrompt(input);
  const data = await generateJson<Record<string, unknown>>(prompt);
  const { provider, ...rest } = data;
  return {
    title: String(rest.title ?? "Business Plan"),
    summary: String(rest.summary ?? ""),
    objectives: Array.isArray(rest.objectives) ? rest.objectives.map(String) : [],
    recommendations: Array.isArray(rest.recommendations) ? rest.recommendations.map(String) : [],
    bottlenecks: Array.isArray(rest.bottlenecks) ? rest.bottlenecks.map(String) : [],
    actions: Array.isArray(rest.actions)
      ? (rest.actions as Array<{ title: string; priority: string; owner: string }>)
      : [],
    provider,
  };
}

export async function runBusinessAssistant(
  action: BusinessAssistantAction,
  input: { text: string; context?: string; instruction?: string },
) {
  const prompt = buildAssistantPrompt(action, input);
  return generateJson<Record<string, unknown>>(prompt);
}
