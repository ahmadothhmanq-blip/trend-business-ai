/**
 * Unified Image Design Engine — plugin concepts + real raster generation.
 */

import { providerManager } from "@/lib/ai/provider-manager";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { imageGeneratorPlugin } from "@/plugins/image-generator";
import type {
  ImageOutput,
  ImagePluginInput,
  ImageProgressEvent,
} from "@/plugins/image-generator/types";
import type { ImageProviderId, ImageQuality } from "@/lib/ai-core/assets/settings";
import { applyQualityToModel } from "@/lib/ai-core/image-design-platform/quality";
import {
  enrichInputWithBrand,
  outputToModel,
} from "@/lib/ai-core/image-design-platform/model";
import { generateRasterAssets } from "@/lib/ai-core/image-design-platform/pipeline";
import { isRasterGenerationAvailable } from "@/lib/ai-core/image-design-platform/providers";
import type {
  BrandKitContext,
  ImageDesignModel,
} from "@/lib/ai-core/image-design-platform/types";

export type ImageEngineResult = {
  output: ImageOutput;
  model: ImageDesignModel;
  progressEvents: ImageProgressEvent[];
  usage: TokenUsage;
  generationTimeMs: number;
  provider: string;
};

export type ImageEngineOptions = {
  onProgress?: (event: string) => void;
  templateId?: string;
  brand?: BrandKitContext;
  quality?: ImageQuality;
  preferredProvider?: ImageProviderId;
  seed?: number;
  skipRaster?: boolean;
};

export class ImageDesignEngine {
  async generate(
    input: ImagePluginInput,
    options: ImageEngineOptions = {},
  ): Promise<ImageEngineResult> {
    const started = Date.now();
    const progressEvents: string[] = [];
    const emit = (msg: string) => {
      progressEvents.push(msg);
      options.onProgress?.(msg);
    };

    const enriched = enrichInputWithBrand(input, options.brand);

    emit("[idea] Running image concept plugin...");
    const result = await providerManager.runPlugin(imageGeneratorPlugin, enriched, {
      onProgress: (e) => emit(e),
    });

    const output = result.output;
    emit(`[concepts] ${output.concepts.length} concept(s) ready`);

    let rasterAssets = [] as ImageDesignModel["rasterAssets"];
    if (!options.skipRaster) {
      if (isRasterGenerationAvailable()) {
        emit("[raster] Generating production images...");
        rasterAssets = await generateRasterAssets({
          output,
          negativePrompt: input.negativePrompt,
          aspectRatio: input.aspectRatio,
          style: input.style,
          quality: options.quality ?? "standard",
          preferredProvider: options.preferredProvider,
          brand: options.brand,
          seed: options.seed,
          onProgress: emit,
        });
        const completed = rasterAssets.filter((a) => a.status === "completed").length;
        emit(`[raster] ${completed}/${rasterAssets.length} image(s) generated`);
      } else {
        emit("[raster] No image provider configured — SVG concepts only");
      }
    }

    let model = outputToModel({
      output,
      input: enriched,
      rasterAssets,
      brand: options.brand,
      templateId: options.templateId,
      quality: options.quality,
      providerUsed: rasterAssets.find((a) => a.provider)?.provider,
    });
    model = applyQualityToModel(model);
    emit("[finalize] Image design model compiled.");

    return {
      output,
      model,
      progressEvents,
      usage: result.usage ?? emptyTokenUsage(),
      generationTimeMs: Date.now() - started,
      provider: result.provider,
    };
  }
}

export const imageDesignEngine = new ImageDesignEngine();
