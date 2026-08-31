import type { ImageSlotKind } from "@/lib/ai-core/image-engine/slots";
import { resolveSlotImageStrict } from "@/lib/website/template-v2/slots/slot-utils";

/** Sector-specific empty-hero layout — avoids collapsing every package into one centered column. */
export type HeroEmptyProfile =
  | "split-asymmetric"
  | "bleed-immersive"
  | "trust-authority"
  | "type-asymmetric"
  | "estate-split"
  | "editorial-frame";

const EMPTY_SECTION_CLASS: Record<HeroEmptyProfile, string> = {
  "split-asymmetric": "df-hero-split-empty-section df-section-glow",
  "bleed-immersive": "df-hero-bleed-empty-section",
  "trust-authority": "df-hero-trust-empty-section df-section-glow",
  "type-asymmetric": "df-hero-type-empty-section",
  "estate-split": "df-hero-estate-empty-section df-section-glow",
  "editorial-frame": "df-hero-frame-empty-section",
};

const EMPTY_GRID_CLASS: Record<HeroEmptyProfile, string> = {
  "split-asymmetric":
    "df-hero-split-empty grid items-start gap-10 lg:grid-cols-12 lg:items-center lg:gap-16 xl:gap-20",
  "bleed-immersive": "df-hero-bleed-empty",
  "trust-authority":
    "df-hero-trust-empty grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16",
  "type-asymmetric":
    "df-hero-type-empty grid gap-10 lg:min-h-[94vh] lg:grid-cols-[1fr_1.15fr] lg:gap-14",
  "estate-split":
    "df-hero-estate-empty grid min-h-[95svh] lg:grid-cols-[1fr_1.15fr]",
  "editorial-frame":
    "df-hero-frame-empty grid min-h-[80svh] items-end gap-10 pb-16 pt-28 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:pb-20 lg:pt-32",
};

const EMPTY_COPY_CLASS: Record<HeroEmptyProfile, string> = {
  "split-asymmetric": "df-hero-split-empty-copy",
  "bleed-immersive": "df-hero-bleed-empty-copy max-w-3xl",
  "trust-authority": "df-hero-trust-empty-copy",
  "type-asymmetric": "",
  "estate-split": "df-hero-estate-empty-copy",
  "editorial-frame": "df-hero-frame-empty-copy max-w-xl",
};

/** True when a slot resolves to a non-empty image URL. */
export function hasSlotImage(
  kind: ImageSlotKind,
  index = 0,
  preferred?: string | null,
): boolean {
  return Boolean(resolveSlotImageStrict(kind, index, preferred));
}

export function heroEmptySectionClass(profile: HeroEmptyProfile): string {
  return EMPTY_SECTION_CLASS[profile];
}

/** Section shell — sector-specific min-height/backdrop when the hero image slot is empty. */
export function heroSectionShellClass(
  hasVisual: boolean,
  withVisualClass: string,
  emptyProfile: HeroEmptyProfile,
): string {
  return hasVisual ? withVisualClass : heroEmptySectionClass(emptyProfile);
}

/**
 * Two-column section grid that keeps each sector's asymmetric rhythm when no visual.
 */
export function splitSectionGridClass(
  hasVisual: boolean,
  gap = "gap-12",
  profile: HeroEmptyProfile = "split-asymmetric",
): string {
  if (hasVisual) {
    return `grid items-center ${gap} lg:grid-cols-2 lg:gap-16 xl:gap-20`;
  }
  if (profile === "split-asymmetric") {
    return EMPTY_GRID_CLASS["split-asymmetric"];
  }
  return EMPTY_GRID_CLASS[profile];
}

/** Section shell class for full-bleed heroes with optional background image. */
export function heroBleedSectionClass(
  hasVisual: boolean,
  bleedMinHeight = "min-h-[100svh]",
  profile: HeroEmptyProfile = "bleed-immersive",
): string {
  return hasVisual ? bleedMinHeight : heroEmptySectionClass(profile);
}

/** Content wrapper for full-bleed heroes — bottom-aligned with image, sector rhythm without. */
export function heroBleedContentClass(
  hasVisual: boolean,
  bleedLayout: string,
  profile: HeroEmptyProfile = "bleed-immersive",
): string {
  return hasVisual
    ? bleedLayout
    : "df-hero-bleed-empty-content relative z-10 flex min-h-[min(100svh,56rem)] flex-col justify-end px-5 py-16 sm:px-8 lg:px-10";
}

/** Inner copy column — left-aligned sector typography when image slots are empty. */
export function heroEmptyCopyClass(
  hasVisual: boolean,
  profile: HeroEmptyProfile = "split-asymmetric",
): string {
  return hasVisual ? "" : EMPTY_COPY_CLASS[profile];
}

/** Grid shell for heroes that use a custom grid string when an image is present. */
export function heroGridShellClass(
  hasVisual: boolean,
  withVisualClass: string,
  profile: HeroEmptyProfile,
): string {
  return hasVisual ? withVisualClass : EMPTY_GRID_CLASS[profile];
}

/** CTA row alignment — preserves sector start-alignment when typography-only. */
export function ctaRowAlignClass(hasVisual: boolean, base = ""): string {
  return base.trim();
}
