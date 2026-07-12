import type { AIProvider, AIProviderName } from "@/lib/ai/types";
import { AnthropicAdapter } from "@/lib/ai/adapters/anthropic-adapter";
import { DeepSeekAdapter } from "@/lib/ai/adapters/deepseek-adapter";
import { OpenAIAdapter } from "@/lib/ai/adapters/openai-adapter";

export { AnthropicAdapter, createAnthropicAdapter } from "@/lib/ai/adapters/anthropic-adapter";
export { DeepSeekAdapter, createDeepSeekAdapter } from "@/lib/ai/adapters/deepseek-adapter";
export { OpenAIAdapter, createOpenAIAdapter } from "@/lib/ai/adapters/openai-adapter";

const providerCache = new Map<string, AIProvider>();
const customFactories = new Map<string, () => AIProvider>();

const BUILTIN_PROVIDERS: AIProviderName[] = ["deepseek", "openai", "anthropic"];

function createBuiltinProvider(name: AIProviderName): AIProvider {
  if (name === "openai") return new OpenAIAdapter();
  if (name === "anthropic") return new AnthropicAdapter();
  return new DeepSeekAdapter();
}

/** Register a future provider without changing call sites. */
export function registerAIProvider(name: string, factory: () => AIProvider) {
  customFactories.set(name, factory);
  providerCache.delete(name);
}

export function isProviderConfigured(name: string) {
  if (name === "openai") return Boolean(process.env.OPENAI_API_KEY?.trim());
  if (name === "anthropic") return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
  if (name === "deepseek") return Boolean(process.env.DEEPSEEK_API_KEY?.trim());
  return customFactories.has(name);
}

export function listConfiguredProviders(): AIProviderName[] {
  const names = [
    ...BUILTIN_PROVIDERS,
    ...Array.from(customFactories.keys()),
  ] as AIProviderName[];
  return names.filter((name) => isProviderConfigured(name));
}

/** Prefer requested provider, then DeepSeek → OpenAI → Anthropic → custom. */
export function resolveAvailableProvider(
  preferred: AIProviderName = "deepseek",
): AIProviderName | null {
  if (isProviderConfigured(preferred)) return preferred;
  const fallbackOrder: AIProviderName[] = [
    "deepseek",
    "openai",
    "anthropic",
    ...Array.from(customFactories.keys()),
  ];
  for (const name of fallbackOrder) {
    if (name !== preferred && isProviderConfigured(name)) return name;
  }
  return null;
}

export function getAIProvider(name: AIProviderName = "deepseek"): AIProvider {
  const cached = providerCache.get(name);
  if (cached) return cached;

  const custom = customFactories.get(name);
  const provider = custom ? custom() : createBuiltinProvider(name);
  providerCache.set(name, provider);
  return provider;
}
