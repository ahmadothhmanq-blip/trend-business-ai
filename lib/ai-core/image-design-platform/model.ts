import type { ImageBlueprint } from "@/types/image-generation";
import type {
  BrandKitContext,
  ImageDesignModel,
  ImageRasterAsset,
} from "@/lib/ai-core/image-design-platform/types";
import type { ImageOutput, ImagePluginInput } from "@/plugins/image-generator/types";
import { mapAspectRatio, mapStylePreset } from "@/lib/ai-core/image-design-platform/providers";
import type { ImageQuality } from "@/lib/ai-core/assets/settings";

export function outputToModel(params: {
  output: ImageOutput;
  input: ImagePluginInput;
  rasterAssets?: ImageRasterAsset[];
  brand?: BrandKitContext;
  templateId?: string;
  quality?: ImageQuality;
  providerUsed?: string;
}): ImageDesignModel {
  const { output, input } = params;
  return {
    title: output.title,
    description: output.description,
    imageType: output.imageType,
    style: output.style,
    aspectRatio: input.aspectRatio,
    mood: input.mood,
    quality: params.quality ?? "standard",
    stylePreset: mapStylePreset(input.style),
    preferredProvider: undefined,
    negativePrompt: input.negativePrompt,
    concepts: output.concepts,
    rasterAssets: params.rasterAssets ?? [],
    colorDirection: output.colorDirection,
    moodBoard: output.moodBoard,
    promptLibrary: output.promptLibrary,
    files: output.files,
    brand: params.brand,
    templateId: params.templateId,
    qualityScore: 0,
    qualityIssues: [],
    providerUsed: params.providerUsed,
    generatedAt: new Date().toISOString(),
  };
}

export function modelToBlueprint(model: ImageDesignModel, prompt: string, negativePrompt: string): ImageBlueprint {
  return {
    title: model.title,
    description: model.description,
    imageType: model.imageType,
    style: model.style,
    concepts: model.concepts,
    colorDirection: model.colorDirection,
    moodBoard: model.moodBoard,
    promptLibrary: model.promptLibrary,
    files: model.files,
    prompt,
    negativePrompt,
    generatedAt: model.generatedAt,
    model,
    rasterAssets: model.rasterAssets,
    qualityScore: model.qualityScore,
    templateId: model.templateId,
    brand: model.brand,
    providerUsed: model.providerUsed,
  };
}

export function blueprintToModel(blueprint: ImageBlueprint): ImageDesignModel {
  if (blueprint.model) return blueprint.model;
  return outputToModel({
    output: {
      title: blueprint.title,
      description: blueprint.description,
      imageType: blueprint.imageType,
      style: blueprint.style,
      concepts: blueprint.concepts,
      colorDirection: blueprint.colorDirection,
      moodBoard: blueprint.moodBoard,
      promptLibrary: blueprint.promptLibrary,
      files: blueprint.files,
    },
    input: {
      prompt: blueprint.prompt,
      negativePrompt: blueprint.negativePrompt,
      imageType: blueprint.imageType,
      style: blueprint.style,
      aspectRatio: "1:1",
      mood: "Professional",
      options: [],
      batchCount: blueprint.concepts.length || 1,
      brandColors: [],
    },
    rasterAssets: blueprint.rasterAssets,
    brand: blueprint.brand,
    templateId: blueprint.templateId,
    providerUsed: blueprint.providerUsed,
  });
}

export function brandTokensToContext(tokens: {
  brandName?: string;
  primary?: string;
  secondary?: string;
  accent?: string;
  headingFont?: string;
  bodyFont?: string;
  voiceTone?: string;
  tagline?: string;
  logoSvg?: string;
}): BrandKitContext {
  const colors = [tokens.primary, tokens.secondary, tokens.accent].filter(Boolean);
  return {
    brandName: tokens.brandName,
    primary: tokens.primary,
    secondary: tokens.secondary,
    accent: tokens.accent,
    headingFont: tokens.headingFont,
    bodyFont: tokens.bodyFont,
    voiceTone: tokens.voiceTone,
    tagline: tokens.tagline,
    logoSvg: tokens.logoSvg,
    instructions: colors.length
      ? `Use brand colors: ${colors.join(", ")}. Typography: ${tokens.headingFont ?? "brand"} / ${tokens.bodyFont ?? "brand"}. Voice: ${tokens.voiceTone ?? "on-brand"}.`
      : undefined,
  };
}

export function enrichInputWithBrand(
  input: ImagePluginInput,
  brand?: BrandKitContext,
): ImagePluginInput {
  if (!brand?.instructions && !brand?.primary) return input;
  const colors = [brand.primary, brand.secondary, brand.accent].filter(Boolean) as string[];
  return {
    ...input,
    brandColors: colors.length ? colors : input.brandColors,
    prompt: brand.instructions
      ? `${input.prompt}\n\nBrand direction: ${brand.instructions}`
      : input.prompt,
  };
}
