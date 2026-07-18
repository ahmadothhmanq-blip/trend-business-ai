import type { CoreBrief } from "@/lib/ai-core/layers/types";
import { selectIndustryTemplate } from "@/lib/ai-core/templates/select";
import type { TemplateSelection } from "@/lib/ai-core/templates/types";

const PLUGIN_INPUT_KEYS = [
  "websiteGenerationInput",
  "webappPluginInput",
  "landingPagePluginInput",
  "brandIdentityPluginInput",
  "contentPluginInput",
  "videoPluginInput",
  "marketingPluginInput",
] as const;

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

function patchNestedInput(
  metadata: Record<string, unknown>,
  selection: TemplateSelection,
): Record<string, unknown> {
  const next = { ...metadata };
  for (const key of PLUGIN_INPUT_KEYS) {
    const nested = next[key];
    if (!nested || typeof nested !== "object") continue;
    const row = { ...(nested as Record<string, unknown>) };

    if (Array.isArray(row.features)) {
      row.features = uniqueStrings([
        ...row.features.map(String),
        ...selection.requiredFeatures,
      ]);
    } else if (key === "websiteGenerationInput" || key === "webappPluginInput") {
      row.features = [...selection.requiredFeatures];
    }

    if (key === "landingPagePluginInput") {
      const sections = Array.isArray(row.sections)
        ? row.sections.map(String)
        : [];
      row.sections = uniqueStrings([...sections, ...selection.sections]);
      if (!row.designStyle) row.designStyle = selection.designPreset;
    }

    if (key === "websiteGenerationInput") {
      if (!row.theme || row.theme === "modern") {
        row.theme = selection.designPreset;
      }
      row.templateIndustry = selection.industryId;
      row.templateLayoutStyle = selection.layoutStyle;
    }

    if (key === "webappPluginInput") {
      if (!row.designStyle) row.designStyle = selection.designPreset;
      if (!row.colorStyle) row.colorStyle = selection.designPreset;
    }

    if (key === "brandIdentityPluginInput") {
      if (!row.industry || row.industry === "General") {
        row.industry = selection.label;
      }
      if (!row.brandPersonality) {
        row.brandPersonality = selection.contentTone;
      }
    }

    next[key] = row;
  }
  return next;
}

/**
 * Attach TemplateSelection to the brief and merge industry defaults into
 * nested plugin inputs / top-level features. Does not call product APIs.
 */
export function enrichBriefWithIndustryTemplate(brief: CoreBrief): {
  brief: CoreBrief;
  selection: TemplateSelection;
} {
  const selection = selectIndustryTemplate(brief);
  const features = uniqueStrings([
    ...(brief.features ?? []),
    ...selection.requiredFeatures,
  ]);

  const metadata = patchNestedInput(
    {
      ...(brief.metadata ?? {}),
      templateSelection: selection,
      industryId: selection.industryId,
      industry: selection.industryId,
    },
    selection,
  );

  return {
    selection,
    brief: {
      ...brief,
      theme: brief.theme || selection.designPreset,
      features,
      metadata,
    },
  };
}

export function getTemplateSelectionFromBrief(
  brief: CoreBrief,
): TemplateSelection | undefined {
  const raw = brief.metadata?.templateSelection;
  if (!raw || typeof raw !== "object") return undefined;
  return raw as TemplateSelection;
}
