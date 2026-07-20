import type { TokenUsage } from "@/lib/ai/types";
import { brandIdentityEngine } from "@/lib/ai-core/brand-studio/engine";
import { modelToBlueprint } from "@/lib/ai-core/brand-studio/model";
import type {
  BrandOutput,
  BrandIdentityPluginInput,
  BrandProgressEvent,
} from "@/plugins/brand-identity";

export type { BrandOutput, BrandIdentityPluginInput, BrandProgressEvent };

type GenerateBrandInput = BrandIdentityPluginInput & {
  onProgress?: (event: string) => void;
  templateId?: string;
};

export type BrandGenerationResult = BrandOutput & {
  progressEvents: BrandProgressEvent[];
  usage: TokenUsage;
  generationTimeMs: number;
  provider: string;
  model?: import("@/lib/ai-core/brand-studio/types").BrandIdentityModel;
};

/**
 * Brand Designer entrypoint — unified BrandIdentityEngine via AI Core LayerRunner.
 * API route remains /api/brand-identity.
 */
export async function generateBrandIdentity(
  input: GenerateBrandInput,
): Promise<BrandGenerationResult> {
  const { onProgress, templateId, ...pluginInput } = input;

  const result = await brandIdentityEngine.generate(pluginInput, {
    onProgress,
    templateId,
  });

  return {
    ...result.output,
    progressEvents: result.progressEvents,
    usage: result.usage,
    generationTimeMs: result.generationTimeMs,
    provider: result.provider,
    model: result.model,
  };
}

export { modelToBlueprint } from "@/lib/ai-core/brand-studio/model";
