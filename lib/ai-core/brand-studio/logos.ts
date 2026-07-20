/**
 * Logo generation integrated into Brand Studio.
 */

import { generateLogo } from "@/lib/logo-generator";
import { createId } from "@/lib/ai-core/brand-studio/ids";
import { newLogoConcept } from "@/lib/ai-core/brand-studio/model";
import type {
  BrandIdentityModel,
  BrandLogoConcept,
  BrandLogoVariant,
} from "@/lib/ai-core/brand-studio/types";

function buildFallbackSvg(brandName: string, primary: string, secondary: string): string {
  const initial = brandName.trim().charAt(0).toUpperCase() || "B";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="${brandName}">
  <rect width="120" height="120" rx="24" fill="${primary}"/>
  <text x="60" y="72" text-anchor="middle" font-family="Georgia, serif" font-size="52" font-weight="700" fill="${secondary}">${initial}</text>
</svg>`;
}

function buildIconSvg(brandName: string, primary: string): string {
  const initial = brandName.trim().charAt(0).toUpperCase() || "B";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="${brandName} icon">
  <circle cx="32" cy="32" r="30" fill="${primary}"/>
  <text x="32" y="42" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF">${initial}</text>
</svg>`;
}

function buildMonochromeSvg(brandName: string): string {
  const initial = brandName.trim().charAt(0).toUpperCase() || "B";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="${brandName} monochrome">
  <rect width="120" height="120" rx="24" fill="#000000"/>
  <text x="60" y="72" text-anchor="middle" font-family="Georgia, serif" font-size="52" font-weight="700" fill="#FFFFFF">${initial}</text>
</svg>`;
}

function svgToPngDataUrl(svg: string): string {
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

export function buildLogoVariants(
  brandName: string,
  primary: string,
  secondary: string,
  concepts: BrandLogoConcept[],
): BrandLogoVariant[] {
  const primarySvg = concepts[0]?.svg || buildFallbackSvg(brandName, primary, secondary);
  const iconSvg = buildIconSvg(brandName, primary);
  const monoSvg = buildMonochromeSvg(brandName);

  return [
    {
      id: createId("variant"),
      name: "Primary Logo",
      variant: "primary",
      format: "svg",
      svg: primarySvg,
      pngDataUrl: svgToPngDataUrl(primarySvg),
      description: "Full-color primary logo for digital and print.",
    },
    {
      id: createId("variant"),
      name: "Icon Mark",
      variant: "icon",
      format: "svg",
      svg: iconSvg,
      pngDataUrl: svgToPngDataUrl(iconSvg),
      description: "Square icon for app icons and avatars.",
    },
    {
      id: createId("variant"),
      name: "Favicon",
      variant: "favicon",
      format: "svg",
      svg: iconSvg,
      pngDataUrl: svgToPngDataUrl(iconSvg),
      description: "16–32px favicon variant.",
    },
    {
      id: createId("variant"),
      name: "Monochrome",
      variant: "monochrome",
      format: "svg",
      svg: monoSvg,
      pngDataUrl: svgToPngDataUrl(monoSvg),
      description: "Single-color logo for embossing and stamps.",
    },
    ...concepts.map((c) => ({
      id: createId("variant"),
      name: c.name,
      variant: "concept" as const,
      format: "svg" as const,
      svg: c.svg,
      pngDataUrl: svgToPngDataUrl(c.svg),
      description: c.description,
    })),
  ];
}

export async function generateBrandLogos(params: {
  model: BrandIdentityModel;
  conceptCount?: number;
  onProgress?: (msg: string) => void;
}): Promise<{ concepts: BrandLogoConcept[]; variants: BrandLogoVariant[]; guidelines: string }> {
  const { model, conceptCount = 3, onProgress } = params;
  const primary = model.tokens.primary;
  const secondary = model.tokens.secondary;
  const colorPalette = model.colors.map((c) => `${c.name}: ${c.hex}`).join(", ");

  onProgress?.("Generating logo concepts...");
  let concepts: BrandLogoConcept[] = [];

  try {
    const result = await generateLogo({
      prompt: model.description || `Logo for ${model.brandName}`,
      brandName: model.brandName,
      logoStyle: model.logoDirection.style || "modern",
      industry: model.industry || "General",
      colorPalette,
      iconStyle: model.logoDirection.iconConcept || "abstract",
      typography: model.typography.primary,
      personality: model.strategy.personality,
      options: ["svg", "variations", "guidelines"],
      onProgress,
    });

    concepts = result.concepts.slice(0, conceptCount).map((c) =>
      newLogoConcept(c.name, c.description, c.svgCode || buildFallbackSvg(model.brandName, primary, secondary)),
    );

    if (result.variations?.length) {
      for (const v of result.variations.slice(0, 2)) {
        if (v.svgCode) {
          concepts.push(newLogoConcept(v.name, v.description, v.svgCode));
        }
      }
    }

    const variants = buildLogoVariants(model.brandName, primary, secondary, concepts);
    return {
      concepts,
      variants,
      guidelines: result.guidelines || model.logoDirection.guidelinesDocument,
    };
  } catch {
    onProgress?.("Logo AI unavailable — using branded fallback concepts.");
    concepts = [
      newLogoConcept("Wordmark", "Clean typographic wordmark", buildFallbackSvg(model.brandName, primary, secondary)),
      newLogoConcept("Icon Mark", "Initial-based icon", buildIconSvg(model.brandName, primary)),
    ];
    return {
      concepts,
      variants: buildLogoVariants(model.brandName, primary, secondary, concepts),
      guidelines: model.logoDirection.guidelinesDocument,
    };
  }
}
