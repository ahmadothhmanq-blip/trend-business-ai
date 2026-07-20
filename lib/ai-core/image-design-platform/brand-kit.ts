/**
 * Brand Kit integration for Design Editor — consumes Brand Studio API shape without modifying Brand Studio.
 */

import type { CanvasBrandBinding, CanvasDocumentModel } from "@/lib/ai-core/image-design-platform/editor/types";
import { applyBrandPlaceholders } from "@/lib/ai-core/image-design-platform/templates-v2";
import { bumpDocumentVersion } from "@/lib/ai-core/image-design-platform/editor/document";
import { createElement } from "@/lib/ai-core/image-design-platform/editor/elements";

export type BrandKitOption = {
  id: string;
  name: string;
  primary?: string;
  secondary?: string;
  accent?: string;
  headingFont?: string;
  bodyFont?: string;
  tagline?: string;
  logoSvg?: string;
};

/** Parse brand identity generation row from /api/brand-identity list response. */
export function brandKitFromGenerationRow(row: {
  id: string;
  brand_name?: string | null;
  blueprint?: unknown;
}): BrandKitOption {
  const bp = (row.blueprint || {}) as Record<string, unknown>;
  const paletteRaw = bp.colorPalette;
  const palette: string[] = Array.isArray(paletteRaw)
    ? paletteRaw.map((c) => {
        if (typeof c === "string") return c;
        if (c && typeof c === "object") {
          const item = c as { hex?: string; value?: string };
          return item.hex || item.value || "";
        }
        return "";
      }).filter(Boolean)
    : [];
  const typography = (bp.typography || {}) as Record<string, string>;
  const tokens = (bp.tokens || {}) as Record<string, string>;
  const logoVariants = (bp.logoVariants || []) as Array<{ variant?: string; svg?: string }>;
  const primaryLogo = logoVariants.find((v) => v.variant === "primary" || v.variant === "icon");

  return {
    id: row.id,
    name: row.brand_name || "Brand Kit",
    primary: tokens.primary || palette[0],
    secondary: tokens.secondary || palette[1],
    accent: tokens.accent || palette[2],
    headingFont: typography.headingFont || typography.display || typography.heading,
    bodyFont: typography.bodyFont || typography.body,
    tagline: (bp.tagline as string) || tokens.tagline,
    logoSvg: primaryLogo?.svg || (typeof bp.logoSvg === "string" ? bp.logoSvg : undefined),
  };
}

export function brandBindingFromKit(kit: BrandKitOption): CanvasBrandBinding {
  return {
    brandKitId: kit.id,
    brandName: kit.name,
    primary: kit.primary,
    secondary: kit.secondary,
    accent: kit.accent,
    headingFont: kit.headingFont,
    bodyFont: kit.bodyFont,
    logoSvg: kit.logoSvg,
  };
}

export function applyBrandKitToCanvas(
  doc: CanvasDocumentModel,
  kit: BrandKitOption,
): CanvasDocumentModel {
  const withPlaceholders = applyBrandPlaceholders(doc, {
    brandName: kit.name,
    primary: kit.primary,
    secondary: kit.secondary,
    accent: kit.accent,
    headingFont: kit.headingFont,
    bodyFont: kit.bodyFont,
    tagline: kit.tagline,
    logoSvg: kit.logoSvg,
  });

  const contentLayer = withPlaceholders.layers.find((l) => l.name === "Content") ?? withPlaceholders.layers[1];
  if (kit.logoSvg && contentLayer && !contentLayer.elements.some((e) => e.type === "logo")) {
    contentLayer.elements.push(
      createElement("logo", {
        name: "Brand Logo",
        svg: kit.logoSvg,
        brandKitId: kit.id,
        transform: {
          x: withPlaceholders.width - 180,
          y: 40,
          width: 120,
          height: 120,
          rotation: 0,
          opacity: 1,
          scaleX: 1,
          scaleY: 1,
        },
      }),
    );
  }

  return bumpDocumentVersion({
    ...withPlaceholders,
    brand: brandBindingFromKit(kit),
  });
}

export function applyBrandStyleToDocument(
  doc: CanvasDocumentModel,
  style: { primary?: string; secondary?: string; accent?: string },
): CanvasDocumentModel {
  return applyBrandPlaceholders(doc, {
    brandName: doc.brand?.brandName,
    primary: style.primary ?? doc.brand?.primary,
    secondary: style.secondary ?? doc.brand?.secondary,
    accent: style.accent ?? doc.brand?.accent,
    headingFont: doc.brand?.headingFont,
    bodyFont: doc.brand?.bodyFont,
    tagline: doc.brand?.brandName,
    logoSvg: doc.brand?.logoSvg,
  });
}
