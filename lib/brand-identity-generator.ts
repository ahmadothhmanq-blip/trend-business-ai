import { providerManager } from "@/lib/ai/provider-manager";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { layerRunner } from "@/lib/ai-core";
import {
  brandInputToBrief,
  createBrandDesignerAdapter,
} from "@/lib/ai-core/adapters/brand-designer";
import type {
  BrandOutput,
  BrandIdentityPluginInput,
  BrandProgressEvent,
} from "@/plugins/brand-identity";

export type { BrandOutput, BrandIdentityPluginInput, BrandProgressEvent };

type GenerateBrandInput = BrandIdentityPluginInput & {
  onProgress?: (event: string) => void;
};

export type BrandGenerationResult = BrandOutput & {
  progressEvents: BrandProgressEvent[];
  usage: TokenUsage;
  generationTimeMs: number;
  provider: string;
};

/**
 * Brand Designer entrypoint — Phase 3 runs through AI Core LayerRunner
 * (Idea → Strategy → Design → Assets → Generation → Quality → Finalize).
 * API route remains /api/brand-identity.
 */
export async function generateBrandIdentity(
  input: GenerateBrandInput,
): Promise<BrandGenerationResult> {
  const { onProgress, ...pluginInput } = input;

  const resolved = providerManager.resolve();
  if (!resolved || !providerManager.isConfigured(resolved)) {
    throw new Error(
      "No AI provider configured. Set DEEPSEEK_API_KEY to enable generation.",
    );
  }

  const adapter = createBrandDesignerAdapter();
  const result = await layerRunner.run(
    adapter,
    { brief: brandInputToBrief(pluginInput) },
    { provider: resolved, onProgress },
  );

  const project = result.finalOutput ?? result.generation;

  return {
    ...project,
    progressEvents: result.progressEvents as BrandProgressEvent[],
    usage: result.usage ?? emptyTokenUsage(),
    generationTimeMs: result.generationTimeMs,
    provider: result.provider,
  };
}
