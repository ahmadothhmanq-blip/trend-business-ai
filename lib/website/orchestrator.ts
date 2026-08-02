import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import type { AIProviderName } from "@/lib/ai/types";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { layerRunner } from "@/lib/ai-core";
import {
  createWebsiteBuilderAdapter,
  priorArtifactsFromWebsiteInput,
  websiteInputToBrief,
} from "@/lib/ai-core/adapters/website-builder";
import {
  runWithWebsiteProfiler,
  getActiveWebsiteProfiler,
} from "@/lib/ai-core/performance/profiler-context";
import { WebsitePipelineProfiler } from "@/lib/ai-core/performance/website-profiler";
import type { PerformanceProfilingReport } from "@/lib/ai-core/performance/website-profiler";
import {
  resolveWebsiteTbgeRoute,
  runTbgeWebsiteGeneration,
} from "@/lib/tbge/integration";
import type {
  GeneratedProjectFile,
  GeneratedWebsiteProject,
  WebsiteGenerationInput,
  WebsiteGenerationProgressEvent,
} from "@/lib/website/types";

export type {
  GeneratedProjectFile,
  GeneratedWebsiteProject,
  WebsiteGenerationInput,
  WebsiteGenerationProgressEvent,
};

type GenerateWebsiteInput = WebsiteGenerationInput & {
  onProgress?: (event: string) => void;
  onFilesCheckpoint?: (
    files: GeneratedProjectFile[],
    meta: { message: string },
  ) => void | Promise<void>;
  preferredProvider?: AIProviderName;
  autoFallback?: boolean;
};

function resolvePreferredProvider(input: GenerateWebsiteInput): AIProviderName | undefined {
  const settings = providerManager.getUserSettings();
  return (
    input.preferredProvider ??
    (settings?.default_provider as AIProviderName | undefined) ??
    getDefaultTextProvider()
  );
}

function resolveProviderChain(
  preferred: AIProviderName | undefined,
  autoFallback: boolean,
): AIProviderName[] {
  const primary = providerManager.resolve(preferred);
  if (!autoFallback) {
    return primary ? [primary] : [];
  }
  return primary
    ? [primary, ...providerManager.listConfigured().filter((name) => name !== primary)]
    : providerManager.listConfigured();
}

/**
 * TBGE-only generation — no legacy pipeline, no fallback, errors propagate immediately.
 */
async function runTbgeOnlyGeneration(input: {
  pluginInput: WebsiteGenerationInput;
  providerName: AIProviderName;
  onProgress?: (event: string) => void;
  onFilesCheckpoint?: GenerateWebsiteInput["onFilesCheckpoint"];
}) {
  input.onProgress?.(`[tbge] Using TBGE engine with ${input.providerName}...`);
  return runTbgeWebsiteGeneration({
    pluginInput: input.pluginInput,
    providerName: input.providerName,
    options: {
      onProgress: input.onProgress,
      onFilesCheckpoint: input.onFilesCheckpoint,
    },
  });
}

/**
 * Website Builder orchestration implementation.
 *
 * Canonical public API: import `generateWebsite` from `@/lib/website-generator`.
 */
export async function generateWebsite(input: GenerateWebsiteInput): Promise<
  GeneratedWebsiteProject & {
    progressEvents: WebsiteGenerationProgressEvent[];
    usage: TokenUsage;
    generationTimeMs: number;
    provider: string;
    pipelinePerformanceReport?: PerformanceProfilingReport;
    pipelinePerformanceMarkdown?: string;
  }
> {
  const {
    onProgress,
    onFilesCheckpoint,
    preferredProvider,
    autoFallback,
    ...pluginInput
  } = input;

  const settings = providerManager.getUserSettings();
  const useFallback = autoFallback ?? settings?.auto_fallback ?? true;
  const preferred = resolvePreferredProvider(input);
  const providers = resolveProviderChain(preferred, useFallback);
  const route = resolveWebsiteTbgeRoute();

  if (route.mode === "tbge-primary") {
    const providerName =
      providers.find((name) => providerManager.isConfigured(name)) ?? null;
    if (!providerName) {
      throw new Error(
        "No AI provider configured. Set DEEPSEEK_API_KEY to enable generation.",
      );
    }
    onProgress?.(`Connecting to ${providerName}...`);
    return runTbgeOnlyGeneration({
      pluginInput,
      providerName,
      onProgress,
      onFilesCheckpoint,
    });
  }

  let lastError: unknown = null;

  for (const providerName of providers) {
    if (!providerManager.isConfigured(providerName)) continue;
    try {
      onProgress?.(`Connecting to ${providerName}...`);

      const adapter = createWebsiteBuilderAdapter();
      const profiler = getActiveWebsiteProfiler() ?? new WebsitePipelineProfiler();
      profiler.snapshotMemory("generation-start");

      const runGeneration = async () =>
        profiler.measure("website-builder", "layerRunner.run", async () =>
          layerRunner.run(
            adapter,
            {
              brief: profiler.attachToBrief(websiteInputToBrief(pluginInput)),
              mode: pluginInput.mode,
              continueInstruction: pluginInput.continueInstruction,
              priorArtifacts: priorArtifactsFromWebsiteInput(pluginInput),
              userId: pluginInput.userId,
              parentRunId: pluginInput.parentGenerationId,
            },
            {
              provider: providerName,
              onProgress,
              onFilesCheckpoint,
            },
          ),
        );

      const result = getActiveWebsiteProfiler()
        ? await runGeneration()
        : await runWithWebsiteProfiler(profiler, runGeneration);

      profiler.snapshotMemory("generation-end");
      const project = result.finalOutput ?? result.generation;

      return {
        ...project,
        progressEvents: result.progressEvents as WebsiteGenerationProgressEvent[],
        usage: result.usage ?? emptyTokenUsage(),
        generationTimeMs: result.generationTimeMs,
        provider: result.provider,
        pipelinePerformanceReport: profiler.toReport(),
        pipelinePerformanceMarkdown: profiler.formatMarkdownReport(),
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
