import { normalizePremiumStockUrl } from "@/lib/ai-core/image-engine/stock";
import type { ParsedSiteImages } from "@/lib/website/site-images-parser";
import { parseSiteImagesFromFiles, siteImagePool } from "@/lib/website/site-images-parser";
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
  GALLERY_IMAGES: string[];
  SECTION_IMAGES: string[];
  resolveSiteImage: (
    primary: string | null | undefined,
    index: number,
  ) => string | null;
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
      resolveSiteImage(primary: string | null | undefined, index: number) {
        if (primary?.trim()) return normalizePremiumStockUrl(primary.trim());
        if (!pool.length) return hero;
        return pool[index % pool.length] ?? hero;
      },
    };
  }

  return createSiteImageStubs(heroImageUrl);
}

/** @deprecated Prefer createSiteImageDeps with parsed lib/site-images.ts */
export function createSiteImageStubs(heroImageUrl: string | null | undefined) {
  const hero = heroImageUrl?.trim() || null;
  const gallery = hero
    ? [hero, hero, hero, hero, hero, hero]
    : ([] as string[]);
  const sections = hero ? [hero, hero, hero] : ([] as string[]);

  return {
    HERO_IMAGE: hero,
    GALLERY_IMAGES: gallery,
    SECTION_IMAGES: sections,
    resolveSiteImage(
      primary: string | null | undefined,
      _index: number,
    ): string | null {
      if (primary?.trim()) return normalizePremiumStockUrl(primary.trim());
      return hero;
    },
  };
}

export function createSiteImageDepsFromFiles(
  files?: Array<{ path: string; content: string }>,
  heroImageUrl?: string | null,
): SiteImageDeps {
  return createSiteImageDeps(parseSiteImagesFromFiles(files), heroImageUrl);
}
