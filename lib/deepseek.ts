import { providerManager } from "@/lib/ai/provider-manager";
import type { AIProviderName } from "@/lib/ai/types";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { websitePlugin } from "@/plugins/website";
import type {
  GeneratedProjectFile,
  GeneratedWebsiteProject,
  WebsiteGenerationInput,
  WebsiteGenerationProgressEvent,
} from "@/plugins/website";

export type {
  GeneratedProjectFile,
  GeneratedWebsiteProject,
  WebsiteGenerationInput,
  WebsiteGenerationProgressEvent,
};

type GenerateWebsiteInput = WebsiteGenerationInput & {
  onProgress?: (event: string) => void;
  preferredProvider?: AIProviderName;
  autoFallback?: boolean;
};

/**
 * Generate a website project using the active AI provider from ProviderManager.
 * @deprecated Import `generateWebsite` from `@/lib/website-generator` instead.
 */
export async function generateWebsiteWithDeepSeek(input: GenerateWebsiteInput): Promise<
  GeneratedWebsiteProject & {
    progressEvents: WebsiteGenerationProgressEvent[];
    usage: TokenUsage;
    generationTimeMs: number;
    provider: string;
  }
> {
  return generateWebsite(input);
}

export async function generateWebsite(input: GenerateWebsiteInput): Promise<
  GeneratedWebsiteProject & {
    progressEvents: WebsiteGenerationProgressEvent[];
    usage: TokenUsage;
    generationTimeMs: number;
    provider: string;
  }
> {
  const {
    onProgress,
    preferredProvider,
    autoFallback,
    ...pluginInput
  } = input;

  const settings = providerManager.getUserSettings();
  const useFallback = autoFallback ?? settings?.auto_fallback ?? true;
  const preferred =
    preferredProvider ??
    (settings?.default_provider as AIProviderName | undefined) ??
    undefined;

  const primary = providerManager.resolve(preferred);
  const providers = useFallback
    ? primary
      ? [
          primary,
          ...providerManager.listConfigured().filter((name) => name !== primary),
        ]
      : providerManager.listConfigured()
    : primary
      ? [primary]
      : [];

  let lastError: unknown = null;

  for (const providerName of providers) {
    if (!providerManager.isConfigured(providerName)) continue;
    try {
      onProgress?.(`Connecting to ${providerName}...`);
      const result = await providerManager.runPlugin(
        websitePlugin,
        pluginInput,
        {
          provider: providerName,
          onProgress,
        },
      );

      return {
        ...result.output,
        progressEvents: result.progressEvents as WebsiteGenerationProgressEvent[],
        usage: result.usage ?? emptyTokenUsage(),
        generationTimeMs: result.generationTimeMs,
        provider: result.provider,
      };
    } catch (error) {
      lastError = error;
      onProgress?.(
        error instanceof Error
          ? `${providerName} failed: ${error.message}. Trying next provider...`
          : `${providerName} failed. Trying next provider...`,
      );
    }
  }

  if (providers.length > 0 && lastError) {
    throw lastError instanceof Error
      ? lastError
      : new Error("All configured AI providers failed.");
  }

  throw new Error(
    "No AI provider configured. Set DEEPSEEK_API_KEY to enable generation.",
  );
}
