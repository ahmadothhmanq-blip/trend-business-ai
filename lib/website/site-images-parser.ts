import { normalizePremiumStockUrl } from "@/lib/ai-core/image-engine/stock";
import type { GeneratedProjectFile } from "@/lib/ai/types";

export type ParsedSiteImages = {
  HERO_IMAGE: string | null;
  PRODUCT_IMAGE: string | null;
  SERVICE_IMAGE: string | null;
  BACKGROUND_IMAGE: string | null;
  GALLERY_IMAGES: string[];
  SECTION_IMAGES: string[];
  TESTIMONIAL_IMAGES: string[];
};

function parseStringExport(source: string, name: string): string | null {
  const match = source.match(
    new RegExp(
      `export const ${name} = ("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|null)`,
    ),
  );
  if (!match?.[1] || match[1] === "null") return null;
  try {
    return JSON.parse(match[1]) as string;
  } catch {
    return null;
  }
}

function parseStringArrayExport(source: string, name: string): string[] {
  const match = source.match(
    new RegExp(`export const ${name} = (\\[[\\s\\S]*?\\]) as const`),
  );
  if (!match?.[1]) return [];
  try {
    const parsed = JSON.parse(match[1]) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((value): value is string => typeof value === "string")
      .map((url) => normalizePremiumStockUrl(url))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function normalizeNullable(url: string | null): string | null {
  if (!url?.trim()) return null;
  return normalizePremiumStockUrl(url.trim());
}

/** Parse generated `lib/site-images.ts` exports for preview / export consumers. */
export function parseSiteImagesModule(
  source: string | null | undefined,
): ParsedSiteImages | null {
  if (!source?.trim()) return null;

  const HERO_IMAGE = normalizeNullable(parseStringExport(source, "HERO_IMAGE"));
  const PRODUCT_IMAGE = normalizeNullable(
    parseStringExport(source, "PRODUCT_IMAGE"),
  );
  const SERVICE_IMAGE = normalizeNullable(
    parseStringExport(source, "SERVICE_IMAGE"),
  );
  const BACKGROUND_IMAGE = normalizeNullable(
    parseStringExport(source, "BACKGROUND_IMAGE"),
  );
  const GALLERY_IMAGES = parseStringArrayExport(source, "GALLERY_IMAGES");
  const SECTION_IMAGES = parseStringArrayExport(source, "SECTION_IMAGES");
  const TESTIMONIAL_IMAGES = parseStringArrayExport(source, "TESTIMONIAL_IMAGES");

  const hasAny =
    HERO_IMAGE ||
    PRODUCT_IMAGE ||
    SERVICE_IMAGE ||
    BACKGROUND_IMAGE ||
    GALLERY_IMAGES.length > 0 ||
    SECTION_IMAGES.length > 0 ||
    TESTIMONIAL_IMAGES.length > 0;

  if (!hasAny) return null;

  return {
    HERO_IMAGE,
    PRODUCT_IMAGE,
    SERVICE_IMAGE,
    BACKGROUND_IMAGE,
    GALLERY_IMAGES,
    SECTION_IMAGES,
    TESTIMONIAL_IMAGES,
  };
}

export function findSiteImagesSource(
  files?: Array<{ path: string; content: string }>,
): string | null {
  const match = files?.find((file) => {
    const path = file.path.replaceAll("\\", "/");
    return path === "lib/site-images.ts" || path === "lib/site-images.js";
  });
  return match?.content ?? null;
}

export function parseSiteImagesFromFiles(
  files?: Array<{ path: string; content: string }>,
): ParsedSiteImages | null {
  return parseSiteImagesModule(findSiteImagesSource(files));
}

/** Rewrite all Unsplash URLs inside generated site-images source. */
export function remediateSiteImagesContent(source: string): string {
  return source.replace(
    /https:\/\/images\.unsplash\.com\/[^\s"'`]+/g,
    (url) => normalizePremiumStockUrl(url),
  );
}

export function remediateSiteImagesInFiles(
  files: GeneratedProjectFile[],
): GeneratedProjectFile[] {
  return files.map((file) => {
    const path = file.path.replaceAll("\\", "/");
    if (path !== "lib/site-images.ts" && path !== "lib/site-images.js") {
      return file;
    }
    return {
      ...file,
      content: remediateSiteImagesContent(file.content),
    };
  });
}

export function siteImagePool(parsed: ParsedSiteImages): string[] {
  return [
    parsed.HERO_IMAGE,
    parsed.PRODUCT_IMAGE,
    parsed.SERVICE_IMAGE,
    parsed.BACKGROUND_IMAGE,
    ...parsed.SECTION_IMAGES,
    ...parsed.GALLERY_IMAGES,
    ...parsed.TESTIMONIAL_IMAGES,
  ].filter((url): url is string => Boolean(url));
}
