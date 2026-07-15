import { providerManager } from "@/lib/ai/provider-manager";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { brandIdentityPlugin } from "@/plugins/brand-identity";
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

export async function generateBrandIdentity(
  input: GenerateBrandInput,
): Promise<BrandGenerationResult> {
  const { onProgress, ...pluginInput } = input;
  const result = await providerManager.runPlugin(brandIdentityPlugin, pluginInput, {
    onProgress,
  });

  return {
    ...result.output,
    progressEvents: result.progressEvents as BrandProgressEvent[],
    usage: result.usage ?? emptyTokenUsage(),
    generationTimeMs: result.generationTimeMs,
    provider: result.provider,
  };
}
