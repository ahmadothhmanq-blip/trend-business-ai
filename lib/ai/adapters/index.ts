import type { AIProvider, AIProviderName } from "@/lib/ai/types";
import { AnthropicAdapter } from "@/lib/ai/adapters/anthropic-adapter";
import { DeepSeekAdapter } from "@/lib/ai/adapters/deepseek-adapter";
import { OpenAIAdapter } from "@/lib/ai/adapters/openai-adapter";

export { AnthropicAdapter, createAnthropicAdapter } from "@/lib/ai/adapters/anthropic-adapter";
export { DeepSeekAdapter, createDeepSeekAdapter } from "@/lib/ai/adapters/deepseek-adapter";
export { OpenAIAdapter, createOpenAIAdapter } from "@/lib/ai/adapters/openai-adapter";

const providerCache = new Map<AIProviderName, AIProvider>();

export function getAIProvider(name: AIProviderName = "deepseek"): AIProvider {
  const cached = providerCache.get(name);
  if (cached) return cached;

  const provider =
    name === "openai"
      ? new OpenAIAdapter()
      : name === "anthropic"
        ? new AnthropicAdapter()
        : new DeepSeekAdapter();

  providerCache.set(name, provider);
  return provider;
}
