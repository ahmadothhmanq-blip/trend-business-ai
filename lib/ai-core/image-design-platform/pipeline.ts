/**
 * Raster generation pipeline — produces real images from plugin concepts.
 */

import { generateRasterImage } from "@/lib/ai-core/image-design-platform/providers";
import { buildBrandPromptSuffix } from "@/lib/ai-core/image-design-platform/brand";
import type {
  BrandKitContext,
  ImageRasterAsset,
} from "@/lib/ai-core/image-design-platform/types";
import type { ImageOutput } from "@/plugins/image-generator/types";
import type { ImageProviderId, ImageQuality } from "@/lib/ai-core/assets/settings";

export async function generateRasterAssets(params: {
  output: ImageOutput;
  negativePrompt: string;
  aspectRatio: string;
  style: string;
  quality: ImageQuality;
  preferredProvider?: ImageProviderId;
  brand?: BrandKitContext;
  seed?: number;
  onProgress?: (msg: string) => void;
}): Promise<ImageRasterAsset[]> {
  const brandSuffix = buildBrandPromptSuffix(params.brand);
  const assets: ImageRasterAsset[] = [];

  const concepts = params.output.concepts.filter((c) => c.prompt || c.description);
  const targets = concepts.length ? concepts : [{ name: "Primary", prompt: params.output.title, description: "" } as typeof concepts[0]];

  for (let i = 0; i < targets.length; i++) {
    const concept = targets[i]!;
    const prompt = `${concept.prompt || concept.description || params.output.title}${brandSuffix}`;
    params.onProgress?.(`Raster ${i + 1}/${targets.length}: ${concept.name}...`);

    const asset = await generateRasterImage({
      prompt,
      negativePrompt: concept.negativePrompt || params.negativePrompt,
      aspectRatio: params.aspectRatio,
      quality: params.quality,
      style: params.style,
      preferredProvider: params.preferredProvider,
      name: concept.name,
      seed: params.seed != null ? params.seed + i : undefined,
      onProgress: params.onProgress,
    });

    assets.push(asset);
  }

  return assets;
}
