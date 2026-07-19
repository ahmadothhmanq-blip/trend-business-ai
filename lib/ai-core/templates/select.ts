import type { CoreBrief } from "@/lib/ai-core/layers/types";
import {
  getIndustryProfile,
  isIndustryId,
  listIndustryProfiles,
} from "@/lib/ai-core/templates/industries";
import type {
  IndustryId,
  TemplateSelection,
} from "@/lib/ai-core/templates/types";

function normalizeHaystack(brief: CoreBrief): string {
  const meta = brief.metadata ?? {};
  const nestedBits: string[] = [];
  for (const value of Object.values(meta)) {
    if (typeof value === "string") nestedBits.push(value);
    if (value && typeof value === "object") {
      const row = value as Record<string, unknown>;
      for (const key of [
        "industry",
        "appType",
        "pageType",
        "projectType",
        "brandType",
        "contentType",
        "videoType",
      ]) {
        if (typeof row[key] === "string") nestedBits.push(String(row[key]));
      }
    }
  }

  return [
    brief.prompt,
    brief.theme,
    ...(brief.features ?? []),
    typeof meta.industry === "string" ? meta.industry : "",
    ...nestedBits,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function explicitIndustry(brief: CoreBrief): IndustryId | null {
  const meta = brief.metadata ?? {};
  const candidates = [
    meta.industry,
    meta.industryId,
    typeof meta.websiteGenerationInput === "object" &&
    meta.websiteGenerationInput &&
    "projectType" in (meta.websiteGenerationInput as object)
      ? (meta.websiteGenerationInput as { projectType?: string }).projectType
      : undefined,
  ];

  for (const raw of candidates) {
    if (typeof raw !== "string") continue;
    const normalized = raw.trim().toLowerCase().replace(/\s+/g, "-");
    if (isIndustryId(normalized)) return normalized;
    if (
      normalized.includes("tourism") ||
      normalized.includes("travel") ||
      normalized.includes("tour")
    ) {
      return "tourism";
    }
    if (
      normalized.includes("education") ||
      normalized.includes("school") ||
      normalized.includes("university") ||
      normalized.includes("academy")
    ) {
      return "education";
    }
    if (normalized.includes("real") && normalized.includes("estate")) {
      return "real-estate";
    }
    if (normalized.includes("e-commerce") || normalized.includes("ecom")) {
      return "ecommerce";
    }
    if (
      normalized.includes("clinic") ||
      normalized.includes("medical") ||
      normalized.includes("dental") ||
      normalized.includes("healthcare")
    ) {
      return "clinic";
    }
  }
  return null;
}

function scoreIndustry(haystack: string, industryId: IndustryId): number {
  const profile = getIndustryProfile(industryId);
  let score = 0;
  for (const keyword of profile.keywords) {
    if (haystack.includes(keyword.toLowerCase())) {
      score += keyword.length > 6 ? 2 : 1;
    }
  }
  return score;
}

function toSelection(
  industryId: IndustryId,
  confidence: number,
  source: TemplateSelection["source"],
): TemplateSelection {
  const profile = getIndustryProfile(industryId);
  return {
    industryId: profile.id,
    label: profile.label,
    layoutStyle: profile.layoutStyle,
    sections: [...profile.sections],
    designPreset: profile.designPreset,
    requiredFeatures: [...profile.requiredFeatures],
    suggestedPages: [...profile.suggestedPages],
    contentTone: profile.contentTone,
    industryPattern: profile.industryPattern,
    confidence,
    source,
  };
}

/**
 * Select layout style, sections, design preset, and required features
 * from industry intelligence + brief signals.
 */
export function selectIndustryTemplate(brief: CoreBrief): TemplateSelection {
  const explicit = explicitIndustry(brief);
  if (explicit) {
    return toSelection(explicit, 1, "explicit");
  }

  const haystack = normalizeHaystack(brief);
  let bestId: IndustryId = "business";
  let bestScore = 0;

  for (const profile of listIndustryProfiles()) {
    if (profile.id === "business") continue;
    const score = scoreIndustry(haystack, profile.id);
    if (score > bestScore) {
      bestScore = score;
      bestId = profile.id;
    }
  }

  if (bestScore <= 0) {
    return toSelection("business", 0.35, "default");
  }

  const confidence = Math.min(0.95, 0.45 + bestScore * 0.08);
  return toSelection(bestId, confidence, "keyword");
}
