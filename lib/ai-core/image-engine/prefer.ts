import type { CoreAssetManifest } from "@/lib/ai-core/layers/types";

import { isPremiumStockUrl } from "@/lib/ai-core/image-engine/stock";

/**
 * Prefer photographic assets (AI or curated stock) over SVG/placeholder fallbacks.
 */
export function preferAiImages(
  manifest: CoreAssetManifest,
): CoreAssetManifest {
  const photoRoles = new Set(
    manifest.items
      .filter(
        (i) =>
          Boolean(i.url) &&
          (i.status === "generated" ||
            i.metadata?.provider === "premium-stock" ||
            isPremiumStockUrl(i.url)),
      )
      .map((i) => i.role),
  );

  if (!photoRoles.size) return manifest;

  const items = manifest.items.filter((item) => {
    if (item.status !== "fallback") return true;
    if (item.mimeType === "image/svg+xml" || item.url?.startsWith("data:image/svg")) {
      return !photoRoles.has(item.role);
    }
    return true;
  });

  return {
    ...manifest,
    items,
  };
}
