import type { AIProviderName } from "@/lib/ai/types";

export type ProviderRegistration = {
  name: AIProviderName;
  label: string;
  envKey: string;
  status: "active" | "placeholder";
};

const DEFAULT_PROVIDER: AIProviderName = "deepseek";

let _dynamicProvider: AIProviderName | null = null;

/**
 * Returns the active AI provider.
 * Dynamically overridden when user settings are loaded from Supabase;
 * falls back to DEFAULT_PROVIDER ("deepseek") when no override is set.
 */
export function getActiveProvider(): AIProviderName {
  return _dynamicProvider ?? DEFAULT_PROVIDER;
}

/** Called by ProviderManager when loading user settings from the database. */
export function setActiveProvider(name: AIProviderName) {
  _dynamicProvider = name;
}

/**
 * @deprecated Use getActiveProvider() instead for dynamic resolution.
 * Kept for backward-compatible static imports during the transition.
 */
export const ACTIVE_PROVIDER: AIProviderName = DEFAULT_PROVIDER;

export const PROVIDER_REGISTRY: ProviderRegistration[] = [
  { name: "deepseek", label: "DeepSeek", envKey: "DEEPSEEK_API_KEY", status: "active" },
  { name: "openai", label: "OpenAI", envKey: "OPENAI_API_KEY", status: "active" },
  { name: "claude", label: "Anthropic Claude", envKey: "ANTHROPIC_API_KEY", status: "active" },
  { name: "gemini", label: "Google Gemini", envKey: "GEMINI_API_KEY", status: "placeholder" },
  { name: "grok", label: "xAI Grok", envKey: "GROK_API_KEY", status: "placeholder" },
  { name: "llama", label: "Meta Llama", envKey: "LLAMA_API_KEY", status: "placeholder" },
];

export function getProviderEnvKey(name: AIProviderName): string | undefined {
  return PROVIDER_REGISTRY.find((p) => p.name === name)?.envKey;
}

export function getProviderLabel(name: AIProviderName): string {
  return PROVIDER_REGISTRY.find((p) => p.name === name)?.label ?? name;
}

export function getAllProviderNames(): AIProviderName[] {
  return PROVIDER_REGISTRY.map((p) => p.name);
}

export function isPlaceholderProvider(name: string): boolean {
  return PROVIDER_REGISTRY.find((p) => p.name === name)?.status === "placeholder";
}

/** Placeholder adapters stay visible in local/dev; hidden in production builds (M02 / D-009). */
export function shouldExposePlaceholderProviders(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function getUserFacingProviderNames(): AIProviderName[] {
  return PROVIDER_REGISTRY.filter(
    (p) => shouldExposePlaceholderProviders() || p.status !== "placeholder",
  ).map((p) => p.name);
}

export function isUserFacingProvider(name: string): boolean {
  return getUserFacingProviderNames().includes(name as AIProviderName);
}
