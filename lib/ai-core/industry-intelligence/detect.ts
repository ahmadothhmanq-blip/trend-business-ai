import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import type { CoreBrief } from "@/lib/ai-core/layers/types";
import {
  getWebsiteIndustryIntelligence,
  listWebsiteIndustryIntelligence,
  PRIMARY_WEBSITE_INDUSTRIES,
  WEBSITE_INDUSTRY_INTELLIGENCE,
} from "@/lib/ai-core/industry-intelligence/profiles";
import type { IndustryDetectionResult } from "@/lib/ai-core/industry-intelligence/types";
import type { IndustryId } from "@/lib/ai-core/templates/types";
import { detectIndustryFromPrompt } from "@/lib/ai-core/website-builder/prompt-industry";

function isKnownIndustryId(value: string): value is IndustryId {
  return value in WEBSITE_INDUSTRY_INTELLIGENCE;
}

function normalizeHaystack(brief: CoreBrief): string {
  const meta = brief.metadata ?? {};
  const nestedBits: string[] = [];
  for (const value of Object.values(meta)) {
    if (typeof value === "string") nestedBits.push(value);
    if (value && typeof value === "object") {
      const row = value as Record<string, unknown>;
      for (const key of ["industry", "projectType", "templateIndustry"]) {
        if (typeof row[key] === "string") nestedBits.push(String(row[key]));
      }
    }
  }

  return [
    brief.prompt,
    brief.theme,
    ...(brief.features ?? []),
    typeof meta.industry === "string" ? meta.industry : "",
    typeof meta.industryId === "string" ? meta.industryId : "",
    ...nestedBits,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function aliasToIndustryId(raw: string): IndustryId | null {
  const normalized = raw.trim().toLowerCase().replace(/[_\s]+/g, "-");
  if (isKnownIndustryId(normalized)) return normalized;

  if (
    normalized.includes("tourism") ||
    normalized.includes("travel") ||
    normalized.includes("tour") ||
    normalized.includes("destination") ||
    normalized.includes("vacation") ||
    normalized.includes("resort") ||
    normalized.includes("itinerary") ||
    normalized.includes("cruise")
  ) {
    return "tourism";
  }
  if (
    normalized.includes("health") ||
    normalized.includes("medical") ||
    normalized.includes("clinic") ||
    normalized.includes("dental") ||
    normalized.includes("hospital")
  ) {
    return "clinic";
  }
  if (
    normalized.includes("education") ||
    normalized.includes("school") ||
    normalized.includes("university") ||
    normalized.includes("academy") ||
    normalized.includes("course")
  ) {
    return "education";
  }
  if (
    normalized.includes("real-estate") ||
    (normalized.includes("real") && normalized.includes("estate")) ||
    normalized.includes("property")
  ) {
    return "real-estate";
  }
  if (
    normalized.includes("e-commerce") ||
    normalized.includes("ecommerce") ||
    normalized.includes("ecom")
  ) {
    return "ecommerce";
  }
  if (
    (normalized.includes("automotive") ||
      normalized.includes("dealership") ||
      normalized.includes("vehicle") ||
      (normalized.includes("showroom") &&
        !normalized.includes("travel") &&
        !normalized.includes("tourism") &&
        !normalized.includes("destination")) ||
      /\bcar\b/.test(normalized) ||
      normalized === "ev") &&
    !normalized.includes("travel") &&
    !normalized.includes("tourism") &&
    !normalized.includes("destination")
  ) {
    return "automotive";
  }
  if (normalized.includes("restaurant") || normalized.includes("dining")) {
    return "restaurant";
  }
  if (
    normalized.includes("furniture") ||
    normalized.includes("sofa") ||
    normalized.includes("bedroom") ||
    normalized.includes("أثاث") ||
    normalized.includes("مفروشات")
  ) {
    return "furniture";
  }
  if (
    normalized.includes("technology") ||
    normalized.includes("computer") ||
    normalized.includes("hardware") ||
    normalized.includes("تكنولوجيا") ||
    normalized.includes("حاسوب")
  ) {
    return "technology";
  }
  if (normalized.includes("saas") || normalized.includes("software")) {
    return "saas";
  }
  if (normalized.includes("agency") || normalized.includes("studio")) {
    return "agency";
  }
  if (
    normalized.includes("law") ||
    normalized.includes("legal") ||
    normalized.includes("attorney") ||
    normalized.includes("lawyer")
  ) {
    return "law";
  }
  if (
    normalized.includes("blog") ||
    normalized.includes("article") ||
    normalized.includes("magazine") ||
    normalized.includes("editorial")
  ) {
    return "blog";
  }
  if (
    normalized.includes("landing") ||
    normalized.includes("launch") ||
    normalized.includes("lead-gen") ||
    normalized.includes("leadgen")
  ) {
    return "landing-page";
  }
  return null;
}

function explicitIndustry(brief: CoreBrief): IndustryId | null {
  const meta = brief.metadata ?? {};
  const masterRaw = meta.masterWebsitePlan;
  if (masterRaw && typeof masterRaw === "object" && "industry" in masterRaw) {
    const mapped = aliasToIndustryId(
      String((masterRaw as { industry: string }).industry),
    );
    if (mapped) return mapped;
  }
  const candidates = [
    meta.industryId,
    meta.industry,
    typeof meta.websiteGenerationInput === "object" &&
    meta.websiteGenerationInput &&
    "projectType" in (meta.websiteGenerationInput as object)
      ? (meta.websiteGenerationInput as { projectType?: string }).projectType
      : undefined,
  ];

  for (const raw of candidates) {
    if (typeof raw !== "string") continue;
    const mapped = aliasToIndustryId(raw);
    if (mapped) return mapped;
  }
  return null;
}

function scoreIndustry(haystack: string, industryId: IndustryId): number {
  const profile = getWebsiteIndustryIntelligence(industryId);
  let score = 0;
  for (const keyword of profile.keywords) {
    if (haystack.includes(keyword.toLowerCase())) {
      score += keyword.length > 6 ? 2 : 1;
    }
  }
  if (haystack.includes(profile.label.toLowerCase())) score += 3;
  return score;
}

function toResult(
  industryId: IndustryId,
  confidence: number,
  reason: string,
  source: IndustryDetectionResult["source"],
): IndustryDetectionResult {
  return {
    industryId,
    confidence,
    reason,
    source,
    profile: getWebsiteIndustryIntelligence(industryId),
  };
}

function selectByKeywords(brief: CoreBrief): IndustryDetectionResult {
  const haystack = normalizeHaystack(brief);
  let bestId: IndustryId = "business";
  let bestScore = 0;

  for (const profile of listWebsiteIndustryIntelligence()) {
    if (profile.id === "business") continue;
    const score = scoreIndustry(haystack, profile.id);
    if (score > bestScore) {
      bestScore = score;
      bestId = profile.id;
    }
  }

  if (bestScore <= 0) {
    return toResult(
      "business",
      0.35,
      "No strong industry signals — using general business blueprint.",
      "default",
    );
  }

  return toResult(
    bestId,
    Math.min(0.95, 0.45 + bestScore * 0.08),
    `Matched keywords for ${getWebsiteIndustryIntelligence(bestId).label}.`,
    "keyword",
  );
}

type AnalysisPayload = {
  industryId?: string;
  confidence?: number;
  reason?: string;
};

/**
 * Detect website industry from the user prompt (DeepSeek) with keyword fallback.
 */
export async function detectWebsiteIndustry(
  brief: CoreBrief,
): Promise<IndustryDetectionResult> {
  const masterRaw = brief.metadata?.masterWebsitePlan;
  if (masterRaw && typeof masterRaw === "object") {
    const plan = masterRaw as {
      industry?: string;
      locked?: { industry?: boolean };
    };
    if (plan.locked?.industry && plan.industry) {
      const mapped = aliasToIndustryId(String(plan.industry));
      if (mapped) {
        return toResult(
          mapped,
          1,
          "Master AI Planner locked industry.",
          "explicit",
        );
      }
    }
  }

  const explicit = explicitIndustry(brief);
  if (explicit) {
    return toResult(explicit, 1, "Explicit industry override.", "explicit");
  }

  const keywordMatch = detectIndustryFromPrompt(brief.prompt);
  if (keywordMatch && keywordMatch.confidence >= 0.9) {
    return toResult(
      keywordMatch.industryId,
      keywordMatch.confidence,
      keywordMatch.reason,
      "keyword",
    );
  }

  const catalog = PRIMARY_WEBSITE_INDUSTRIES.map((id) => {
    const profile = getWebsiteIndustryIntelligence(id);
    return {
      id: profile.id,
      label: profile.label,
      description: profile.description,
      keywords: profile.keywords.slice(0, 8),
      designStyle: profile.designStyle,
      recommendedPages: profile.recommendedPages,
    };
  });

  const resolved = providerManager.resolve(getDefaultTextProvider());
  if (!resolved) {
    return selectByKeywords(brief);
  }

  try {
    const analysis = await providerManager.generateJson<AnalysisPayload>(
      {
        system:
          "You are an industry intelligence analyst for a global website agency. Classify the business into exactly one industry id from the catalog. Respond with JSON only.",
        prompt: `Business description / brief:
"""
${brief.prompt}
"""

Theme: ${brief.theme ?? "n/a"}
Features: ${(brief.features ?? []).join(", ") || "n/a"}

Industry catalog (pick exactly one id):
${JSON.stringify(catalog, null, 2)}

Aliases:
- healthcare / medical / clinic / dental → clinic
- travel / tours / destinations → tourism
- school / courses / academy → education

Return JSON:
{
  "industryId": "<one catalog id>",
  "confidence": 0.0-1.0,
  "reason": "one short sentence"
}`,
        temperature: 0.15,
      },
      resolved,
    );

    const rawId =
      typeof analysis.industryId === "string" ? analysis.industryId : "";
    const mapped = aliasToIndustryId(rawId);
    if (mapped && mapped !== "business") {
      const confidence =
        typeof analysis.confidence === "number"
          ? Math.min(1, Math.max(0.4, analysis.confidence))
          : 0.88;
      return toResult(
        mapped,
        confidence,
        typeof analysis.reason === "string" && analysis.reason.trim()
          ? analysis.reason.trim()
          : `DeepSeek classified industry as ${getWebsiteIndustryIntelligence(mapped).label}.`,
        "analysis",
      );
    }
  } catch {
    // Fall through to keyword selection
  }

  return selectByKeywords(brief);
}
