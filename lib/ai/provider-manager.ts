import type {
  AIProvider,
  AIProviderName,
  JsonGenerationRequest,
  StreamTextRequest,
  TextGenerationRequest,
  TokenUsage,
} from "@/lib/ai/types";
import {
  getAIProvider,
  isProviderConfigured,
  listConfiguredProviders,
  resolveAvailableProvider,
} from "@/lib/ai/adapters";
import { aiGenerationEngine, type AIPlugin, type EngineRunOptions } from "@/lib/ai/engine";
import {
  getActiveProvider,
  setActiveProvider,
  PROVIDER_REGISTRY,
  getProviderLabel,
} from "@/lib/ai/provider-config";
import type { AIProviderSettings } from "@/types/ai-settings";

class ProviderManager {
  private _userSettings: AIProviderSettings | null = null;

  getActiveProviderName(): AIProviderName {
    return getActiveProvider();
  }

  getActiveProviderLabel(): string {
    return getProviderLabel(getActiveProvider());
  }

  getProvider(name?: AIProviderName): AIProvider {
    return getAIProvider(name ?? getActiveProvider());
  }

  resolve(preferred?: AIProviderName): AIProviderName | null {
    return resolveAvailableProvider(preferred);
  }

  isConfigured(name?: AIProviderName): boolean {
    return isProviderConfigured(name ?? getActiveProvider());
  }

  listConfigured(): AIProviderName[] {
    return listConfiguredProviders();
  }

  listAll() {
    return PROVIDER_REGISTRY.map((reg) => ({
      ...reg,
      configured: isProviderConfigured(reg.name),
    }));
  }

  getUserSettings(): AIProviderSettings | null {
    return this._userSettings;
  }

  /** Load user settings from Supabase and set the active provider dynamically. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase client chain typing is overly deep for this helper
  async loadUserSettings(
    supabase: { from: (table: string) => any },
    userId: string,
  ): Promise<AIProviderSettings | null> {
    try {
      const { data } = await supabase
        .from("ai_provider_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data && typeof data === "object") {
        const settings = data as AIProviderSettings;
        this._userSettings = settings;
        if (settings.default_provider) {
          setActiveProvider(settings.default_provider as AIProviderName);
        }
        return settings;
      }
    } catch {
      // Table may not exist yet — fall through to defaults
    }
    return null;
  }

  /** Apply settings without a database call (e.g. from cached API response). */
  applySettings(settings: AIProviderSettings) {
    this._userSettings = settings;
    setActiveProvider(settings.default_provider as AIProviderName);
  }

  async generateJson<T>(request: JsonGenerationRequest, providerName?: AIProviderName): Promise<T> {
    const resolved = this.resolve(providerName);
    if (!resolved) {
      throw new Error(
        "No AI provider configured. Set DEEPSEEK_API_KEY to enable generation.",
      );
    }
    const provider = this.getProvider(resolved);
    return provider.generateJson<T>(request);
  }

  async generateText(request: TextGenerationRequest, providerName?: AIProviderName): Promise<string> {
    const resolved = this.resolve(providerName);
    if (!resolved) {
      throw new Error(
        "No AI provider configured. Set DEEPSEEK_API_KEY to enable generation.",
      );
    }
    const provider = this.getProvider(resolved);
    if (!provider.generateText) {
      throw new Error(`Provider "${provider.name}" does not support generateText.`);
    }
    return provider.generateText(request);
  }

  async streamText(request: StreamTextRequest, providerName?: AIProviderName): Promise<string> {
    const resolved = this.resolve(providerName);
    if (!resolved) {
      throw new Error(
        "No AI provider configured. Set DEEPSEEK_API_KEY to enable generation.",
      );
    }
    const provider = this.getProvider(resolved);
    if (!provider.streamText) {
      throw new Error(`Provider "${provider.name}" does not support streamText.`);
    }
    return provider.streamText(request);
  }

  async runPlugin<TInput, TAnalysis, TPlan, TOutput>(
    plugin: AIPlugin<TInput, TAnalysis, TPlan, TOutput>,
    input: TInput,
    options: EngineRunOptions = {},
  ) {
    const resolved = this.resolve(options.provider);
    if (!resolved) {
      throw new Error(
        "No AI provider configured. Set DEEPSEEK_API_KEY to enable generation.",
      );
    }
    return aiGenerationEngine.run(plugin, input, { ...options, provider: resolved });
  }

  getLastUsage(providerName?: AIProviderName): TokenUsage | null {
    const provider = this.getProvider(providerName);
    return provider.getLastUsage?.() ?? null;
  }
}

export const providerManager = new ProviderManager();
export type { ProviderManager };
