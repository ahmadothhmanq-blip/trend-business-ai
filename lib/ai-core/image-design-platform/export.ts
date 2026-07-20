/**
 * Export helpers for Design Studio assets.
 */

import type { ImageDesignModel, ImageRasterAsset } from "@/lib/ai-core/image-design-platform/types";

export type ExportFormat = "png" | "jpg" | "webp" | "zip" | "json";

export function buildExportManifest(model: ImageDesignModel) {
  const rasterFiles = model.rasterAssets
    .filter((a) => a.dataUrl || a.publicUrl)
    .map((a) => ({
      path: `images/${a.name.replace(/\s+/g, "-").toLowerCase()}.${a.format}`,
      asset: a,
    }));

  return {
    title: model.title,
    rasterFiles,
    svgFiles: model.files.filter((f) => f.language === "svg"),
    docs: model.files.filter((f) => f.language === "markdown"),
    promptLibrary: model.promptLibrary,
  };
}

export function assetToBuffer(asset: ImageRasterAsset): Buffer | null {
  if (!asset.dataUrl) return null;
  const match = asset.dataUrl.match(/^data:[^;]+;base64,(.+)$/);
  if (!match) return null;
  return Buffer.from(match[1]!, "base64");
}

export function convertBufferFormat(
  bytes: Buffer,
  target: "png" | "jpg" | "webp",
): { bytes: Buffer; mimeType: string; ext: string } {
  // Without sharp, return original bytes with mapped mime (PNG from providers)
  const mime =
    target === "jpg" ? "image/jpeg" : target === "webp" ? "image/webp" : "image/png";
  const ext = target;
  return { bytes, mimeType: mime, ext };
}
