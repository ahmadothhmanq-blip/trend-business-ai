import type { AIProvider } from "@/lib/ai/types";
import type { MasterPlanContentLlmRequest } from "@/lib/ai-core/generation-engine/master-plan/llm-request-builder";
import type { StructuredContentResult } from "@/lib/ai-core/generation-engine/integration/types";

export type ContentProviderRequest = MasterPlanContentLlmRequest;

export type ContentProviderResponse = {
  content: string;
  model: string;
};

/**
 * Provider-independent content interface.
 * Builder never talks to DeepSeek/OpenAI/Gemini/Claude/Grok directly.
 */
export type ContentProvider = {
  executeContent(request: ContentProviderRequest): Promise<ContentProviderResponse>;
};

export function parseStructuredContent(
  response: ContentProviderResponse,
): StructuredContentResult | null {
  try {
    const cleaned = response.content
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    const data = JSON.parse(cleaned) as StructuredContentResult;
    if (!data.masterPlanId || !Array.isArray(data.content)) return null;
    return data;
  } catch {
    return null;
  }
}

/** Bridge AIProvider → ContentProvider (provider name hidden from builder). */
export function createContentProviderFromAiProvider(provider: AIProvider): ContentProvider {
  return {
    async executeContent(request) {
      if (!provider.generateText) {
        throw new Error("Content provider does not support text generation");
      }
      const content = await provider.generateText({
        prompt: request.userPrompt,
        system: request.systemPrompt,
        temperature: request.temperature,
      });
      return {
        content,
        model: provider.getModelName(),
      };
    },
  };
}
