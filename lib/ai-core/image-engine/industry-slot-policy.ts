import { resolveStockIndustryId, listStockPhotoIds } from "@/lib/ai-core/image-engine/stock";
import {
  IMAGE_SLOT_KINDS,
  SLOT_MIN_COUNTS,
  type ImageSlotKind,
} from "@/lib/ai-core/image-engine/slots";
import type { ImageProfileContext } from "@/lib/ai-core/image-engine/profiles/types";

export type IndustryVisualPolicy = {
  subjectPackId: string;
  ambientPackId: string;
  slotCounts: Record<ImageSlotKind, number>;
  requiredPhotoCounts: Record<string, number>;
  /** Max subject-pack URLs in gallery (0 = hero reuse only). */
  maxGallerySubjectUrls: number;
  maxSectionSubjectUrls: number;
  heroDominant: boolean;
};

const HERO_DOMINANT_SLOT_COUNTS: Record<ImageSlotKind, number> = {
  hero: 1,
  gallery: 0,
  about: 1,
  features: 2,
  team: 4,
  products: 1,
  testimonials: 4,
  backgrounds: 1,
  cta: 1,
};

const DEFAULT_REQUIRED_PHOTO_COUNTS = {
  hero: 1,
  product: 1,
  service: 1,
  background: 1,
  section: 3,
  gallery: 3,
  testimonial: 2,
};

const INDUSTRY_VISUAL_POLICIES: Record<string, IndustryVisualPolicy> = {
  automotive: {
    subjectPackId: "automotive",
    ambientPackId: "business",
    slotCounts: HERO_DOMINANT_SLOT_COUNTS,
    requiredPhotoCounts: {
      hero: 1,
      product: 1,
      service: 1,
      background: 1,
      section: 1,
      gallery: 0,
      testimonial: 2,
    },
    maxGallerySubjectUrls: 0,
    maxSectionSubjectUrls: 2,
    heroDominant: true,
  },
  law: {
    subjectPackId: "law",
    ambientPackId: "business",
    slotCounts: {
      ...SLOT_MIN_COUNTS,
      gallery: 2,
      features: 2,
      products: 1,
    },
    requiredPhotoCounts: {
      hero: 1,
      product: 1,
      service: 1,
      background: 1,
      section: 2,
      gallery: 2,
      testimonial: 2,
    },
    maxGallerySubjectUrls: 2,
    maxSectionSubjectUrls: 1,
    heroDominant: false,
  },
  "real-estate": {
    subjectPackId: "real-estate",
    ambientPackId: "business",
    slotCounts: {
      ...SLOT_MIN_COUNTS,
      gallery: 3,
      products: 2,
    },
    requiredPhotoCounts: {
      hero: 1,
      product: 1,
      service: 1,
      background: 1,
      section: 2,
      gallery: 2,
      testimonial: 2,
    },
    maxGallerySubjectUrls: 2,
    maxSectionSubjectUrls: 2,
    heroDominant: false,
  },
  "electronics-retail": {
    subjectPackId: "electronics-retail",
    ambientPackId: "technology",
    slotCounts: {
      ...SLOT_MIN_COUNTS,
      gallery: 2,
      products: 2,
    },
    requiredPhotoCounts: {
      hero: 1,
      product: 1,
      service: 1,
      background: 1,
      section: 2,
      gallery: 2,
      testimonial: 2,
    },
    maxGallerySubjectUrls: 2,
    maxSectionSubjectUrls: 2,
    heroDominant: false,
  },
};

/** @deprecated use getIndustryVisualPolicy — kept for existing imports */
export const HERO_DOMINANT_INDUSTRY_IDS = new Set(
  Object.entries(INDUSTRY_VISUAL_POLICIES)
    .filter(([, policy]) => policy.heroDominant)
    .map(([id]) => id),
);

export function getIndustryVisualPolicy(
  industryId?: string | null,
): IndustryVisualPolicy | null {
  if (!industryId?.trim()) return null;
  const packId = resolveStockIndustryId(industryId, industryId);
  return INDUSTRY_VISUAL_POLICIES[packId] ?? null;
}

export function isSubjectSparingIndustry(industryId?: string | null): boolean {
  return getIndustryVisualPolicy(industryId) !== null;
}

export function isHeroDominantIndustry(industryId?: string | null): boolean {
  return getIndustryVisualPolicy(industryId)?.heroDominant ?? false;
}

export function resolveIndustrySlotCounts(
  ctx: ImageProfileContext,
): Record<ImageSlotKind, number> {
  const industry = resolveStockIndustryId(ctx.routingIndustryId, ctx.industry);
  const policy = INDUSTRY_VISUAL_POLICIES[industry];
  if (!policy) return { ...SLOT_MIN_COUNTS };
  return { ...policy.slotCounts };
}

