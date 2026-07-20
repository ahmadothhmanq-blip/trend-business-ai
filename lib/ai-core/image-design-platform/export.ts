/**
 * Export helpers for Design Studio assets.
 */

import type { ImageDesignModel, ImageRasterAsset } from "@/lib/ai-core/image-design-platform/types";

import type { CanvasDocumentModel } from "@/lib/ai-core/image-design-platform/editor/types";
import { flattenElements } from "@/lib/ai-core/image-design-platform/editor/document";

export type ExportFormat = "png" | "jpg" | "webp" | "zip" | "json" | "pdf" | "project";

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

export function buildProjectExport(document: CanvasDocumentModel) {
  return {
    format: "design-project-v2",
    exportedAt: new Date().toISOString(),
    document,
    layers: document.layers,
    elements: flattenElements(document),
    brand: document.brand ?? null,
  };
}

export async function buildPdfFromCanvas(document: CanvasDocumentModel): Promise<Uint8Array> {
  const { jsPDF } = await import("jspdf");
  const orientation = document.width >= document.height ? "landscape" : "portrait";
  const pdf = new jsPDF({
    orientation,
    unit: "px",
    format: [document.width, document.height],
  });

  pdf.setFillColor(document.backgroundColor || "#FFFFFF");
  pdf.rect(0, 0, document.width, document.height, "F");

  for (const el of flattenElements(document)) {
    const { x, y, width, height, opacity, rotation } = el.transform;
    if (el.type === "text") {
      pdf.setFontSize(el.fontSize);
      pdf.setTextColor(el.color);
      pdf.text(el.content, x, y + el.fontSize, { angle: rotation });
    } else if (el.type === "shape" || el.type === "background") {
      pdf.setFillColor(el.fill);
      pdf.rect(x, y, width, height, "F");
    } else if (el.type === "image" && el.src) {
      try {
        pdf.addImage(el.src, "PNG", x, y, width, height, undefined, "FAST", rotation);
      } catch {
        // skip unrasterizable remote images in PDF fallback
      }
    }
    void opacity;
  }

  return pdf.output("arraybuffer") as unknown as Uint8Array;
}
