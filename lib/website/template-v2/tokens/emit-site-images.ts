import { buildSlotsFromProfile } from "@/lib/ai-core/image-engine/profile-engine";
import { slotUrls } from "@/lib/ai-core/image-engine/slots";

const PACKAGE_INDUSTRY: Record<string, string> = {
  "saas-enterprise": "saas",
  "corporate-business": "corporate",
  "restaurant-premium": "restaurant",
  "restaurant-signature": "restaurant",
  "real-estate-premium": "real-estate",
  "real-estate-prestige": "real-estate",
  "medical-premium": "medical",
  "creative-agency-premium": "creative-agency",
  "creative-portfolio": "creative-agency",
  "hotel-resort-premium": "hotel",
  "finance-premium": "finance",
  "education-premium": "education",
  "ecommerce-premium": "ecommerce",
};

/** Emit a production-ready lib/site-images.ts for V2 template apply (industry profile slots). */
export function buildDefaultSiteImagesSource(packageId: string): string {
  const industry = PACKAGE_INDUSTRY[packageId] ?? "corporate";
  const { slots } = buildSlotsFromProfile(
    { industry, routingIndustryId: industry },
    { projectSeed: packageId },
  );

  const hero = slotUrls(slots, "hero")[0] ?? "";
  const product = slotUrls(slots, "products")[0] ?? hero;
  const service = slotUrls(slots, "features")[0] ?? product;
  const background = slotUrls(slots, "backgrounds")[0] ?? hero;
  const about = slotUrls(slots, "about");
  const features = slotUrls(slots, "features");
  const team = slotUrls(slots, "team");
  const gallery = slotUrls(slots, "gallery");
  const testimonial = slotUrls(slots, "testimonials");

  return `/** Auto-generated site images — ${packageId} · Image Engine */
export const HERO_IMAGE: string = ${JSON.stringify(hero)};
export const PRODUCT_IMAGE: string = ${JSON.stringify(product)};
export const SERVICE_IMAGE: string = ${JSON.stringify(service)};
export const BACKGROUND_IMAGE: string = ${JSON.stringify(background)};
export const ABOUT_IMAGE: string = ${JSON.stringify(about[0] ?? hero)};
export const BRAND_IMAGE: string = HERO_IMAGE;
export const SECTION_IMAGES = ${JSON.stringify(about)} as const;
export const FEATURE_IMAGES = ${JSON.stringify(features)} as const;
export const TEAM_IMAGES = ${JSON.stringify(team)} as const;
export const GALLERY_IMAGES = ${JSON.stringify(gallery)} as const;
export const TESTIMONIAL_IMAGES = ${JSON.stringify(testimonial)} as const;
export type ImageSlotKind = "hero" | "gallery" | "about" | "features" | "team" | "products" | "testimonials" | "backgrounds";
export const SITE_IMAGES = [
  { id: "hero", role: "hero", slot: "hero", name: "Hero", alt: "Hero photography", url: HERO_IMAGE, status: "generated" },
  { id: "product", role: "product", slot: "products", name: "Product", alt: "Product photography", url: PRODUCT_IMAGE, status: "generated" },
] as const;
export function slotImages(kind: ImageSlotKind): readonly string[] {
  switch (kind) {
    case "hero": return [HERO_IMAGE];
    case "gallery": return GALLERY_IMAGES;
    case "about": return SECTION_IMAGES.length ? SECTION_IMAGES : [ABOUT_IMAGE];
    case "features": return FEATURE_IMAGES;
    case "team": return TEAM_IMAGES;
    case "products": return [PRODUCT_IMAGE, ...GALLERY_IMAGES];
    case "testimonials": return TESTIMONIAL_IMAGES;
    case "backgrounds": return [BACKGROUND_IMAGE];
    default: return [HERO_IMAGE];
  }
}
export function imageByRole(role: string): string | null {
  const hit = SITE_IMAGES.find((item) => item.role === role);
  return hit?.url ?? null;
}
export function siteImagePool(): string[] {
  return [HERO_IMAGE, PRODUCT_IMAGE, SERVICE_IMAGE, BACKGROUND_IMAGE, ABOUT_IMAGE, ...SECTION_IMAGES, ...FEATURE_IMAGES, ...TEAM_IMAGES, ...GALLERY_IMAGES, ...TESTIMONIAL_IMAGES].filter(Boolean);
}
export function resolveSlotImage(kind: ImageSlotKind, index = 0, preferred?: string | null): string {
  if (preferred?.trim()) return preferred.trim();
  const images = slotImages(kind);
  return images[index % images.length] ?? "";
}
export function resolveSiteImage(preferred?: string | null, index = 0): string {
  if (preferred?.trim()) return preferred.trim();
  const pool = siteImagePool();
  return pool[index % pool.length] ?? "";
}
`;
}
