import { optimizeImageUrl } from "@/lib/ai-core/image-engine/optimize";
import type { ImageSlotKind } from "@/lib/ai-core/image-engine/slots";
import { slotImages } from "@/lib/site-images";

/**
 * Resolve a URL for a semantic slot only — never falls back to other slots or the global pool.
 * Returns empty string when the slot has no image at the given index.
 */
export function resolveSlotImageStrict(
  kind: ImageSlotKind,
  index = 0,
  preferred?: string | null,
): string {
  if (preferred?.trim()) return optimizeImageUrl(preferred.trim());
  const images = slotImages(kind).filter(Boolean);
  const url = images[index];
  return url ? optimizeImageUrl(url) : "";
}

/** Non-empty URLs for a slot. */
export function slotImageList(kind: ImageSlotKind): readonly string[] {
  return slotImages(kind).filter(Boolean);
}

/** True when running inside the Website Builder editor (not production export). */
export function isBuilderEditorContext(): boolean {
  if (typeof window === "undefined") return false;
  if (document.documentElement.getAttribute("data-wb-editor") === "true") {
    return true;
  }
  try {
    if (window.parent !== window) {
      return window.parent.location.pathname.includes("/website-builder");
    }
  } catch {
    return true;
  }
  return window.location.pathname.includes("/website-builder");
}

export const SLOT_LABELS: Record<ImageSlotKind, string> = {
  hero: "Hero",
  gallery: "Gallery",
  about: "About",
  features: "Features",
  team: "Team",
  products: "Products",
  testimonials: "Testimonials",
  backgrounds: "Background",
  cta: "CTA",
};
