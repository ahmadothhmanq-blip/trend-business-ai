import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import { getWebsiteIndustryIntelligence } from "@/lib/ai-core/industry-intelligence/profiles";
import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type { IndustryId } from "@/lib/ai-core/templates/types";
import {
  getSmartTemplate,
  isSmartTemplateId,
  listSmartTemplates,
  SMART_TEMPLATE_IDS,
} from "@/lib/website/smart-templates/catalog";
import type {
  SmartTemplateId,
  SmartTemplateSelectionResult,
} from "@/lib/website/smart-templates/types";

export type SelectSmartTemplateOptions = {
  /** Preferred industry from AI Industry Website Intelligence. */
  preferredIndustryId?: IndustryId;
};

function templateForIndustry(industryId: IndustryId): SmartTemplateId | null {
  const preferred =
    getWebsiteIndustryIntelligence(industryId).preferredSmartTemplateId;
  if (preferred && isSmartTemplateId(preferred)) return preferred;
  return null;
}

function uniqueFeatures(values: string[]): string[] {
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

function haystackFromBrief(brief: CoreBrief): string {
  const meta = brief.metadata ?? {};
  const nested: string[] = [];
  const input = meta.websiteGenerationInput;
  if (input && typeof input === "object") {
    const row = input as Record<string, unknown>;
    if (typeof row.projectType === "string") nested.push(row.projectType);
    if (typeof row.templateId === "string") nested.push(row.templateId);
  }
  return [
    brief.prompt,
    brief.theme,
    ...(brief.features ?? []),
    typeof meta.templateId === "string" ? meta.templateId : "",
    ...nested,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function explicitTemplateId(brief: CoreBrief): SmartTemplateId | null {
  const meta = brief.metadata ?? {};
  const candidates: unknown[] = [
    meta.templateId,
    meta.smartTemplateId,
    ...(brief.features ?? []),
  ];

  const input = meta.websiteGenerationInput;
  if (input && typeof input === "object") {
    candidates.push((input as { templateId?: string }).templateId);
  }

  for (const raw of candidates) {
    if (typeof raw !== "string") continue;
    const value = raw.trim().toLowerCase();
    const fromFeature = value.startsWith("template:")
      ? value.slice("template:".length)
      : value;
    if (isSmartTemplateId(fromFeature)) return fromFeature;
  }
  return null;
}

function scoreTemplate(haystack: string, templateId: SmartTemplateId): number {
  const template = getSmartTemplate(templateId);
  let score = 0;
  for (const keyword of template.keywords) {
    if (haystack.includes(keyword.toLowerCase())) {
      score += keyword.length > 6 ? 2 : 1;
    }
  }
  if (haystack.includes(template.name.toLowerCase())) score += 3;
  if (haystack.includes(template.category.toLowerCase())) score += 2;
  return score;
}

function toResult(
  templateId: SmartTemplateId,
  confidence: number,
  reason: string,
  source: SmartTemplateSelectionResult["source"],
): SmartTemplateSelectionResult {
  const template = getSmartTemplate(templateId);
  return {
    templateId,
    confidence,
    reason,
    source,
    designConfiguration: {
      layoutStyle: template.layoutStyle,
      designPreset: template.designPreset,
      colorPalette: template.colorPalette,
      typography: template.typography,
      ctaStyle: template.ctaStyle,
      navigation: [...template.navigation],
      footer: { ...template.footer, columns: [...template.footer.columns] },
      sections: template.sections.map((s) => s.label),
      requiredPages: [...template.requiredPages],
      requiredFeatures: [...template.requiredFeatures],
      contentTone: template.contentTone,
    },
    template,
  };
}

function selectByKeywords(brief: CoreBrief): SmartTemplateSelectionResult {
  const haystack = haystackFromBrief(brief);
  let bestId: SmartTemplateId = "saas-startup";
  let bestScore = 0;

  for (const id of SMART_TEMPLATE_IDS) {
    const score = scoreTemplate(haystack, id);
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }

  if (bestScore <= 0) {
    return toResult(
      "agency",
      0.4,
      "No strong industry signals — using Agency as a versatile professional default.",
      "default",
    );
  }

  return toResult(
    bestId,
    Math.min(0.92, 0.48 + bestScore * 0.07),
    `Matched keywords for ${getSmartTemplate(bestId).name}.`,
    "keyword",
  );
}

type AnalysisPayload = {
  templateId?: string;
  confidence?: number;
  reason?: string;
};

/**
 * Analyze business description with DeepSeek and choose the best smart template.
 * Honors Industry Website Intelligence when provided; falls back to keywords.
 */
export async function selectSmartTemplate(
  brief: CoreBrief,
  options?: SelectSmartTemplateOptions,
): Promise<SmartTemplateSelectionResult> {
  const explicit = explicitTemplateId(brief);
  if (explicit) {
    return toResult(explicit, 1, "Explicit template override.", "explicit");
  }

  const preferredIndustry =
    options?.preferredIndustryId ||
    (typeof brief.metadata?.industryId === "string"
      ? (brief.metadata.industryId as IndustryId)
      : undefined);
  const preferredTemplate = preferredIndustry
    ? templateForIndustry(preferredIndustry)
    : null;

  const catalog = listSmartTemplates().map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    industryId: t.industryId,
    description: t.description,
    keywords: t.keywords.slice(0, 8),
  }));

  const resolved = providerManager.resolve(getDefaultTextProvider());
  if (!resolved) {
    if (preferredTemplate) {
      const intel = preferredIndustry
        ? getWebsiteIndustryIntelligence(preferredIndustry)
        : null;
      return toResult(
        preferredTemplate,
        0.82,
        intel
          ? `Industry intelligence mapped ${intel.label} → ${getSmartTemplate(preferredTemplate).name}.`
          : `Preferred industry template ${preferredTemplate}.`,
        "keyword",
      );
    }
    return selectByKeywords(brief);
  }

  try {
    const industryHint = preferredIndustry
      ? `\nDetected industry: ${preferredIndustry} (prefer matching template when fit is strong).`
      : "";
    const preferredHint = preferredTemplate
      ? `\nPreferred template id from industry intelligence: ${preferredTemplate}`
      : "";

    const analysis = await providerManager.generateJson<AnalysisPayload>(
      {
        system:
          "You are a website template strategist for a Webflow/Wix/Framer-class builder. Pick exactly one template id from the catalog that best fits the business and industry. Respond with JSON only.",
        prompt: `Business description / brief:
"""
${brief.prompt}
"""

Theme: ${brief.theme ?? "n/a"}
Features: ${(brief.features ?? []).join(", ") || "n/a"}${industryHint}${preferredHint}

Template catalog:
${JSON.stringify(catalog, null, 2)}

Return JSON:
{
  "templateId": "<one of the catalog ids>",
  "confidence": 0.0-1.0,
  "reason": "one short sentence"
}`,
        temperature: 0.2,
      },
      resolved,
    );

    const id =
      typeof analysis.templateId === "string"
        ? analysis.templateId.trim().toLowerCase()
        : "";
    if (isSmartTemplateId(id)) {
      const confidence =
        typeof analysis.confidence === "number"
          ? Math.min(1, Math.max(0.35, analysis.confidence))
          : 0.85;
      return toResult(
        id,
        confidence,
        typeof analysis.reason === "string" && analysis.reason.trim()
          ? analysis.reason.trim()
          : `DeepSeek selected ${getSmartTemplate(id).name}.`,
        "analysis",
      );
    }
  } catch {
    // Fall through
  }

  if (preferredTemplate) {
    return toResult(
      preferredTemplate,
      0.8,
      `Fallback to industry-preferred template ${getSmartTemplate(preferredTemplate).name}.`,
      "keyword",
    );
  }

  return selectByKeywords(brief);
}

export function mergeSmartTemplateFeatures(
  features: string[] | undefined,
  selection: SmartTemplateSelectionResult,
): string[] {
  return uniqueFeatures([
    ...(features ?? []),
    ...selection.designConfiguration.requiredFeatures,
    `template:${selection.templateId}`,
  ]);
}
