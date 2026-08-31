/** Sector keys for section vertical rhythm and framing tokens. */
export type SectionRhythmSector =
  | "corporate"
  | "saas"
  | "education"
  | "finance"
  | "medical"
  | "creative"
  | "ecommerce"
  | "hospitality"
  | "estate";

/** CSS custom properties that drive per-sector section padding rhythm. */
export const SECTION_RHYTHM_TOKENS: Record<SectionRhythmSector, string> = {
  corporate: "--cb-section-y",
  saas: "--se-section-y",
  education: "--ed-section-y",
  finance: "--fn-section-y",
  medical: "--mp-section-y",
  creative: "--sv-section-y",
  ecommerce: "--ec-section-y",
  hospitality: "--rp-section-y",
  estate: "--rep-section-y",
};

/** Primary section shell class per sector (pairs with package global CSS). */
export const SECTION_SHELL_CLASS: Record<SectionRhythmSector, string> = {
  corporate: "cb-section",
  saas: "se-section",
  education: "ed-section",
  finance: "fn-section",
  medical: "mp-section",
  creative: "sv-section",
  ecommerce: "ec-section",
  hospitality: "rp-section",
  estate: "rep-section",
};

export function sectionRhythmDataAttr(sector: SectionRhythmSector): string {
  return sector;
}
