import type { TokenUsage } from "@/lib/ai/types";
import { imageDesignEngine } from "@/lib/ai-core/image-design-platform/engine";
import { modelToBlueprint } from "@/lib/ai-core/image-design-platform/model";
import type {
  ImageOutput,
  ImagePluginInput,
  ImageProgressEvent,
} from "@/plugins/image-generator";
import type { ImageProviderId, ImageQuality } from "@/lib/ai-core/assets/settings";
import type { BrandKitContext } from "@/lib/ai-core/image-design-platform/types";

export type { ImageOutput, ImagePluginInput, ImageProgressEvent };

type GenerateImageInput = ImagePluginInput & {
  onProgress?: (event: string) => void;
  templateId?: string;
  brand?: BrandKitContext;
  quality?: ImageQuality;
  preferredProvider?: ImageProviderId;
  seed?: number;
};

export type ImageGenerationResult = ImageOutput & {
  progressEvents: ImageProgressEvent[];
  usage: TokenUsage;
  generationTimeMs: number;
  provider: string;
  model?: import("@/lib/ai-core/image-design-platform/types").ImageDesignModel;
};

/**
 * Image Generator / Design Studio entrypoint — unified ImageDesignEngine.
 * Preserves plugin architecture + adds real raster generation when providers configured.
 */
export async function generateImage(
  input: GenerateImageInput,
): Promise<ImageGenerationResult> {
  const { onProgress, templateId, brand, quality, preferredProvider, seed, ...pluginInput } = input;

  const result = await imageDesignEngine.generate(pluginInput, {
    onProgress,
    templateId,
    brand,
    quality,
    preferredProvider,
    seed,
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

export { modelToBlueprint } from "@/lib/ai-core/image-design-platform/model";
