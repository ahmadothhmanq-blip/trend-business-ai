import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import { buildErpAssistantPrompt } from "@/lib/erp/prompts";
import type { ErpAssistantAction } from "@/types/erp";

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

export async function runErpAssistant(
  action: ErpAssistantAction,
  input: { text: string; context?: string },
) {
  const prompt = buildErpAssistantPrompt(action, input);
  return generateJson<Record<string, unknown>>(prompt);
}
