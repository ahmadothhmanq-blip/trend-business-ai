import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type { TemplateSelection } from "@/lib/ai-core/templates/types";
import { mergeSmartTemplateFeatures } from "@/lib/website/smart-templates/select";
import type { SmartTemplateSelectionResult } from "@/lib/website/smart-templates/types";

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

export function smartSelectionToTemplateSelection(
  selection: SmartTemplateSelectionResult,
): TemplateSelection {
  const t = selection.template;
  return {
    industryId: t.industryId,
    label: t.name,
    layoutStyle: t.layoutStyle,
    sections: t.sections.map((s) => s.label),
    designPreset: t.designPreset,
    requiredFeatures: [...t.requiredFeatures],
    suggestedPages: [...t.requiredPages],
    contentTone: t.contentTone,
    industryPattern: `${t.industryId}-${t.id}`,
    confidence: selection.confidence,
    source: selection.source,
    smartTemplateId: t.id,
    designConfiguration: selection.designConfiguration as unknown as Record<
      string,
      unknown
    >,
  };
}

/**
 * Apply Smart Template Engine result onto a Core brief for Website Builder.
 */
export function enrichBriefWithSmartTemplate(
  brief: CoreBrief,
  selection: SmartTemplateSelectionResult,
): { brief: CoreBrief; selection: TemplateSelection } {
  const templateSelection = smartSelectionToTemplateSelection(selection);
  const features = mergeSmartTemplateFeatures(brief.features, selection);

  const metadata: Record<string, unknown> = {
    ...(brief.metadata ?? {}),
    templateSelection,
    smartTemplateSelection: selection,
    templateId: selection.templateId,
    smartTemplateId: selection.templateId,
    industryId: selection.template.industryId,
    industry: selection.template.industryId,
  };

  const nested = metadata[WEBSITE_INPUT_KEY];
  if (nested && typeof nested === "object") {
    const row = { ...(nested as Record<string, unknown>) };
    row.templateId = selection.templateId;
    row.templateIndustry = selection.template.industryId;
    row.templateLayoutStyle = selection.template.layoutStyle;
    row.theme = row.theme && row.theme !== "modern"
      ? row.theme
      : selection.designConfiguration.designPreset;
    row.features = uniqueStrings([
      ...(Array.isArray(row.features) ? row.features.map(String) : []),
      ...selection.designConfiguration.requiredFeatures,
      `template:${selection.templateId}`,
    ]);
    metadata[WEBSITE_INPUT_KEY] = row;
  }

  return {
    selection: templateSelection,
    brief: {
      ...brief,
      theme: brief.theme || selection.designConfiguration.designPreset,
      features,
      metadata,
    },
  };
}
