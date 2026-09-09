import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { layerRunner } from "@/lib/ai-core/layers/runner";
import {
  createWebappBuilderAdapter,
  webappInputToBrief,
} from "@/lib/ai-core/adapters/webapp-builder";
import {
  getActiveAppBuilderTiming,
  runWithAppBuilderTiming,
} from "@/lib/webapp/stage-timing-context";
import type { AppBuilderStageTiming } from "@/lib/webapp/stage-timing";
import type {
  WebAppOutput,
  WebAppPluginInput,
  WebAppProgressEvent,
  GeneratedProjectFile,
} from "@/plugins/webapp";

export type {
  WebAppOutput,
  WebAppPluginInput,
  WebAppProgressEvent,
  GeneratedProjectFile,
};

type GenerateWebAppInput = WebAppPluginInput & {
  onProgress?: (event: string) => void;
};

export type WebAppGenerationResult = WebAppOutput & {
  progressEvents: WebAppProgressEvent[];
  usage: TokenUsage;
  generationTimeMs: number;
  provider: string;
};

async function runLayerPipeline(
  pluginInput: WebAppPluginInput,
  resolved: string,
  timing: AppBuilderStageTiming,
  onProgress?: (event: string) => void,
): Promise<WebAppGenerationResult> {
  const adapter = createWebappBuilderAdapter();
  try {
    const result = await layerRunner.run(
      adapter,
      { brief: webappInputToBrief(pluginInput) },
      {
        provider: resolved as import("@/lib/ai/types").AIProviderName,
        onProgress: (event) => {
          timing.observeProgress(event);
          onProgress?.(event);
        },
      },
    );

    const project = result.finalOutput ?? result.generation;

    return {
      ...project,
      progressEvents: result.progressEvents as WebAppProgressEvent[],
      usage: result.usage ?? emptyTokenUsage(),
      generationTimeMs: result.generationTimeMs,
      provider: result.provider,
    };
  } catch (error) {
    timing.finish({
      failed: true,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Web App Builder entrypoint — Phase 2 runs through AI Core LayerRunner
 * (Idea → Strategy → Design → Assets → Generation → Quality → Finalize).
 */
export async function generateWebApp(
  input: GenerateWebAppInput,
): Promise<WebAppGenerationResult> {
  const { onProgress, ...pluginInput } = input;

  const resolved = providerManager.resolve(getDefaultTextProvider());
  if (!resolved || !providerManager.isConfigured(resolved)) {
    throw new Error(
      "No AI provider configured. Set DEEPSEEK_API_KEY to enable generation.",
    );
  }

  const active = getActiveAppBuilderTiming();
  if (active) {
    // Reuse API-route timing context so Stage 2 logs share one runId.
    return runLayerPipeline(pluginInput, resolved, active, onProgress);
  }

  return runWithAppBuilderTiming(async (timing) => {
    const result = await runLayerPipeline(
      pluginInput,
      resolved,
      timing,
      onProgress,
    );
    timing.finish({
      generationTimeMs: result.generationTimeMs,
      provider: result.provider,
    });
    return result;
  });
}
