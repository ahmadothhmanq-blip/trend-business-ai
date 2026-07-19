import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { CoreAssetManifest } from "@/lib/ai-core/layers/types";
import { preferAiImages } from "@/lib/ai-core/image-engine/prefer";
import {
  isPremiumStockUrl,
  resolvePremiumStockUrl,
} from "@/lib/ai-core/image-engine/stock";
import { buildSiteVideoModule } from "@/lib/ai-core/image-engine/video";

const SITE_IMAGES_PATH = "lib/site-images.ts";
const SITE_VIDEOS_PATH = "lib/site-videos.ts";

const PLACEHOLDER_URL_RE =
  /(?:https?:\/\/(?:placehold\.co|via\.placeholder\.com|picsum\.photos|dummyimage\.com)[^\s"'`)]+|\/placeholder(?:[-_/][^\s"'`)]*)?|data:image\/svg\+xml[^"'`]*)/gi;

const EMPTY_IMG_SRC_RE = /(<img\b[^>]*\bsrc\s*=\s*)(["'])\2/gi;

const REQUIRED_PHOTO_ROLES = [
  "hero",
  "product",
  "service",
  "background",
  "section",
  "gallery",
  "testimonial",
] as const;

/**
 * Emit a typed site image map and strip placeholder / empty image slots
 * when real photographic URLs exist.
 */
export function injectAiImagesIntoProject(params: {
  files: GeneratedProjectFile[];
  assetManifest: CoreAssetManifest;
  industry?: string | null;
}): GeneratedProjectFile[] {
  const manifest = ensureRequiredPhotoAssets(
    preferAiImages(params.assetManifest),
    params.industry,
  );
  const byRole = groupByRole(manifest);
  const hero = firstUrl(byRole, "hero");
  const product = firstUrl(byRole, "product");
  const service = firstUrl(byRole, "service");
  const background = firstUrl(byRole, "background");
  const brand = firstUrl(byRole, "brand");
  const sections = urlsForRole(byRole, "section");
  const gallery = urlsForRole(byRole, "gallery");
  const testimonials = urlsForRole(byRole, "testimonial");

  const hasPhotos = manifest.items.some(
    (i) =>
      Boolean(i.url) &&
      !i.url!.startsWith("data:image/svg") &&
      (i.status === "generated" ||
        i.metadata?.provider === "premium-stock" ||
        isPremiumStockUrl(i.url)),
  );

  const siteImagesSource = buildSiteImagesModule({
    hero,
    product,
    service,
    background,
    brand,
    sections,
    gallery,
    testimonials,
    items: manifest.items,
  });

  const out: GeneratedProjectFile[] = [];
  let sawSiteImages = false;
  let sawSiteVideos = false;

  for (const file of params.files) {
    if (file.path === SITE_IMAGES_PATH || file.path === "lib/site-images.js") {
      sawSiteImages = true;
      out.push({
        ...file,
        path: SITE_IMAGES_PATH,
        content: siteImagesSource,
        language: "typescript",
      });
      continue;
    }
    if (file.path === SITE_VIDEOS_PATH || file.path === "lib/site-videos.js") {
      sawSiteVideos = true;
      if (manifest.videoPackage) {
        out.push({
          ...file,
          path: SITE_VIDEOS_PATH,
          content: buildSiteVideoModule(manifest.videoPackage),
          language: "typescript",
        });
        continue;
      }
    }

    let content = file.content;
    if (hasPhotos && /\.(tsx?|jsx?)$/.test(file.path)) {
      content = rewritePlaceholders(content, {
        hero,
        product,
        service,
        background,
        sections,
        gallery,
        testimonials,
      });
      content = fillEmptyImageSrcs(content, {
        hero,
        product,
        service,
        background,
        sections,
        gallery,
        testimonials,
      });
      // Strip decorative empty gradient-only hero branches when we have photos
      content = content.replace(
        /\{!src \? \(\s*<div className="[^"]*bg-gradient-hero[^"]*"[^>]*\/>\s*\) : null\}/g,
        "",
      );
    }
    out.push({ ...file, content });
  }

  if (!sawSiteImages) {
    out.push({
      path: SITE_IMAGES_PATH,
      content: siteImagesSource,
      language: "typescript",
    });
  }
  if (!sawSiteVideos && manifest.videoPackage) {
    out.push({
      path: SITE_VIDEOS_PATH,
      content: buildSiteVideoModule(manifest.videoPackage),
      language: "typescript",
    });
  }

  return out;
}

function isPhotographicUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (
    url.startsWith("data:image/svg") ||
    url.includes("image/svg+xml") ||
    /placehold\.co|via\.placeholder|picsum\.photos|dummyimage/i.test(url)
  ) {
    return false;
  }
  return true;
}

/**
 * Guarantee hero / service / product / background / section / gallery /
 * testimonial URLs exist so components never render empty visual areas.
 * Uses premium stock only — never SVG placeholders for photos.
 */
export function ensureRequiredPhotoAssets(
  manifest: CoreAssetManifest,
  industry?: string | null,
): CoreAssetManifest {
  const items = [...manifest.items];

  // Replace SVG / generic placeholders with premium stock photography.
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i]!;
    if (item.role === "icon") continue;
    if (isPhotographicUrl(item.url)) continue;
    items[i] = {
      ...item,
      url: resolvePremiumStockUrl({
        industry,
        role: item.role,
        seed: item.id,
      }),
      status: "generated",
      mimeType: "image/jpeg",
      metadata: {
        ...item.metadata,
        purpose: (item.metadata?.purpose || item.role) as "hero",
        provider: "premium-stock",
        style: item.metadata?.style || "premium-stock",
        prompt:
          item.metadata?.prompt ||
          item.prompt ||
          `Premium ${item.role} photography for website`,
      },
    };
  }

  for (const role of REQUIRED_PHOTO_ROLES) {
    const haveCount = items.filter(
      (i) => i.role === role && isPhotographicUrl(i.url),
    ).length;
    const need =
      role === "section" || role === "gallery"
        ? 3
        : role === "testimonial"
          ? 2
          : 1;
    for (let i = haveCount; i < need; i += 1) {
      const id = need === 1 ? role : `${role}-${i + 1}`;
      if (items.some((item) => item.id === id && isPhotographicUrl(item.url))) {
        continue;
      }
      const url = resolvePremiumStockUrl({
        industry,
        role,
        seed: `${id}-${industry || "business"}`,
      });
      items.push({
        id,
        role,
        name: `${role} image ${need === 1 ? "" : i + 1}`.trim(),
        prompt: `Premium ${role} photography for website — industry ${industry || "business"}`,
        alt: `Premium ${role} photography`,
        url,
        storagePath: null,
        status: "generated",
        mimeType: "image/jpeg",
        metadata: {
          purpose: role as "hero",
          provider: "premium-stock",
          style: "premium-stock",
          prompt: `Premium ${role} photography for website`,
        },
      });
    }
  }

  return {
    ...manifest,
    engine: manifest.engine || "ai-assets-engine",
    items,
  };
}

/** True when the project has a real hero photo URL (not empty / SVG). */
export function hasPublishableHeroImage(manifest: CoreAssetManifest): boolean {
  return manifest.items.some(
    (i) =>
      i.role === "hero" &&
      Boolean(i.url) &&
      !i.url!.startsWith("data:image/svg") &&
      i.mimeType !== "image/svg+xml",
  );
}

function groupByRole(manifest: CoreAssetManifest) {
  const map = new Map<string, typeof manifest.items>();
  for (const item of manifest.items) {
    const list = map.get(item.role) ?? [];
    list.push(item);
    map.set(item.role, list);
  }
  return map;
}

function firstUrl(
  byRole: Map<string, CoreAssetManifest["items"]>,
  role: string,
): string | null {
  const item = byRole.get(role)?.find((i) => i.url);
  return item?.url ?? null;
}

function urlsForRole(
  byRole: Map<string, CoreAssetManifest["items"]>,
  role: string,
): string[] {
  return (byRole.get(role) ?? [])
    .map((i) => i.url)
    .filter((u): u is string => Boolean(u));
}

function buildSiteImagesModule(params: {
  hero: string | null;
  product: string | null;
  service: string | null;
  background: string | null;
  brand: string | null;
  sections: string[];
  gallery: string[];
  testimonials: string[];
  items: CoreAssetManifest["items"];
}): string {
  const meta = params.items.map((item) => ({
    id: item.id,
    role: item.role,
    name: item.name,
    alt: item.alt,
    url: item.url,
    status: item.status,
    purpose: item.metadata?.purpose ?? item.role,
    section: item.metadata?.section,
    style: item.metadata?.style,
    prompt: item.metadata?.prompt ?? item.prompt,
    provider: item.metadata?.provider,
    artDirection: item.metadata?.artDirection,
  }));

  // Never export null for primary roles when any photo exists in the pool.
  const pool = [
    params.hero,
    params.product,
    params.service,
    params.background,
    ...params.sections,
    ...params.gallery,
    ...params.testimonials,
  ].filter((u): u is string => Boolean(u));
  const fallback = pool[0] ?? null;
  const hero = params.hero || fallback;
  const product = params.product || params.hero || fallback;
  const service = params.service || params.product || fallback;
  const background = params.background || params.hero || fallback;
  const sections =
    params.sections.length > 0
      ? params.sections
      : ([service, product, hero].filter(Boolean) as string[]);
  const gallery =
    params.gallery.length > 0
      ? params.gallery
      : ([product, hero, service].filter(Boolean) as string[]);
  const testimonials =
    params.testimonials.length > 0
      ? params.testimonials
      : ([hero, product].filter(Boolean) as string[]);

  return `/**
 * Advanced AI Assets Engine — generated site imagery.
 * Prefer these URLs over placeholders in components.
 * Never leave empty visual areas — resolveSiteImage always returns a photo URL when available.
 */

export const HERO_IMAGE = ${JSON.stringify(hero)};
export const PRODUCT_IMAGE = ${JSON.stringify(product)};
export const SERVICE_IMAGE = ${JSON.stringify(service)};
export const BACKGROUND_IMAGE = ${JSON.stringify(background)};
export const BRAND_IMAGE = ${JSON.stringify(params.brand || hero)};
export const SECTION_IMAGES = ${JSON.stringify(sections)} as const;
export const GALLERY_IMAGES = ${JSON.stringify(gallery)} as const;
export const TESTIMONIAL_IMAGES = ${JSON.stringify(testimonials)} as const;

export type SiteImageMeta = {
  id: string;
  role: string;
  name: string;
  alt: string;
  url: string | null;
  status: string;
  purpose?: string;
  section?: string;
  style?: string;
  prompt?: string;
  provider?: string;
  artDirection?: string;
};

export const SITE_IMAGES: SiteImageMeta[] = ${JSON.stringify(meta, null, 2)};

export function siteImagePool(): string[] {
  return [
    HERO_IMAGE,
    PRODUCT_IMAGE,
    SERVICE_IMAGE,
    BACKGROUND_IMAGE,
    ...SECTION_IMAGES,
    ...GALLERY_IMAGES,
    ...TESTIMONIAL_IMAGES,
  ].filter((u): u is string => Boolean(u));
}

export function imageByRole(role: string): string | null {
  const hit = SITE_IMAGES.find((i) => i.role === role && i.url);
  return hit?.url ?? null;
}

/** Resolve a photographic URL for a slot — never returns empty string when pool has images. */
export function resolveSiteImage(
  preferred?: string | null,
  index = 0,
): string {
  if (preferred) return preferred;
  const pool = siteImagePool();
  if (!pool.length) return "";
  return pool[index % pool.length]!;
}
`;
}

function photoPool(urls: {
  hero: string | null;
  product: string | null;
  service: string | null;
  background: string | null;
  sections: string[];
  gallery: string[];
  testimonials?: string[];
}): string[] {
  return [
    urls.hero,
    ...urls.gallery,
    ...urls.sections,
    ...(urls.testimonials ?? []),
    urls.product,
    urls.service,
    urls.background,
  ].filter((u): u is string => Boolean(u));
}

function rewritePlaceholders(
  content: string,
  urls: {
    hero: string | null;
    product: string | null;
    service: string | null;
    background: string | null;
    sections: string[];
    gallery: string[];
    testimonials?: string[];
  },
): string {
  const pool = photoPool(urls);
  if (!pool.length) return content;

  if (!PLACEHOLDER_URL_RE.test(content)) {
    PLACEHOLDER_URL_RE.lastIndex = 0;
  } else {
    PLACEHOLDER_URL_RE.lastIndex = 0;
    let index = 0;
    content = content.replace(PLACEHOLDER_URL_RE, () => {
      const next = pool[index % pool.length]!;
      index += 1;
      return next;
    });
  }

  return content;
}

function fillEmptyImageSrcs(
  content: string,
  urls: {
    hero: string | null;
    product: string | null;
    service: string | null;
    background: string | null;
    sections: string[];
    gallery: string[];
    testimonials?: string[];
  },
): string {
  const pool = photoPool(urls);
  if (!pool.length) return content;

  let index = 0;
  EMPTY_IMG_SRC_RE.lastIndex = 0;
  return content.replace(EMPTY_IMG_SRC_RE, (_match, prefix: string, quote: string) => {
    const next = pool[index % pool.length]!;
    index += 1;
    return `${prefix}${quote}${next}${quote}`;
  });
}
