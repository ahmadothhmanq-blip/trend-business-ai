import type { CoreAssetItem, CoreAssetManifest } from "@/lib/ai-core/layers/types";
import {
  generateRealisticImage,
  isImageProviderConfigured,
  svgFallbackDataUrl,
} from "@/lib/ai-core/assets/provider";
import type { GenerateCoreAssetsParams } from "@/lib/ai-core/assets/types";

const DEFAULT_MAX = 4;

/**
 * Shared AI Assets Engine — generates hero/product/background/brand/realistic images.
 * Uses OpenAI when configured; SVG fallback otherwise.
 */
export async function generateCoreAssets(
  params: GenerateCoreAssetsParams,
): Promise<CoreAssetManifest> {
  const maxImages = params.maxImages ?? DEFAULT_MAX;
  const items: CoreAssetItem[] = [];
  let providerUsed: string | undefined;

  params.onProgress?.(
    isImageProviderConfigured()
      ? "Generating assets with image provider..."
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

    const generated = await generateRealisticImage(enrichedPrompt);

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

  return {
    items,
    provider: providerUsed ?? "fallback-svg",
    generatedAt: new Date().toISOString(),
  };
}

export function coreAssetManifestSummary(manifest: CoreAssetManifest): string {
  return manifest.items
    .map(
      (item) =>
        `- ${item.role}/${item.name}: ${item.alt} → ${item.url ? "available" : "missing"} (${item.status})`,
    )
    .join("\n");
}
