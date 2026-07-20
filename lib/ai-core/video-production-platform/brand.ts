/**
 * Brand integration for Video Studio.
 */

import type {
  VideoBrandOverlay,
  VideoProductionModel,
} from "@/lib/ai-core/video-production-platform/types";
import { nowIso } from "@/lib/ai-core/video-production-platform/ids";

export type VideoBrandKitInput = {
  businessName: string;
  logoUrl?: string | null;
  primary?: string;
  secondary?: string;
  accent?: string;
  headingFont?: string;
  bodyFont?: string;
  brandIdentityId?: string | null;
};

export function applyBrandToVideoModel(
  model: VideoProductionModel,
  kit: VideoBrandKitInput,
): VideoProductionModel {
  const brand: VideoBrandOverlay = {
    businessName: kit.businessName,
    logoUrl: kit.logoUrl ?? model.brand?.logoUrl ?? null,
    primary: kit.primary ?? model.brand?.primary,
    secondary: kit.secondary ?? model.brand?.secondary,
    accent: kit.accent ?? model.brand?.accent,
    headingFont: kit.headingFont ?? model.brand?.headingFont,
    bodyFont: kit.bodyFont ?? model.brand?.bodyFont,
    brandIdentityId: kit.brandIdentityId ?? model.brand?.brandIdentityId ?? null,
  };

  // Enrich scene visual prompts with brand tokens (non-destructive)
  const brandNote = [
    brand.businessName && `Brand: ${brand.businessName}`,
    brand.primary && `Primary color ${brand.primary}`,
    brand.logoUrl && "Include logo end-card",
  ]
    .filter(Boolean)
    .join(". ");

  return {
    ...model,
    brand,
    scenes: model.scenes.map((s) => ({
      ...s,
      visualPrompt: brandNote
        ? `${s.visualPrompt}. ${brandNote}`
        : s.visualPrompt,
    })),
    updatedAt: nowIso(),
    version: model.version + 1,
  };
}

export function brandEndCardSvg(brand: VideoBrandOverlay): string {
  const primary = brand.primary || "#D4AF37";
  const name = (brand.businessName || "Brand").replace(/[<>&]/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <rect width="1280" height="720" fill="#0B1220"/>
  <text x="640" y="360" text-anchor="middle" fill="${primary}" font-family="system-ui" font-size="56" font-weight="700">${name}</text>
  <text x="640" y="420" text-anchor="middle" fill="#94A3B8" font-family="system-ui" font-size="22">AI Video Studio</text>
</svg>`;
}
