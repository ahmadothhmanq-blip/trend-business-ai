/**
 * Industry-aware keyword generation for generated websites.
 */

import {
  getWebsiteIndustryIntelligence,
  WEBSITE_INDUSTRY_INTELLIGENCE,
} from "@/lib/ai-core/industry-intelligence/profiles";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { KeywordPlan } from "@/lib/ai-core/seo-performance/types";
import type { IndustryId } from "@/lib/ai-core/templates/types";

function isIndustryId(value: string): value is IndustryId {
  return value in WEBSITE_INDUSTRY_INTELLIGENCE;
}

function unique(values: string[], limit = 20): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
    if (out.length >= limit) break;
  }
  return out;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string => typeof item === "string" && Boolean(item.trim()),
  );
}

export function resolveIndustryId(
  industryId?: string | null,
  profile?: CoreBusinessProfile,
): IndustryId | string {
  if (industryId && isIndustryId(industryId)) return industryId;
  const raw = (profile?.industry || "").toLowerCase().replace(/[_\s]+/g, "-");
  if (raw && isIndustryId(raw)) return raw;
  if (raw.includes("real") || raw.includes("estate") || raw.includes("property")) {
    return "real-estate";
  }
  if (raw.includes("tour") || raw.includes("travel")) return "tourism";
  if (raw.includes("restaurant") || raw.includes("cafe") || raw.includes("food")) {
    return "restaurant";
  }
  if (raw.includes("saas") || raw.includes("software")) return "saas";
  if (raw.includes("ecom") || raw.includes("shop") || raw.includes("store")) {
    return "ecommerce";
  }
  if (raw.includes("auto") || raw.includes("car") || raw.includes("vehicle")) {
    return "automotive";
  }
  if (raw.includes("clinic") || raw.includes("health") || raw.includes("medical")) {
    return "clinic";
  }
  if (raw.includes("school") || raw.includes("education") || raw.includes("university")) {
    return "education";
  }
  if (raw.includes("agency") || raw.includes("studio") || raw.includes("marketing")) {
    return "agency";
  }
  return "business";
}

/** Long-tail patterns by industry for local/intent SEO. */
const INDUSTRY_LONG_TAIL: Record<string, string[]> = {
  tourism: ["book tours online", "best destinations", "travel packages"],
  restaurant: ["reserve a table", "menu near me", "restaurant reservations"],
  "real-estate": ["homes for sale", "property inquiry", "buy apartment"],
  saas: ["book a demo", "pricing plans", "software features"],
  ecommerce: ["shop online", "free shipping", "best deals"],
  automotive: ["car inventory", "test drive", "vehicle financing"],
  clinic: ["book appointment", "patient care", "medical services"],
  education: ["enroll now", "course catalog", "admissions"],
  agency: ["hire agency", "case studies", "creative services"],
  business: ["contact us", "get a quote", "professional services"],
};

export type BuildKeywordPlanInput = {
  strategy?: CoreProductStrategy;
  profile?: CoreBusinessProfile;
  industryId?: string | null;
  premiumSeoTopics?: string[];
  premiumKeywords?: string[];
};

/**
 * Generate primary/secondary/long-tail keywords from strategy + industry intelligence.
 */
export function buildKeywordPlan(input: BuildKeywordPlanInput): KeywordPlan {
  const industryId = resolveIndustryId(input.industryId, input.profile);
  const intel = isIndustryId(String(industryId))
    ? getWebsiteIndustryIntelligence(industryId as IndustryId)
    : null;

  const seoFocus = asStringList(input.strategy?.seoFocus);
  const seoTopics = asStringList(input.strategy?.contentStrategy?.seoTopics);
  const premiumTopics = asStringList(input.premiumSeoTopics);
  const premiumKeywords = asStringList(input.premiumKeywords);
  const industryKeywords = unique([
    ...(intel?.keywords ?? []),
    ...(intel?.requiredFeatures ?? []).map((f) => f.replace(/-/g, " ")),
  ]);

  const brand = input.profile?.projectName?.trim() || "";
  const offer = input.profile?.offer?.trim() || "";
  const geography = input.profile?.geography?.trim() || "";

  const secondary = unique([
    ...seoFocus.slice(1),
    ...seoTopics,
    ...premiumTopics,
    ...premiumKeywords,
    ...industryKeywords,
    brand,
    offer,
    geography,
  ]).filter((k) => k.toLowerCase() !== (seoFocus[0] || "").toLowerCase());

  const primary =
    seoFocus[0] ||
    seoTopics[0] ||
    premiumTopics[0] ||
    industryKeywords[0] ||
    offer ||
    brand ||
    "business website";

  const longTailBase =
    INDUSTRY_LONG_TAIL[String(industryId)] ?? INDUSTRY_LONG_TAIL.business;
  const longTail = unique([
    ...longTailBase.map((phrase) =>
      geography ? `${phrase} ${geography}` : phrase,
    ),
    brand && primary ? `${brand} ${primary}` : "",
    offer ? `${offer} online` : "",
  ]);

  const source: KeywordPlan["source"] =
    (seoFocus.length || seoTopics.length) && industryKeywords.length
      ? "hybrid"
      : premiumTopics.length || premiumKeywords.length
        ? "premium-template"
        : industryKeywords.length && !seoFocus.length
          ? "industry"
          : "strategy";

  return {
    primary,
    secondary: secondary.slice(0, 12),
    longTail: longTail.slice(0, 8),
    industryKeywords: industryKeywords.slice(0, 12),
    source,
  };
}
