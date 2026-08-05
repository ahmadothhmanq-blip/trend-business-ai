import { normalizePremiumStockUrl } from "@/lib/ai-core/image-engine/stock";

import type { ParsedSiteImages } from "@/lib/website/site-images-parser";

import { parseSiteImagesFromFiles, siteImagePool } from "@/lib/website/site-images-parser";

import {
  BACKGROUND_IMAGE as CANONICAL_BACKGROUND,
  GALLERY_IMAGES as CANONICAL_GALLERY,
  HERO_IMAGE as CANONICAL_HERO,
  PRODUCT_IMAGE as CANONICAL_PRODUCT,
  SECTION_IMAGES as CANONICAL_SECTIONS,
  SERVICE_IMAGE as CANONICAL_SERVICE,
  TESTIMONIAL_IMAGES as CANONICAL_TESTIMONIALS,
  resolveSlotImage as canonicalResolveSlotImage,
  slotImages as canonicalSlotImages,
  siteImagePool as canonicalSiteImagePool,
} from "@/lib/site-images";

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
  resolveSlotImage?: (
    kind: import("@/lib/ai-core/image-engine/slots").ImageSlotKind,
    index: number,
    preferred?: string | null,
  ) => string | null;
  slotImages?: (
    kind: import("@/lib/ai-core/image-engine/slots").ImageSlotKind,
  ) => readonly string[];
};



export function createSiteImageDeps(

  parsed: ParsedSiteImages | null,

  heroImageUrl?: string | null,

): SiteImageDeps {

  if (parsed) {

    const pool = siteImagePool(parsed);

    const hero = parsed.HERO_IMAGE || pool[0] || null;



    return {

      HERO_IMAGE: hero,

      PRODUCT_IMAGE: parsed.PRODUCT_IMAGE,

      SERVICE_IMAGE: parsed.SERVICE_IMAGE,

      BACKGROUND_IMAGE: parsed.BACKGROUND_IMAGE,

      GALLERY_IMAGES:

        parsed.GALLERY_IMAGES.length > 0

          ? parsed.GALLERY_IMAGES

          : pool.length > 0

            ? pool

            : [],

      SECTION_IMAGES:

        parsed.SECTION_IMAGES.length > 0

          ? parsed.SECTION_IMAGES

          : pool.length > 0

            ? pool

            : [],

      TESTIMONIAL_IMAGES:

        parsed.TESTIMONIAL_IMAGES.length > 0

          ? parsed.TESTIMONIAL_IMAGES

          : pool.length > 0

            ? pool

            : [],

      resolveSiteImage(primary: string | null | undefined, index: number) {
        if (primary?.trim()) return normalizePremiumStockUrl(primary.trim());
        if (!pool.length) return hero;
        return pool[index % pool.length] ?? hero;
      },
      resolveSlotImage(
        kind: import("@/lib/ai-core/image-engine/slots").ImageSlotKind,
        index: number,
        preferred?: string | null,
      ) {
        if (preferred?.trim()) return normalizePremiumStockUrl(preferred.trim());
        return canonicalResolveSlotImage(kind, index, preferred) || hero;
      },
      slotImages: canonicalSlotImages,

    };

  }



  return createSiteImageStubs(heroImageUrl);

}



/** @deprecated Prefer createSiteImageDeps with parsed lib/site-images.ts */

export function createSiteImageStubs(heroImageUrl: string | null | undefined) {

  const hero = heroImageUrl?.trim() || CANONICAL_HERO || null;

  const pool = canonicalSiteImagePool();

  const gallery =

    CANONICAL_GALLERY.length > 0

      ? [...CANONICAL_GALLERY]

      : hero

        ? [hero, hero, hero, hero, hero, hero]

        : ([] as string[]);

  const sections =

    CANONICAL_SECTIONS.length > 0

      ? [...CANONICAL_SECTIONS]

      : hero

        ? [hero, hero, hero]

        : ([] as string[]);



  return {

    HERO_IMAGE: hero,

    PRODUCT_IMAGE: hero || CANONICAL_PRODUCT,

    SERVICE_IMAGE: hero || CANONICAL_SERVICE,

    BACKGROUND_IMAGE: hero || CANONICAL_BACKGROUND,

    GALLERY_IMAGES: gallery,

    SECTION_IMAGES: sections,

    TESTIMONIAL_IMAGES:

      CANONICAL_TESTIMONIALS.length > 0 ? [...CANONICAL_TESTIMONIALS] : gallery,

    resolveSiteImage(
      primary: string | null | undefined,
      index: number,
    ): string | null {
      if (primary?.trim()) return normalizePremiumStockUrl(primary.trim());
      if (!pool.length) return hero;
      return pool[index % pool.length] ?? hero;
    },
    resolveSlotImage(
      kind: import("@/lib/ai-core/image-engine/slots").ImageSlotKind,
      index: number,
      preferred?: string | null,
    ) {
      if (preferred?.trim()) return normalizePremiumStockUrl(preferred.trim());
      return canonicalResolveSlotImage(kind, index, preferred) || hero;
    },
    slotImages: canonicalSlotImages,

  };

}



export function createSiteImageDepsFromFiles(

  files?: Array<{ path: string; content: string }>,

  heroImageUrl?: string | null,

): SiteImageDeps {

  const parsed = parseSiteImagesFromFiles(files);

  const deps = createSiteImageDeps(parsed, heroImageUrl);

  if (!deps.HERO_IMAGE && deps.SECTION_IMAGES.length === 0) {

    return createSiteImageDeps(null, heroImageUrl ?? CANONICAL_HERO);

  }

  return deps;

}


