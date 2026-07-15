import type { AIProvider, AIProviderName } from "@/lib/ai/types";
import {
  getActiveProvider,
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

export function listConfiguredProviders(): AIProviderName[] {
  const names: AIProviderName[] = [
    ...getAllProviderNames(),
    ...(Array.from(customFactories.keys()) as AIProviderName[]),
  ];
  return [...new Set(names)].filter((n) => isProviderConfigured(n));
}

export function resolveAvailableProvider(
  preferred?: AIProviderName,
): AIProviderName | null {
  const active = getActiveProvider();
  const target = preferred ?? active;
  if (isProviderConfigured(target)) return target;

  if (target !== active && isProviderConfigured(active)) {
    return active;
  }

  for (const reg of PROVIDER_REGISTRY) {
    if (reg.name !== target && isProviderConfigured(reg.name)) return reg.name;
  }
  for (const name of customFactories.keys()) {
    if (isProviderConfigured(name)) return name as AIProviderName;
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
