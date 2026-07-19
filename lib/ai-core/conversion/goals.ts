import type { WebsiteGoal } from "@/lib/ai-core/components/types";
import { resolveWebsiteGoal } from "@/lib/ai-core/components/goals";
import type {
  ConversionGoal,
  ConversionGoalDetection,
} from "@/lib/ai-core/conversion/types";

/** Map product conversion goals ↔ internal WebsiteGoal used by templates. */
export function conversionGoalToWebsiteGoal(goal: ConversionGoal): WebsiteGoal {
  switch (goal) {
    case "sales":
      return "ecommerce";
    case "bookings":
      return "booking";
    case "leads":
      return "lead-gen";
    case "service-requests":
      return "lead-gen";
    case "brand-awareness":
      return "brand";
    default:
      return "lead-gen";
  }
}

export function websiteGoalToConversionGoal(goal: WebsiteGoal): ConversionGoal {
  switch (goal) {
    case "ecommerce":
    case "conversion":
      return "sales";
    case "booking":
      return "bookings";
    case "brand":
      return "brand-awareness";
    case "content":
      return "brand-awareness";
    case "lead-gen":
    default:
      return "leads";
  }
}

export function normalizeConversionGoal(
  value?: string | null,
): ConversionGoal | null {
  const v = (value ?? "").toLowerCase().trim();
  if (!v) return null;
  if (/sale|shop|buy|ecommerce|purchase|checkout/.test(v)) return "sales";
  if (/book|reserv|appoint|schedule|table|trip/.test(v)) return "bookings";
  if (/service.?request|quote|inquiry|consult|estimate/.test(v)) {
    return "service-requests";
  }
  if (/brand|aware|prestige|portfolio|story/.test(v)) return "brand-awareness";
  if (/lead|contact|demo|trial|signup/.test(v)) return "leads";
  return null;
}

/**
 * Detect website conversion goal from strategy, industry, and brief signals.
 */
export function detectConversionGoal(params: {
  explicitGoal?: string | null;
  websiteGoal?: string | null;
  businessGoals?: string[];
  positioning?: string;
  ctaTypes?: string[];
  industryId?: string;
  conversionFunnel?: string[];
}): ConversionGoalDetection {
  const explicit =
    normalizeConversionGoal(params.explicitGoal) ||
    normalizeConversionGoal(params.websiteGoal);
  if (explicit) {
    return {
      goal: explicit,
      websiteGoal: conversionGoalToWebsiteGoal(explicit),
      confidence: 0.95,
      reason: `Explicit conversion goal: ${explicit}`,
      source: "explicit",
    };
  }

  const blob = [
    ...(params.businessGoals ?? []),
    params.positioning,
    ...(params.ctaTypes ?? []),
    ...(params.conversionFunnel ?? []),
    params.industryId,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const fromBlob = normalizeConversionGoal(blob);
  if (fromBlob && /service.?request|quote|inquiry|consult|estimate/.test(blob)) {
    return {
      goal: "service-requests",
      websiteGoal: "lead-gen",
      confidence: 0.86,
      reason: "Detected service-request / inquiry intent in goals and CTAs",
      source: "strategy",
    };
  }
  if (fromBlob) {
    return {
      goal: fromBlob,
      websiteGoal: conversionGoalToWebsiteGoal(fromBlob),
      confidence: 0.84,
      reason: `Inferred conversion goal from strategy signals: ${fromBlob}`,
      source: "strategy",
    };
  }

  const industry = (params.industryId || "").toLowerCase();
  const industryDefault = industryDefaultGoal(industry);
  if (industryDefault) {
    return {
      goal: industryDefault,
      websiteGoal: conversionGoalToWebsiteGoal(industryDefault),
      confidence: 0.78,
      reason: `Industry default conversion goal for ${industry}`,
      source: "industry",
    };
  }

  const fallbackWebsite = resolveWebsiteGoal({
    websiteGoal: params.websiteGoal,
    businessGoals: params.businessGoals,
    positioning: params.positioning,
    ctaTypes: params.ctaTypes,
    industryId: params.industryId,
  });

  return {
    goal: websiteGoalToConversionGoal(fallbackWebsite),
    websiteGoal: fallbackWebsite,
    confidence: 0.7,
    reason: `Heuristic fallback via website goal ${fallbackWebsite}`,
    source: "heuristic",
  };
}

function industryDefaultGoal(industry: string): ConversionGoal | null {
  if (["tourism", "restaurant", "clinic", "healthcare"].includes(industry)) {
    return "bookings";
  }
  if (industry === "ecommerce") return "sales";
  if (industry === "saas") return "leads";
  if (["real-estate", "automotive", "agency", "business"].includes(industry)) {
    return "service-requests";
  }
  if (industry === "education") return "leads";
  return null;
}
