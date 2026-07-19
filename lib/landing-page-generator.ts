import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { layerRunner } from "@/lib/ai-core";
import {
  createLandingPageBuilderAdapter,
  landingPageInputToBrief,
} from "@/lib/ai-core/adapters/landing-page-builder";
import type {
  LPOutput,
  LandingPagePluginInput,
  LPProgressEvent,
  GeneratedProjectFile,
} from "@/plugins/landing-page";

export type {
  LPOutput,
  LandingPagePluginInput,
  LPProgressEvent,
  GeneratedProjectFile,
};

type GenerateLPInput = LandingPagePluginInput & {
  onProgress?: (event: string) => void;
};

export type LPGenerationResult = LPOutput & {
  progressEvents: LPProgressEvent[];
  usage: TokenUsage;
  generationTimeMs: number;
  provider: string;
};

/**
 * Landing Page Builder entrypoint — Phase 2 runs through AI Core LayerRunner
 * (Idea → Strategy → Design → Assets → Generation → Quality → Finalize).
 */
export async function generateLandingPage(
  input: GenerateLPInput,
): Promise<LPGenerationResult> {
  const { onProgress, ...pluginInput } = input;

  const resolved = providerManager.resolve(getDefaultTextProvider());
  if (!resolved || !providerManager.isConfigured(resolved)) {
    throw new Error(
      "No AI provider configured. Set DEEPSEEK_API_KEY to enable generation.",
    );
  }

  const adapter = createLandingPageBuilderAdapter();
  const result = await layerRunner.run(
    adapter,
    { brief: landingPageInputToBrief(pluginInput) },
    { provider: resolved, onProgress },
  );

  const project = result.finalOutput ?? result.generation;

  return {
    ...project,
    progressEvents: result.progressEvents as LPProgressEvent[],
    usage: result.usage ?? emptyTokenUsage(),
    generationTimeMs: result.generationTimeMs,
    provider: result.provider,
  };
}
