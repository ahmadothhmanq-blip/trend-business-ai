/**
 * Provider abstraction for Image Design Studio — wraps existing image providers.
 */

import {
  generateWithImageProviders,
  isAnyImageProviderConfigured,
  listConfiguredImageProviders,
  listImageProviders,
} from "@/lib/ai-core/assets/providers/router";
import {
  getDefaultImageSettings,
  normalizeImageStyle,
  stylePromptFragment,
  type ImageAspectRatio,
  type ImageProviderId,
  type ImageQuality,
  type ImageStylePreset,
} from "@/lib/ai-core/assets/settings";
import type { ImageProviderResult } from "@/lib/ai-core/assets/providers/types";
import { createId } from "@/lib/ai-core/image-design-platform/ids";
import type { ImageRasterAsset } from "@/lib/ai-core/image-design-platform/types";

export function mapAspectRatio(ratio: string): ImageAspectRatio {
  const map: Record<string, ImageAspectRatio> = {
    "1:1": "1:1",
    "16:9": "16:9",
    "9:16": "9:16",
    "4:3": "3:2",
    "3:4": "4:5",
    "3:2": "3:2",
    "2:3": "4:5",
    "4:5": "4:5",
  };
  return map[ratio] ?? "1:1";
}

export function mapStylePreset(style: string): ImageStylePreset {
  return normalizeImageStyle(style);
}

export function listAvailableProviders(): {
  id: ImageProviderId;
  label: string;
  configured: boolean;
}[] {
  const configured = new Set(listConfiguredImageProviders());
  return listImageProviders().map((p) => ({
    id: p.id,
    label: p.label,
    configured: configured.has(p.id),
  }));
}

export function isRasterGenerationAvailable(): boolean {
  return isAnyImageProviderConfigured();
}

function mimeToFormat(mime: string): "png" | "jpg" | "webp" {
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("webp")) return "webp";
  return "png";
}

function bufferToDataUrl(bytes: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${bytes.toString("base64")}`;
}

export async function generateRasterImage(params: {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: string;
  quality: ImageQuality;
  style: string;
  preferredProvider?: ImageProviderId;
  name?: string;
  seed?: number;
  onProgress?: (msg: string) => void;
}): Promise<ImageRasterAsset> {
  const aspect = mapAspectRatio(params.aspectRatio);
  const stylePreset = mapStylePreset(params.style);
  const settings = getDefaultImageSettings({
    aspectRatio: aspect,
    quality: params.quality,
    style: stylePreset,
    preferredProvider: params.preferredProvider,
  });

  const enrichedPrompt = `${params.prompt}. ${stylePromptFragment(stylePreset)}. Mood and composition: ${params.style}.`;

  params.onProgress?.(
    isAnyImageProviderConfigured()
      ? `Generating raster image via ${params.preferredProvider ?? "auto"}...`
      : "No image provider configured — skipping raster generation",
  );

  if (!isAnyImageProviderConfigured()) {
    return {
      id: createId("asset"),
      name: params.name ?? "Image",
      format: "png",
      mimeType: "image/png",
      provider: "none",
      status: "fallback",
      prompt: params.prompt,
      negativePrompt: params.negativePrompt,
      seed: params.seed ?? null,
    };
  }

  let result: ImageProviderResult | null = null;
  try {
    result = await generateWithImageProviders(
      {
        prompt: enrichedPrompt,
        aspectRatio: aspect,
        quality: params.quality,
        negativePrompt: params.negativePrompt,
      },
      { preferredProvider: settings.preferredProvider },
    );
  } catch {
    result = null;
  }

  if (!result) {
    return {
      id: createId("asset"),
      name: params.name ?? "Image",
      format: "png",
      mimeType: "image/png",
      provider: "fallback",
      status: "failed",
      prompt: params.prompt,
      negativePrompt: params.negativePrompt,
      seed: params.seed ?? null,
    };
  }

  const format = mimeToFormat(result.mimeType);
  return {
    id: createId("asset"),
    name: params.name ?? "Image",
    format,
    mimeType: result.mimeType,
    width: result.width,
    height: result.height,
    provider: result.provider,
    model: result.model,
    dataUrl: bufferToDataUrl(result.bytes, result.mimeType),
    status: "completed",
    prompt: params.prompt,
    negativePrompt: params.negativePrompt,
    seed: params.seed ?? null,
  };
}
