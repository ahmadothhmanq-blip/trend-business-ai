import type { IndustryId } from "@/lib/ai-core/templates/types";

/** Structured business profile produced by AI analysis — drives all downstream generation. */
export type BusinessIntelligenceProfile = {
  /** Primary industry label (e.g. "Furniture", "Restaurant", "Cybersecurity"). */
  industry: string;
  /** Narrow specialization (e.g. "Modern Furniture", "Fine Dining"). */
  subcategory: string;
  /** Target customer segments. */
  audience: string[];
  /** Brand voice and copy tone. */
  tone: string;
  /** Visual personality descriptors. */
  visualStyle: string[];
  /** Suggested color palette themes (not hex — semantic). */
  colorPalette: string[];
  /** Typography personality. */
  typography: string[];
  /** Photography subjects that MUST appear in imagery. */
  photographyStyle: string[];
  /** Subjects that must NEVER appear (e.g. fashion for furniture). */
  forbiddenSubjects: string[];
  /** Hero headline / messaging angles. */
  heroMessaging: string[];
  /** Industry-specific page sections. */
  recommendedSections: string[];
  /** Primary call-to-action label. */
  primaryCta: string;
  /** Secondary call-to-action label. */
  secondaryCta?: string;
  /** Navigation approach (e.g. "collections-focused", "service-menu"). */
  navigationStyle: string;
  /** Design system hints for downstream engines. */
  designSystemHints: {
    mood: string;
    layoutApproach: string;
  };
  /**
   * Closest internal template routing id — chosen by AI from the catalog,
   * not by keyword rules in application code.
   */
  routingIndustryId: string;
  confidence: number;
  reason: string;
};

export type BusinessIntelligenceSource = "analysis" | "locked" | "fallback";

export type BusinessIntelligenceResult = {
  profile: BusinessIntelligenceProfile;
  source: BusinessIntelligenceSource;
  analyzedAt: string;
  promptHash: string;
};

export const BUSINESS_INTELLIGENCE_KEY = "businessIntelligence";

/** Resolved routing id that maps to a known IndustryId when possible. */
export function resolveRoutingIndustryId(
  profile: BusinessIntelligenceProfile,
  knownIds: readonly string[],
): IndustryId | string {
  const raw = profile.routingIndustryId.trim().toLowerCase().replace(/\s+/g, "-");
  if (knownIds.includes(raw)) return raw as IndustryId;
  const industrySlug = profile.industry.trim().toLowerCase().replace(/\s+/g, "-");
  if (knownIds.includes(industrySlug)) return industrySlug as IndustryId;
  return raw || "business";
}
