/**
 * Semantic image slots — decouple V2 templates from hardcoded photography.
 * Every generated website resolves imagery through these slot kinds.
 */

export const IMAGE_SLOT_KINDS = [
  "hero",
  "gallery",
  "about",
  "features",
  "team",
  "products",
  "testimonials",
  "backgrounds",
  "cta",
] as const;

export type ImageSlotKind = (typeof IMAGE_SLOT_KINDS)[number];

/** Minimum slot counts for agency-grade website coverage. */
export const SLOT_MIN_COUNTS: Record<ImageSlotKind, number> = {
  hero: 1,
  gallery: 12,
  about: 3,
  features: 6,
  team: 4,
  products: 8,
  testimonials: 4,
  backgrounds: 4,
  cta: 2,
};

export type ImageSlotAssignment = {
  id: string;
  kind: ImageSlotKind;
  url: string;
  alt: string;
  aspectRatio?: string;
  industryId?: string;
  provider?: string;
  allowReuse?: boolean;
  sourceTier?: "user" | "ai" | "library" | "stock";
  isUserOverride?: boolean;
};

export type SiteImageSlotMap = Record<ImageSlotKind, ImageSlotAssignment[]>;

export function emptySlotMap(): SiteImageSlotMap {
  return {
    hero: [],
    gallery: [],
    about: [],
    features: [],
    team: [],
    products: [],
    testimonials: [],
    backgrounds: [],
    cta: [],
  };
}

/** Map legacy CoreAssetRole values to semantic slots. */
export function roleToSlotKind(role: string): ImageSlotKind {
  switch (role) {
    case "hero":
    case "brand":
      return "hero";
    case "gallery":
      return "gallery";
    case "product":
      return "products";
    case "testimonial":
      return "testimonials";
    case "background":
      return "backgrounds";
    case "service":
      return "features";
    case "section":
    default:
      return "about";
  }
}

export function slotKindToLegacyRole(kind: ImageSlotKind): string {
  switch (kind) {
    case "hero":
      return "hero";
    case "gallery":
      return "gallery";
    case "products":
      return "product";
    case "testimonials":
      return "testimonial";
    case "backgrounds":
      return "background";
    case "features":
      return "service";
    case "about":
    case "team":
      return "section";
    default:
      return "section";
  }
}

export function flattenSlotUrls(map: SiteImageSlotMap): string[] {
  const urls: string[] = [];
  for (const kind of IMAGE_SLOT_KINDS) {
    for (const slot of map[kind]) {
      if (slot.url && !urls.includes(slot.url)) {
        urls.push(slot.url);
      }
    }
  }
  return urls;
}

export function pickSlotUrl(
  map: SiteImageSlotMap,
  kind: ImageSlotKind,
  index = 0,
  preferred?: string | null,
): string {
  if (preferred?.trim()) return preferred.trim();
  const list = map[kind];
  if (list.length > 0) {
    return list[index % list.length]!.url;
  }
  for (const fallbackKind of IMAGE_SLOT_KINDS) {
    const fallback = map[fallbackKind];
    if (fallback.length > 0) {
      return fallback[index % fallback.length]!.url;
    }
  }
  return "";
}

export function slotUrls(map: SiteImageSlotMap, kind: ImageSlotKind): string[] {
  return map[kind].map((s) => s.url).filter(Boolean);
}
