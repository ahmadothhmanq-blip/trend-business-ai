/** Emit a production-ready lib/site-images.ts for V2 template apply (blank slots). */
export function buildDefaultSiteImagesSource(packageId: string): string {
  const empty: readonly string[] = [];

  return `/** Auto-generated site images — ${packageId} · blank slots */
export const HERO_IMAGE: string = "";
export const PRODUCT_IMAGE: string = "";
export const SERVICE_IMAGE: string = "";
export const BACKGROUND_IMAGE: string = "";
export const ABOUT_IMAGE: string = "";
export const BRAND_IMAGE: string = "";
export const SECTION_IMAGES = ${JSON.stringify(empty)} as const;
export const FEATURE_IMAGES = ${JSON.stringify(empty)} as const;
export const TEAM_IMAGES = ${JSON.stringify(empty)} as const;
export const GALLERY_IMAGES = ${JSON.stringify(empty)} as const;
export const TESTIMONIAL_IMAGES = ${JSON.stringify(empty)} as const;
export type ImageSlotKind = "hero" | "gallery" | "about" | "features" | "team" | "products" | "testimonials" | "backgrounds" | "cta";
export const SITE_IMAGES = [] as const;
export function slotImages(kind: ImageSlotKind): readonly string[] {
  switch (kind) {
    case "hero": return [];
    case "gallery": return GALLERY_IMAGES;
    case "about": return SECTION_IMAGES;
    case "features": return FEATURE_IMAGES;
    case "team": return TEAM_IMAGES;
    case "products": return [];
    case "testimonials": return TESTIMONIAL_IMAGES;
    case "backgrounds": return [];
    case "cta": return [];
    default: return [];
  }
}
export function imageByRole(role: string): string | null {
  const hit = SITE_IMAGES.find((item) => item.role === role);
  return hit?.url ?? null;
}
export function siteImagePool(): string[] {
  return [];
}
export function resolveSlotImage(kind: ImageSlotKind, index = 0, preferred?: string | null): string {
  if (preferred?.trim()) return preferred.trim();
  const images = slotImages(kind);
  return images[index] ?? "";
}
export function resolveSiteImage(preferred?: string | null, index = 0): string {
  if (preferred?.trim()) return preferred.trim();
  return "";
}
`;
}
