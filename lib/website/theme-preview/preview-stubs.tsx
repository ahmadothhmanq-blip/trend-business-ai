import { normalizePremiumStockUrl } from "@/lib/ai-core/image-engine/stock";
import type { ImageSlotKind } from "@/lib/ai-core/image-engine/slots";
import type { ParsedSiteImages } from "@/lib/website/site-images-parser";
import {
  parseSiteImagesFromFiles,
  siteImagePool,
} from "@/lib/website/site-images-parser";
import type { ReactNode } from "react";
import React from "react";

export function createMotionStub(): React.FC<{
  children: ReactNode;
  className?: string;
}> {
  return function Motion({ children, className }) {
    return <div className={className}>{children}</div>;
  };
}

export type SiteImageDeps = {
  HERO_IMAGE: string | null;
  PRODUCT_IMAGE: string | null;
  SERVICE_IMAGE: string | null;
  BACKGROUND_IMAGE: string | null;
  ABOUT_IMAGE?: string | null;
  GALLERY_IMAGES: string[];
  SECTION_IMAGES: string[];
  FEATURE_IMAGES?: string[];
  TEAM_IMAGES?: string[];
  TESTIMONIAL_IMAGES: string[];
  resolveSiteImage: (
    primary: string | null | undefined,
    index: number,
  ) => string | null;
  resolveSlotImage: (
    kind: ImageSlotKind,
    index: number,
    preferred?: string | null,
  ) => string | null;
  slotImages: (kind: ImageSlotKind) => readonly string[];
};

function slotImagesFromParsed(
  parsed: ParsedSiteImages,
): (kind: ImageSlotKind) => readonly string[] {
  return (kind) => {
    switch (kind) {
      case "hero":
        return parsed.HERO_IMAGE ? [parsed.HERO_IMAGE] : [];
      case "products":
        return parsed.PRODUCT_IMAGE ? [parsed.PRODUCT_IMAGE] : [];
      case "features":
        return parsed.SERVICE_IMAGE ? [parsed.SERVICE_IMAGE] : [];
      case "backgrounds":
        return parsed.BACKGROUND_IMAGE ? [parsed.BACKGROUND_IMAGE] : [];
      case "gallery":
        return parsed.GALLERY_IMAGES;
      case "about":
        return parsed.SECTION_IMAGES;
      case "testimonials":
        return parsed.TESTIMONIAL_IMAGES;
      default:
        return [];
    }
  };
}

function createBlankSiteImageDeps(
  heroImageUrl?: string | null,
): SiteImageDeps {
  const hero = heroImageUrl?.trim()
    ? normalizePremiumStockUrl(heroImageUrl.trim())
    : null;
  const slotImages = (kind: ImageSlotKind): readonly string[] => {
    if (kind === "hero" && hero) return [hero];
    return [];
  };

  return {
    HERO_IMAGE: hero,
    PRODUCT_IMAGE: null,
    SERVICE_IMAGE: null,
    BACKGROUND_IMAGE: null,
    ABOUT_IMAGE: null,
    GALLERY_IMAGES: [],
    SECTION_IMAGES: [],
    FEATURE_IMAGES: [],
    TEAM_IMAGES: [],
    TESTIMONIAL_IMAGES: [],
    resolveSiteImage(primary, _index) {
      if (primary?.trim()) return normalizePremiumStockUrl(primary.trim());
      return hero;
    },
    resolveSlotImage(kind, index, preferred) {
      if (preferred?.trim()) return normalizePremiumStockUrl(preferred.trim());
      const images = slotImages(kind);
      const url = images[index];
      return url ? normalizePremiumStockUrl(url) : null;
    },
    slotImages,
  };
}

