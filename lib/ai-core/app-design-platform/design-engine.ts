/**
 * AI App Design Engine — plans structured blueprints before code generation.
 */

import { matchTemplateFromSignals, getAppTemplate } from "@/lib/ai-core/app-design-platform/templates";
import type {
  AppDesignBlueprint,
  AppTemplateId,
  StructuredAppModel,
} from "@/lib/ai-core/app-design-platform/types";
import { buildStructuredAppModel } from "@/lib/ai-core/app-design-platform/model-builder";

export type AppDesignInput = {
  prompt: string;
  appType?: string;
  language?: string;
  designStyle?: string;
  colorStyle?: string;
  features?: string[];
  industryHint?: string;
};

const INDUSTRY_HINTS: Array<{ industry: string; keys: string[] }> = [
  { industry: "Food & Hospitality", keys: ["restaurant", "cafe", "hotel", "food"] },
  { industry: "Retail & Commerce", keys: ["shop", "store", "ecommerce", "retail"] },
  { industry: "Services", keys: ["salon", "booking", "appointment", "clinic"] },
  { industry: "Sales", keys: ["crm", "sales", "pipeline", "leads"] },
  { industry: "Enterprise", keys: ["erp", "operations", "hr", "finance module"] },
  { industry: "Logistics", keys: ["inventory", "warehouse", "stock"] },
  { industry: "Software", keys: ["saas", "software", "platform", "dashboard"] },
  { industry: "Education", keys: ["school", "course", "lms", "learning"] },
  { industry: "Real Estate", keys: ["property", "real estate", "listing"] },
  { industry: "Automotive", keys: ["car", "auto", "vehicle", "dealership"] },
  { industry: "Healthcare", keys: ["health", "patient", "medical", "hospital"] },
  { industry: "Finance", keys: ["finance", "accounting", "budget", "banking"] },
];

function detectIndustry(prompt: string, hint?: string): string {
  if (hint?.trim()) return hint.trim();
  const hay = prompt.toLowerCase();
  for (const row of INDUSTRY_HINTS) {
    if (row.keys.some((k) => hay.includes(k))) return row.industry;
  }
  return "Business Software";
}

/**
 * Deterministic intelligent design pass — selects template, architecture,
 * screens, roles, workflows before file generation.
 */
export function runAppDesignEngine(input: AppDesignInput): {
  blueprint: AppDesignBlueprint;
  model: StructuredAppModel;
} {
  const industry = detectIndustry(input.prompt, input.industryHint);
  const template = matchTemplateFromSignals({
    appType: input.appType,
    prompt: input.prompt,
    industry,
  });

  const featureSet = new Set([
    ...template.defaultFeatures,
    ...(input.features || []),
  ]);

  const blueprint: AppDesignBlueprint = {
    idea: input.prompt.trim(),
    industry,
    appType: input.appType || template.id,
    templateId: template.id,
    architecture: template.architecture,
    screens: template.screens.map((s) => s.name),
    navigationFlow: template.navigation.map((n) => `${n.label} → ${n.href}`),
    features: [...featureSet],
    roles: template.roles.map((r) => r.name),
    workflows: template.workflows.map((w) => w.name),
    dataEntities: template.dataModels.map((m) => m.name),
    confidence: template.id === "saas-dashboard" && !input.appType ? 0.72 : 0.9,
    reason: `Selected ${template.label} architecture (${template.architecture}) for ${industry}.`,
  };

  const model = buildStructuredAppModel({
    templateId: template.id,
    prompt: input.prompt,
    language: input.language || "English",
    designStyle: input.designStyle,
    colorStyle: input.colorStyle,
    features: [...featureSet],
    appName: deriveAppName(input.prompt, template.label),
  });

  return { blueprint, model };
}

export function deriveAppName(prompt: string, fallback: string): string {
  const quoted = prompt.match(/["']([^"']{2,60})["']/);
  if (quoted?.[1]) return quoted[1].trim();
  const named = prompt.match(
    /(?:called|named|brand|app(?:lication)?)\s+([A-Z][\w\s&-]{1,40})/,
  );
  if (named?.[1]) return named[1].trim();
  const first = prompt.split(/[.!\n]/)[0]?.trim();
  if (first && first.length <= 48) return first;
  return `${fallback} App`;
}

export function resolveTemplateId(id: string): AppTemplateId {
  return getAppTemplate(id)?.id ?? "saas-dashboard";
}
