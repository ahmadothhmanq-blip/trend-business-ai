import type { WebsiteGoal } from "@/lib/ai-core/components/types";
import type { SectionKind } from "@/lib/ai-core/components/types";

type HomeSectionKind = Exclude<SectionKind, "header" | "footer">;

/** Infer website goal from strategy / business profile signals. */
export function resolveWebsiteGoal(params: {
  websiteGoal?: string | null;
  businessGoals?: string[];
  positioning?: string;
  ctaTypes?: string[];
  industryId?: string;
}): WebsiteGoal {
  const explicit = normalizeGoal(params.websiteGoal);
  if (explicit) return explicit;

  const blob = [
    ...(params.businessGoals ?? []),
    params.positioning,
    ...(params.ctaTypes ?? []),
    params.industryId,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/book|reserv|appoint|schedule|table|trip/.test(blob)) return "booking";
  if (/shop|buy|cart|checkout|ecommerce|product|sell/.test(blob)) {
    return "ecommerce";
  }
  if (/trial|demo|signup|subscribe|convert|pricing/.test(blob)) {
    return "conversion";
  }
  if (/blog|educat|content|learn|insight|resource/.test(blob)) return "content";
  if (/brand|awareness|portfolio|story|prestige|luxury/.test(blob)) {
    return "brand";
  }
  if (/lead|contact|inquiry|quote|consult/.test(blob)) return "lead-gen";

  // Industry defaults
  const industry = (params.industryId || "").toLowerCase();
  if (["tourism", "restaurant", "clinic"].includes(industry)) return "booking";
  if (industry === "ecommerce") return "ecommerce";
  if (industry === "saas") return "conversion";
  if (industry === "agency") return "lead-gen";
  if (industry === "education") return "content";

  return "lead-gen";
}

function normalizeGoal(value?: string | null): WebsiteGoal | null {
  const v = (value ?? "").toLowerCase().trim();
  if (!v) return null;
  if (v.includes("book")) return "booking";
  if (v.includes("ecom") || v.includes("shop")) return "ecommerce";
  if (v.includes("convert") || v.includes("trial")) return "conversion";
  if (v.includes("content") || v.includes("educat")) return "content";
  if (v.includes("brand") || v.includes("aware")) return "brand";
  if (v.includes("lead")) return "lead-gen";
  return null;
}

/**
 * Preferred home section order by website goal.
 * Prefers storytelling / trust / interactive sections over repetitive cards.
 */
export function sectionOrderForGoal(goal: WebsiteGoal): HomeSectionKind[] {
  switch (goal) {
    case "booking":
      return [
        "hero",
        "feature-story",
        "gallery-experience",
        "brand-trust",
        "video",
        "timeline",
        "booking",
        "faq",
        "maps",
        "cta",
      ];
    case "ecommerce":
      return [
        "hero",
        "interactive-product",
        "feature-story",
        "gallery-experience",
        "comparison",
        "brand-trust",
        "pricing",
        "cta",
      ];
    case "conversion":
      return [
        "hero",
        "feature-story",
        "interactive-product",
        "comparison",
        "case-studies",
        "brand-trust",
        "pricing",
        "faq",
        "cta",
      ];
    case "brand":
      return [
        "hero",
        "feature-story",
        "gallery-experience",
        "case-studies",
        "timeline",
        "brand-trust",
        "video",
        "contact",
        "cta",
      ];
    case "content":
      return [
        "hero",
        "feature-story",
        "timeline",
        "blog",
        "case-studies",
        "brand-trust",
        "faq",
        "cta",
      ];
    case "lead-gen":
    default:
      return [
        "hero",
        "feature-story",
        "case-studies",
        "brand-trust",
        "timeline",
        "comparison",
        "services",
        "contact",
        "cta",
      ];
  }
}
