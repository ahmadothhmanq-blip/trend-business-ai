import type { AIProvider, AIProviderName } from "@/lib/ai/types";
import {
  getActiveProvider,
  getDefaultTextProvider,
  PROVIDER_REGISTRY,
  getProviderEnvKey,
  getAllProviderNames,
} from "@/lib/ai/provider-config";
import { AnthropicAdapter } from "@/lib/ai/adapters/anthropic-adapter";
import { DeepSeekAdapter } from "@/lib/ai/adapters/deepseek-adapter";
import { GeminiAdapter } from "@/lib/ai/adapters/gemini-adapter";
import { GrokAdapter } from "@/lib/ai/adapters/grok-adapter";
import { LlamaAdapter } from "@/lib/ai/adapters/llama-adapter";
import { OpenAIAdapter } from "@/lib/ai/adapters/openai-adapter";

export { AnthropicAdapter, createAnthropicAdapter } from "@/lib/ai/adapters/anthropic-adapter";
export { DeepSeekAdapter, createDeepSeekAdapter } from "@/lib/ai/adapters/deepseek-adapter";
export { GeminiAdapter, createGeminiAdapter } from "@/lib/ai/adapters/gemini-adapter";
export { GrokAdapter, createGrokAdapter } from "@/lib/ai/adapters/grok-adapter";
export { LlamaAdapter, createLlamaAdapter } from "@/lib/ai/adapters/llama-adapter";
export { OpenAIAdapter, createOpenAIAdapter } from "@/lib/ai/adapters/openai-adapter";

const providerCache = new Map<string, AIProvider>();
const customFactories = new Map<string, () => AIProvider>();

function createBuiltinProvider(name: AIProviderName): AIProvider {
  switch (name) {
    case "openai": return new OpenAIAdapter();
    case "claude": return new AnthropicAdapter();
    case "gemini": return new GeminiAdapter();
    case "grok": return new GrokAdapter();
    case "llama": return new LlamaAdapter();
    default: return new DeepSeekAdapter();
  }
}

export function registerAIProvider(name: string, factory: () => AIProvider) {
  customFactories.set(name, factory);
  providerCache.delete(name);
}

export function isProviderConfigured(name: string): boolean {
  const envKey = getProviderEnvKey(name as AIProviderName);
  if (envKey) return Boolean(process.env[envKey]?.trim());
  return customFactories.has(name);
}

/** True when the adapter is a real implementation (not a stub). */
export function isProviderImplemented(name: string): boolean {
  const reg = PROVIDER_REGISTRY.find((r) => r.name === name);
  if (reg) return reg.status === "active";
  return customFactories.has(name);
}

export function listConfiguredProviders(): AIProviderName[] {
  const names: AIProviderName[] = [
    ...getAllProviderNames(),
    ...(Array.from(customFactories.keys()) as AIProviderName[]),
  ];
  return [...new Set(names)].filter(
    (n) => isProviderConfigured(n) && isProviderImplemented(n),
  );
}

export function resolveAvailableProvider(
  preferred?: AIProviderName,
): AIProviderName | null {
  const defaultText = getDefaultTextProvider();
  const active = getActiveProvider();
  // Prefer explicit request → DeepSeek system default → user active → other configured providers.
  const candidates: AIProviderName[] = [];
  const push = (name: AIProviderName | undefined) => {
    if (name && !candidates.includes(name)) candidates.push(name);
  };
  push(preferred);
  push(defaultText);
  push(active);
  for (const reg of PROVIDER_REGISTRY) {
    if (reg.status === "active") push(reg.name);
  }
  for (const name of customFactories.keys()) {
    push(name as AIProviderName);
  }

  for (const name of candidates) {
    if (isProviderConfigured(name) && isProviderImplemented(name)) {
      return name;
    }
  }
  return null;
}

export function getAIProvider(name?: AIProviderName): AIProvider {
  const providerName = name ?? getActiveProvider();
  const cached = providerCache.get(providerName);
  if (cached) return cached;

  const custom = customFactories.get(providerName);
  const provider = custom ? custom() : createBuiltinProvider(providerName);
  providerCache.set(providerName, provider);
  return provider;
}