export function createSiteImageDeps(
  parsed: ParsedSiteImages | null,
  heroImageUrl?: string | null,
): SiteImageDeps {
  if (!parsed) {
    return createBlankSiteImageDeps(heroImageUrl);
  }

  const slotImages = slotImagesFromParsed(parsed);
  const pool = siteImagePool(parsed).filter(Boolean);
  const hero =
    parsed.HERO_IMAGE ||
    (heroImageUrl?.trim()
      ? normalizePremiumStockUrl(heroImageUrl.trim())
      : null);

  return {
    HERO_IMAGE: hero,
    PRODUCT_IMAGE: parsed.PRODUCT_IMAGE,
    SERVICE_IMAGE: parsed.SERVICE_IMAGE,
    BACKGROUND_IMAGE: parsed.BACKGROUND_IMAGE,
    GALLERY_IMAGES: parsed.GALLERY_IMAGES,
    SECTION_IMAGES: parsed.SECTION_IMAGES,
    TESTIMONIAL_IMAGES: parsed.TESTIMONIAL_IMAGES,
    resolveSiteImage(primary, index) {
      if (primary?.trim()) return normalizePremiumStockUrl(primary.trim());
      if (!pool.length) return hero;
      return pool[index % pool.length] ?? hero;
    },
    resolveSlotImage(kind, index, preferred) {
      if (preferred?.trim()) return normalizePremiumStockUrl(preferred.trim());
      const images = slotImages(kind);
      const url = images[index];
      return url ? normalizePremiumStockUrl(url) : null;
    },
    slotImages,
  };
}

/** @deprecated Prefer createSiteImageDeps with parsed lib/site-images.ts */
export function createSiteImageStubs(heroImageUrl: string | null | undefined) {
  return createBlankSiteImageDeps(heroImageUrl);
}

export function createSiteImageDepsFromFiles(
  files?: Array<{ path: string; content: string }>,
  heroImageUrl?: string | null,
): SiteImageDeps {
  const parsed = parseSiteImagesFromFiles(files);
  return createSiteImageDeps(parsed, heroImageUrl);
}

/** Module shape for preview `require("@/lib/site-images")`. */
export function buildSiteImagesRequireModule(
  deps: SiteImageDeps,
): Record<string, unknown> {
  return {
    HERO_IMAGE: deps.HERO_IMAGE ?? "",
    PRODUCT_IMAGE: deps.PRODUCT_IMAGE ?? "",
    SERVICE_IMAGE: deps.SERVICE_IMAGE ?? "",
    BACKGROUND_IMAGE: deps.BACKGROUND_IMAGE ?? "",
    ABOUT_IMAGE: deps.ABOUT_IMAGE ?? "",
    GALLERY_IMAGES: deps.GALLERY_IMAGES,
    SECTION_IMAGES: deps.SECTION_IMAGES,
    FEATURE_IMAGES: deps.FEATURE_IMAGES ?? [],
    TEAM_IMAGES: deps.TEAM_IMAGES ?? [],
    TESTIMONIAL_IMAGES: deps.TESTIMONIAL_IMAGES,
    SITE_IMAGES: [],
    slotImages: deps.slotImages,
    resolveSlotImage: deps.resolveSlotImage,
    resolveSiteImage: deps.resolveSiteImage,
    siteImagePool: () => siteImagePool({
      HERO_IMAGE: deps.HERO_IMAGE,
      PRODUCT_IMAGE: deps.PRODUCT_IMAGE,
      SERVICE_IMAGE: deps.SERVICE_IMAGE,
      BACKGROUND_IMAGE: deps.BACKGROUND_IMAGE,
      ABOUT_IMAGE: deps.ABOUT_IMAGE ?? "",
      BRAND_IMAGE: "",
      GALLERY_IMAGES: deps.GALLERY_IMAGES,
      SECTION_IMAGES: deps.SECTION_IMAGES,
      FEATURE_IMAGES: deps.FEATURE_IMAGES ?? [],
      TEAM_IMAGES: deps.TEAM_IMAGES ?? [],
      TESTIMONIAL_IMAGES: deps.TESTIMONIAL_IMAGES,
      SITE_IMAGES: [],
    }),
  };
}