/** Pick stock pack per asset role — subject-sparing industries use ambient pack off-hero. */
export function resolveStockIndustryForRole(
  routingIndustryId: string,
  role: string,
  slotKind?: ImageSlotKind,
): string {
  const industry = resolveStockIndustryId(routingIndustryId, routingIndustryId);
  const policy = INDUSTRY_VISUAL_POLICIES[industry];
  if (!policy) return industry;

  const normalizedRole = role.toLowerCase();
  if (normalizedRole === "hero" || normalizedRole === "brand") {
    return policy.subjectPackId;
  }
  if (normalizedRole === "product" && slotKind === "products") {
    return policy.subjectPackId;
  }
  if (
    normalizedRole === "testimonial" ||
    slotKind === "testimonials" ||
    slotKind === "team"
  ) {
    return policy.ambientPackId;
  }
  return policy.ambientPackId;
}

export function resolveRequiredPhotoRoleCounts(
  routingIndustryId?: string | null,
): Record<string, number> {
  const policy = getIndustryVisualPolicy(routingIndustryId);
  if (!policy) return { ...DEFAULT_REQUIRED_PHOTO_COUNTS };
  return { ...policy.requiredPhotoCounts };
}

export function isSubjectPackPhotoUrl(
  url: string | null | undefined,
  subjectPackId: string,
): boolean {
  if (!url) return false;
  return listStockPhotoIds(subjectPackId).some((id) => url.includes(id));
}

export function stripSubjectPackPhotos(
  urls: string[],
  subjectPackId: string,
  keepUrl?: string | null,
): string[] {
  return urls.filter(
    (url) =>
      !isSubjectPackPhotoUrl(url, subjectPackId) ||
      (keepUrl != null && url === keepUrl),
  );
}

/** Unsplash ids used for vehicle-exterior / vehicle-product shots in the automotive pack. */
export const AUTOMOTIVE_VEHICLE_PHOTO_IDS = [
  "photo-1492144534655-ae79c964c9d7",
  "photo-1503376780353-7e6692767b70",
  "photo-1542362567-b07e54358753",
  "photo-1485291571150-772bcfc10da5",
  "photo-1544636331-e26879cd4d9b",
  "photo-1502877338538-ec513f5b8c4c",
  "photo-1511919884226-fd3cad54694b",
  "photo-1493238792120-0d746b213b5e",
] as const;

export function isAutomotiveVehiclePhotoUrl(url: string | null | undefined): boolean {
  return isSubjectPackPhotoUrl(url, "automotive");
}

export function stripAutomotiveVehiclePhotos(
  urls: string[],
  keepUrl?: string | null,
): string[] {
  return stripSubjectPackPhotos(urls, "automotive", keepUrl);
}

export function countAutomotiveVehiclePhotos(urls: string[]): number {
  return urls.filter(isAutomotiveVehiclePhotoUrl).length;
}

export function capSubjectSparingGalleryUrls(
  routingIndustryId: string | null | undefined,
  hero: string | null,
  gallery: string[],
): string[] {
  const policy = getIndustryVisualPolicy(routingIndustryId);
  if (!policy) return gallery;

  if (policy.heroDominant) {
    return hero ? [hero] : [];
  }

  const subjectUrls = gallery.filter((url) =>
    isSubjectPackPhotoUrl(url, policy.subjectPackId),
  );
  const ambientUrls = gallery.filter(
    (url) => !isSubjectPackPhotoUrl(url, policy.subjectPackId),
  );
  const cappedSubject = subjectUrls.slice(0, policy.maxGallerySubjectUrls);
  return [...cappedSubject, ...ambientUrls];
}

export function capSubjectSparingSectionUrls(
  routingIndustryId: string | null | undefined,
  hero: string | null,
  sections: string[],
  service: string | null,
): string[] {
  const policy = getIndustryVisualPolicy(routingIndustryId);
  if (!policy) return sections;

  const pool = stripSubjectPackPhotos(
    [...new Set(sections.filter(Boolean))],
    policy.subjectPackId,
    hero,
  ).filter((url) => url !== hero);

  if (pool.length > 0) {
    return pool.slice(0, policy.maxSectionSubjectUrls);
  }

  return service && !isSubjectPackPhotoUrl(service, policy.subjectPackId)
    ? [service]
    : pool;
}

/** @deprecated use capSubjectSparingGalleryUrls */
export function capHeroDominantGalleryUrls(
  routingIndustryId: string | null | undefined,
  hero: string | null,
  gallery: string[],
): string[] {
  return capSubjectSparingGalleryUrls(routingIndustryId, hero, gallery);
}

/** @deprecated use capSubjectSparingSectionUrls */
export function capHeroDominantSectionUrls(
  routingIndustryId: string | null | undefined,
  hero: string | null,
  sections: string[],
  service: string | null,
): string[] {
  return capSubjectSparingSectionUrls(routingIndustryId, hero, sections, service);
}

export { IMAGE_SLOT_KINDS };
