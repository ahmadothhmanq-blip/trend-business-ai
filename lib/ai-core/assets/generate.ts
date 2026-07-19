import type { CoreAssetItem, CoreAssetManifest } from "@/lib/ai-core/layers/types";
import { persistImageGenerationRecords } from "@/lib/ai-core/assets/persist";
import {
  generateRealisticImage,
  isImageProviderConfigured,
  svgFallbackDataUrl,
} from "@/lib/ai-core/assets/provider";
import { getDefaultImageSettings } from "@/lib/ai-core/assets/settings";
import type { GenerateCoreAssetsParams } from "@/lib/ai-core/assets/types";
import { resolvePremiumStockUrl } from "@/lib/ai-core/image-engine/stock";

const DEFAULT_MAX = 5;

/**
 * AI Real Images Engine — generates hero/product/service/background/gallery images.
 * Uses OpenAI / Replicate / Stability when configured; curated premium stock otherwise.
 * Never uses SVG placeholders for photographic roles.
 */
export async function generateCoreAssets(
  params: GenerateCoreAssetsParams,
): Promise<CoreAssetManifest> {
  const maxImages = params.maxImages ?? DEFAULT_MAX;
  const settings = params.imageSettings ?? getDefaultImageSettings();
  const items: CoreAssetItem[] = [];
  let providerUsed: string | undefined;
  let modelUsed: string | undefined;
  const industry = params.industry ?? undefined;

  params.onProgress?.(
    isImageProviderConfigured()
      ? "Generating premium AI images..."
      : "Selecting premium stock photography (no image provider configured)...",
  );

  for (const planned of params.items.slice(0, maxImages)) {
    const baseMeta = planned.metadata
      ? {
          ...planned.metadata,
          style: planned.metadata.style ?? settings.style,
          prompt: planned.metadata.prompt ?? planned.prompt,
        }
      : undefined;

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
        metadata: baseMeta
          ? { ...baseMeta, provider: "fallback-svg" }
          : undefined,
      });
      continue;
    }

    params.onProgress?.(`Asset: ${planned.name} (${planned.kind})`);

    const enrichedPrompt = planned.realistic
      ? `Photorealistic, high detail. ${planned.prompt}. Brand colors roughly ${params.colors.primary} and ${params.colors.secondary}.`
      : `${planned.prompt}. Brand colors roughly ${params.colors.primary} and ${params.colors.secondary}.`;

    // Retry once on provider failure before falling back to premium stock.
    let generated = await generateRealisticImage(enrichedPrompt, {
      settings,
      negativePrompt: params.negativePrompt,
    });
    if (!generated) {
      params.onProgress?.(`Retrying image: ${planned.name}`);
      generated = await generateRealisticImage(enrichedPrompt, {
        settings,
        negativePrompt: params.negativePrompt,
      });
    }

    if (!generated) {
      const stockUrl = resolvePremiumStockUrl({
        industry,
        role: planned.role,
        seed: planned.id + planned.name,
      });
      items.push({
        id: planned.id,
        role: planned.role,
        name: planned.name,
        prompt: planned.prompt,
        alt: planned.alt || `${planned.name} — premium photography`,
        url: stockUrl,
        storagePath: null,
        status: "generated",
        mimeType: "image/jpeg",
        metadata: baseMeta
          ? { ...baseMeta, provider: "premium-stock" }
          : { provider: "premium-stock" },
      });
      providerUsed = providerUsed || "premium-stock";
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
      metadata: baseMeta
        ? { ...baseMeta, provider: generated.provider }
        : undefined,
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
    .map((item) => {
      const meta = item.metadata;
      const metaBits = [
        meta?.purpose ? `purpose=${meta.purpose}` : null,
        meta?.section ? `section=${meta.section}` : null,
        meta?.style ? `style=${meta.style}` : null,
        meta?.provider || item.status === "fallback"
          ? `provider=${meta?.provider || "fallback-svg"}`
          : null,
      ]
        .filter(Boolean)
        .join(", ");
      const url = item.url || "missing";
      return `- id=${item.id} role=${item.role} name=${item.name}: alt="${item.alt}" url=${url} (${item.status})${metaBits ? ` [${metaBits}]` : ""}${meta?.prompt ? `\n  prompt: ${meta.prompt}` : ""}`;
    })
    .join("\n");
}
