import type { CoreAssetItem, CoreAssetManifest } from "@/lib/ai-core/layers/types";
import { persistImageGenerationRecords } from "@/lib/ai-core/assets/persist";
import {
  generateRealisticImage,
  isImageProviderConfigured,
  svgFallbackDataUrl,
} from "@/lib/ai-core/assets/provider";
import { getDefaultImageSettings } from "@/lib/ai-core/assets/settings";
import type { GenerateCoreAssetsParams } from "@/lib/ai-core/assets/types";

const DEFAULT_MAX = 5;

/**
 * AI Real Images Engine — generates hero/product/service/background/brand images.
 * Uses OpenAI / Replicate / Stability when configured; SVG fallback otherwise.
 * DeepSeek is not used for pixels (prompts may be refined separately).
 */
export async function generateCoreAssets(
  params: GenerateCoreAssetsParams,
): Promise<CoreAssetManifest> {
  const maxImages = params.maxImages ?? DEFAULT_MAX;
  const settings = params.imageSettings ?? getDefaultImageSettings();
  const items: CoreAssetItem[] = [];
  let providerUsed: string | undefined;
  let modelUsed: string | undefined;

  params.onProgress?.(
    isImageProviderConfigured()
      ? "Generating real AI images..."
      : "Generating asset fallbacks (no image provider configured)...",
  );

  for (const planned of params.items.slice(0, maxImages)) {
    if (planned.kind === "icon") {
      items.push({
        id: planned.id,
        role: planned.role,
        name: planned.name,
        prompt: planned.prompt,
        alt: planned.alt,
        url: svgFallbackDataUrl(
          planned.name,
          params.colors.primary,
          params.colors.secondary,
        ),
        storagePath: null,
        status: "fallback",
        mimeType: "image/svg+xml",
      });
      continue;
    }

    params.onProgress?.(`Asset: ${planned.name} (${planned.kind})`);

    const enrichedPrompt = planned.realistic
      ? `Photorealistic, high detail. ${planned.prompt}. Brand colors roughly ${params.colors.primary} and ${params.colors.secondary}.`
      : `${planned.prompt}. Brand colors roughly ${params.colors.primary} and ${params.colors.secondary}.`;

    const generated = await generateRealisticImage(enrichedPrompt, {
      settings,
      negativePrompt: params.negativePrompt,
    });

    if (!generated) {
      items.push({
        id: planned.id,
        role: planned.role,
        name: planned.name,
        prompt: planned.prompt,
        alt: planned.alt,
        url: svgFallbackDataUrl(
          planned.name,
          params.colors.primary,
          params.colors.secondary,
        ),
        storagePath: null,
        status: "fallback",
        mimeType: "image/svg+xml",
      });
      continue;
    }

    providerUsed = generated.provider;
    modelUsed = generated.model;
    let url: string | null = null;
    let storagePath: string | null = null;

    if (params.upload) {
      const uploaded = await params.upload({
        assetId: planned.id,
        bytes: generated.bytes,
        contentType: generated.mimeType,
      });
      if (uploaded) {
        url = uploaded.publicUrl;
        storagePath = uploaded.storagePath;
      }
    }

    if (!url) {
      url = `data:${generated.mimeType};base64,${generated.bytes.toString("base64")}`;
    }

    items.push({
      id: planned.id,
      role: planned.role,
      name: planned.name,
      prompt: planned.prompt,
      alt: planned.alt,
      url,
      storagePath,
      status: "generated",
      mimeType: generated.mimeType,
    });
  }

  const manifest: CoreAssetManifest = {
    items,
    provider: providerUsed ?? "fallback-svg",
    generatedAt: new Date().toISOString(),
  };

  if (params.persist !== false && params.userId) {
    await persistImageGenerationRecords({
      userId: params.userId,
      websiteGenerationId: params.websiteGenerationId,
      aiRunId: params.aiRunId,
      settings,
      planned: params.items.slice(0, maxImages),
      items,
      provider: providerUsed,
      model: modelUsed,
    });
  }

  return manifest;
}

export function coreAssetManifestSummary(manifest: CoreAssetManifest): string {
  return manifest.items
    .map(
      (item) =>
        `- ${item.role}/${item.name}: ${item.alt} → ${item.url ? "available" : "missing"} (${item.status})`,
    )
    .join("\n");
}
