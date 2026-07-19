import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type { IndustryDetectionResult } from "@/lib/ai-core/industry-intelligence/types";
import type { TemplateSelection } from "@/lib/ai-core/templates/types";

const WEBSITE_INPUT_KEY = "websiteGenerationInput";

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = value.trim();
    if (!key) continue;
    const lower = key.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    out.push(key);
  }
  return out;
}

export function intelligenceToTemplateFields(
  detection: IndustryDetectionResult,
): Pick<
  TemplateSelection,
  | "industryId"
  | "label"
  | "layoutStyle"
  | "sections"
  | "designPreset"
  | "requiredFeatures"
  | "suggestedPages"
  | "contentTone"
  | "industryPattern"
  | "confidence"
  | "source"
  | "industryIntelligence"
> {
  const profile = detection.profile;
  return {
    industryId: profile.id,
    label: profile.label,
    layoutStyle: profile.layoutStyle,
    sections: [...profile.requiredSections],
    designPreset: profile.designPreset,
    requiredFeatures: [...profile.requiredFeatures],
    suggestedPages: [...profile.recommendedPages],
    contentTone: profile.contentStyle,
    industryPattern: profile.industryPattern,
    confidence: detection.confidence,
    source: detection.source,
    industryIntelligence: {
      recommendedPages: [...profile.recommendedPages],
      requiredSections: [...profile.requiredSections],
      ctaTypes: [...profile.ctaTypes],
      contentStyle: profile.contentStyle,
      designStyle: profile.designStyle,
      imageRequirements: [...profile.imageRequirements],
    },
  };
}

/**
 * Attach Industry Website Intelligence onto the Core brief before template/design.
 */
export function applyIndustryIntelligenceToBrief(
  brief: CoreBrief,
  detection: IndustryDetectionResult,
): { brief: CoreBrief; detection: IndustryDetectionResult } {
  const profile = detection.profile;
  const features = uniqueStrings([
    ...(brief.features ?? []),
    ...profile.requiredFeatures,
    `industry:${profile.id}`,
  ]);

  const metadata: Record<string, unknown> = {
    ...(brief.metadata ?? {}),
    industryIntelligence: detection,
    industryId: profile.id,
    industry: profile.label,
    industryDesignStyle: profile.designStyle,
  };

  const nested = metadata[WEBSITE_INPUT_KEY];
  if (nested && typeof nested === "object") {
    const row = { ...(nested as Record<string, unknown>) };
    row.templateIndustry = profile.id;
    row.industryIntelligenceId = profile.id;
    row.industryDesignStyle = profile.designStyle;
    if (!row.theme || row.theme === "modern") {
      row.theme = `${profile.designStyle} ${profile.designPreset}`;
    }
    row.features = uniqueStrings([
      ...(Array.isArray(row.features) ? row.features.map(String) : []),
      ...profile.requiredFeatures,
      `industry:${profile.id}`,
    ]);
    metadata[WEBSITE_INPUT_KEY] = row;
  }

  return {
    detection,
    brief: {
      ...brief,
      theme: brief.theme || `${profile.designStyle} ${profile.designPreset}`,
      features,
      metadata,
    },
  };
}

export function getIndustryDetectionFromBrief(
  brief: CoreBrief,
): IndustryDetectionResult | undefined {
  const raw = brief.metadata?.industryIntelligence;
  if (!raw || typeof raw !== "object") return undefined;
  const row = raw as IndustryDetectionResult;
  if (!row.industryId || !row.profile) return undefined;
  return row;
}

/** Merge industry intelligence onto an existing TemplateSelection. */
export function mergeIndustryIntelligenceIntoSelection(
  selection: TemplateSelection,
  detection: IndustryDetectionResult,
): TemplateSelection {
  const intel = intelligenceToTemplateFields(detection);
  return {
    ...selection,
    industryId: intel.industryId,
    label: selection.label || intel.label,
    layoutStyle: selection.layoutStyle || intel.layoutStyle,
    sections: uniqueStrings([...intel.sections, ...selection.sections]),
    designPreset: selection.designPreset || intel.designPreset,
    requiredFeatures: uniqueStrings([
      ...intel.requiredFeatures,
      ...selection.requiredFeatures,
    ]),
    suggestedPages:
      selection.suggestedPages.length >= intel.suggestedPages.length
        ? selection.suggestedPages
        : intel.suggestedPages,
    contentTone: selection.contentTone || intel.contentTone,
    industryPattern: selection.industryPattern || intel.industryPattern,
    confidence: Math.max(selection.confidence, intel.confidence),
    industryIntelligence: intel.industryIntelligence,
  };
}
