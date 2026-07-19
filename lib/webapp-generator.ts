import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { layerRunner } from "@/lib/ai-core";
import {
  createWebappBuilderAdapter,
  webappInputToBrief,
} from "@/lib/ai-core/adapters/webapp-builder";
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

  const adapter = createWebappBuilderAdapter();
  const result = await layerRunner.run(
    adapter,
    { brief: webappInputToBrief(pluginInput) },
    { provider: resolved, onProgress },
  );

  const project = result.finalOutput ?? result.generation;

  return {
    ...project,
    progressEvents: result.progressEvents as WebAppProgressEvent[],
    usage: result.usage ?? emptyTokenUsage(),
    generationTimeMs: result.generationTimeMs,
    provider: result.provider,
  };
}
