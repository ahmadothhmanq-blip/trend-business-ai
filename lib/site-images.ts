/**
 * Canonical site image exports for template packages and builder preview.
 * Generated projects receive a per-site `lib/site-images.ts` from the Image Engine;
 * this module supplies the same public API with industry-aware stock defaults.
 *
 * Templates must use semantic slots only — no cross-slot fallbacks in resolveSlotImage.
 */
import { buildSlotsFromProfile } from "@/lib/ai-core/image-engine/profile-engine";
import { optimizeImageUrl, optimizePhotoUrlForRole } from "@/lib/ai-core/image-engine/optimize";
import { slotUrls, type ImageSlotKind } from "@/lib/ai-core/image-engine/slots";

export type { ImageSlotKind } from "@/lib/ai-core/image-engine/slots";

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
  slot?: ImageSlotKind;
  objectPosition?: string;
  crop?: { x: number; y: number; width: number; height: number };
  isUserOverride?: boolean;
};

const DEFAULT_SLOTS = buildSlotsFromProfile({ industry: "business" }).slots;

function list(kind: ImageSlotKind): readonly string[] {
  return slotUrls(DEFAULT_SLOTS, kind);
}

function first(kind: ImageSlotKind): string {
  return list(kind)[0] ?? "";
}

export const HERO_IMAGE: string = first("hero");
export const PRODUCT_IMAGE: string = first("products");
export const SERVICE_IMAGE: string = first("features");
export const BACKGROUND_IMAGE: string = first("backgrounds");
export const ABOUT_IMAGE: string = first("about");
export const BRAND_IMAGE: string = HERO_IMAGE;
export const SECTION_IMAGES = list("about") as readonly string[];
export const FEATURE_IMAGES = list("features") as readonly string[];
export const TEAM_IMAGES = list("team") as readonly string[];
export const GALLERY_IMAGES = list("gallery") as readonly string[];
export const TESTIMONIAL_IMAGES = list("testimonials") as readonly string[];
export const CTA_IMAGES = list("cta") as readonly string[];

export const SITE_IMAGES: SiteImageMeta[] = [
  {
    id: "hero",
    role: "hero",
    name: "Hero",
    alt: "Premium hero photography",
    url: HERO_IMAGE || null,
    status: "generated",
    purpose: "hero",
    slot: "hero",
    provider: "premium-stock",
  },
  {
    id: "product",
    role: "product",
    name: "Product",
    alt: "Premium product photography",
    url: PRODUCT_IMAGE || null,
    status: "generated",
    purpose: "product",
    slot: "products",
    provider: "premium-stock",
  },
];

export function siteImagePool(): string[] {
  return [
    ...list("hero"),
    ...list("gallery"),
    ...list("about"),
    ...list("features"),
    ...list("team"),
    ...list("products"),
    ...list("testimonials"),
    ...list("backgrounds"),
    ...list("cta"),
  ].filter(Boolean);
}

export function imageByRole(role: string): string | null {
  const hit = SITE_IMAGES.find((item) => item.role === role && item.url);
  return hit?.url ?? null;
}

/** URLs for a single semantic slot — no cross-slot mixing. */
export function slotImages(kind: ImageSlotKind): readonly string[] {
  return list(kind);
}

/**
 * Resolve a photographic URL for a semantic slot.
 * Preferred URL (user override / prop) takes priority.
 * Returns empty string when the slot has no image — templates must handle empty state.
 */
export function resolveSlotImage(
  kind: ImageSlotKind,
  index = 0,
  preferred?: string | null,
): string {
  if (preferred?.trim()) {
    return optimizePhotoUrlForRole(preferred.trim(), kind);
  }
  const images = slotImages(kind).filter(Boolean);
  const url = images[index];
  return url ? optimizePhotoUrlForRole(url, kind) : "";
}

/** Legacy pool resolver — prefer resolveSlotImage for templates. */
export function resolveSiteImage(
  preferred?: string | null,
  index = 0,
): string {
  if (preferred?.trim()) {
    return optimizePhotoUrlForRole(preferred.trim(), index === 0 ? "hero" : "section");
  }
  const pool = siteImagePool();
  if (!pool.length) return "";
  return optimizePhotoUrlForRole(pool[index % pool.length]!, "section");
}

export { optimizeImageUrl };
