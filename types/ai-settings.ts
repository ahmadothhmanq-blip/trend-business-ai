import {
  getUserFacingProviderNames,
  isUserFacingProvider,
} from "@/lib/ai/provider-config";

export type ProviderStatus = "connected" | "not_configured" | "error";

export type ProviderSettingsEntry = {
  name: string;
  enabled: boolean;
  apiKey: string;
  model: string;
  status: ProviderStatus;
};

export type AIProviderSettings = {
  id?: string;
  user_id?: string;
  default_provider: string;
  auto_fallback: boolean;
  retry_count: number;
  temperature: number;
  max_tokens: number;
  timeout_seconds: number;
  providers: ProviderSettingsEntry[];
  created_at?: string;
  updated_at?: string;
};

export type ProviderInfo = {
  name: string;
  label: string;
  envKey: string;
  models: string[];
  defaultModel: string;
  status: "active" | "placeholder";
};

export const PROVIDER_MODELS: Record<string, { label: string; models: string[]; defaultModel: string }> = {
  deepseek: {
    label: "DeepSeek",
    models: ["deepseek-chat", "deepseek-coder", "deepseek-reasoner"],
    defaultModel: "deepseek-chat",
  },
  openai: {
    label: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo", "o1", "o1-mini"],
    defaultModel: "gpt-4o-mini",
  },
  gemini: {
    label: "Google Gemini",
    models: ["gemini-2.0-flash", "gemini-2.0-pro", "gemini-1.5-flash", "gemini-1.5-pro"],
    defaultModel: "gemini-2.0-flash",
  },
  claude: {
    label: "Anthropic Claude",
    models: ["claude-sonnet-4-20250514", "claude-opus-4-20250514", "claude-haiku-35-20241022"],
    defaultModel: "claude-sonnet-4-20250514",
  },
  grok: {
    label: "xAI Grok",
    models: ["grok-3", "grok-3-mini", "grok-2"],
    defaultModel: "grok-3",
  },
  llama: {
    label: "Meta Llama",
    models: ["llama-4-maverick", "llama-4-scout", "llama-3.3-70b"],
    defaultModel: "llama-4-maverick",
  },
};

export function getDefaultSettings(): AIProviderSettings {
  return {
    default_provider: "deepseek",
    auto_fallback: true,
    retry_count: 3,
    temperature: 0.7,
    max_tokens: 4096,
    timeout_seconds: 120,
    providers: getUserFacingProviderNames().map((name) => {
      const info = PROVIDER_MODELS[name];
      return {
        name,
        enabled: name === "deepseek",
        apiKey: "",
        model: info?.defaultModel ?? "",
        status: "not_configured" as ProviderStatus,
      };
    }),
  };
}

/** Strip placeholder providers from client-facing settings in production. */
export function sanitizeSettingsForClient(
  settings: AIProviderSettings,
): AIProviderSettings {
  const providers = (settings.providers ?? []).filter((p) =>
    isUserFacingProvider(p.name),
  );
  const default_provider = isUserFacingProvider(settings.default_provider)
    ? settings.default_provider
    : "deepseek";
  return { ...settings, providers, default_provider };
}
