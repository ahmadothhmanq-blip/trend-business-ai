import type { WbTemplateRuntimeModel } from "@/lib/website/template-renderer-contract/types";
import type { WebsiteStructureTemplate } from "@/lib/website/builder/structure-templates";
import { getWebsiteStructureTemplate } from "@/lib/website/builder/structure-templates";

export type TemplateUsePayload = {
  name: string;
  tagline?: string;
  description?: string;
  industry: string;
  style: string;
  layoutType: string;
  features: string[];
  components?: string[];
};

export type ResolveEffectiveProjectBriefInput = {
  projectBrief: string;
  language: string;
  tpl?: TemplateUsePayload;
  websiteStructureTemplateId?: string | null;
  templateIndustry?: string | null;
  templateComponents?: string[];
  autoDesignHint?: string | null;
  templateRuntimeModel?: WbTemplateRuntimeModel | null;
  placeholderFallback: string;
};

function stripExamplePrefix(text: string): string {
  return text.replace(/^e\.g\.\s*/i, "").trim();
}

export function buildBriefFromStructureTemplate(
  template: WebsiteStructureTemplate,
  websiteLanguage: string,
  extras?: {
    components?: string[];
    autoHint?: string | null;
  },
): string {
  const structureOnly =
    websiteLanguage !== "English"
      ? `\n\nSTRUCTURE ONLY (do not copy English labels into the website): Template metadata below describes layout, sections, and design — NOT the output language. Every visible string in the generated site MUST be in ${websiteLanguage}.`
      : "";
  return [
    `Build a ${template.label} website.`,
    template.description,
    `Industry: ${template.industry}. Layout: ${template.layoutType}.`,
    extras?.components?.length
      ? `Preferred sections: ${extras.components.slice(0, 8).join(", ")}.`
      : "",
    extras?.autoHint,
    structureOnly,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function buildBriefFromTemplatePayload(
  payload: TemplateUsePayload,
  websiteLanguage: string,
): string {
  const structureOnly =
    websiteLanguage !== "English"
      ? `\n\nSTRUCTURE ONLY (do not copy English labels into the website): Template metadata below describes layout, sections, and design — NOT the output language. Every visible string in the generated site MUST be in ${websiteLanguage}.`
      : "";
  return [
    `Build a ${payload.name} website.`,
    payload.tagline,
    payload.description,
    `Industry: ${payload.industry}. Style: ${payload.style}. Layout: ${payload.layoutType}.`,
    payload.features.length
      ? `Include: ${payload.features.slice(0, 8).join(", ")}.`
      : "",
    payload.components?.length
      ? `Preferred sections: ${payload.components.join(", ")}.`
      : "",
    structureOnly,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

/**
 * Resolve the API brief from textarea state and builder selections before generation.
 */
export function resolveEffectiveProjectBrief(
  input: ResolveEffectiveProjectBriefInput,
): string {
  const trimmed = input.projectBrief.trim();
  if (trimmed) return trimmed;

  if (input.tpl) {
    return buildBriefFromTemplatePayload(input.tpl, input.language);
  }

  const structureId = input.websiteStructureTemplateId?.trim();
  if (structureId) {
    const template = getWebsiteStructureTemplate(structureId);
    if (template) {
      return buildBriefFromStructureTemplate(template, input.language, {
        components: input.templateComponents,
        autoHint: input.autoDesignHint,
      });
    }
  }

  if (input.templateRuntimeModel) {
    const template = input.templateRuntimeModel.template;
    return [
      `Build a ${template.name} website.`,
      template.description,
      input.autoDesignHint,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  if (input.templateIndustry?.trim() || input.autoDesignHint?.trim()) {
    return [
      `Build a professional ${input.templateIndustry?.trim() || "business"} website.`,
      input.autoDesignHint,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  return stripExamplePrefix(input.placeholderFallback);
}
