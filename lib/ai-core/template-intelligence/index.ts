export type {
  TemplateIntelligenceCategory,
  TemplateIntelligenceDefinition,
  TemplateIntelligenceSelectionInput,
  TemplateIntelligenceSelectionResult,
  TemplateAnimationProfile,
  TemplateColorSystem,
  TemplateTypographySystem,
} from "@/lib/ai-core/template-intelligence/types";

export { TEMPLATE_INTELLIGENCE_CATEGORIES } from "@/lib/ai-core/template-intelligence/types";

export {
  TEMPLATE_INTELLIGENCE_CATALOG,
  listTemplateIntelligence,
  getTemplateIntelligence,
  isTemplateIntelligenceId,
} from "@/lib/ai-core/template-intelligence/catalog";

export {
  selectTemplateIntelligence,
  selectionInputFromBrief,
} from "@/lib/ai-core/template-intelligence/select";

export {
  applyTemplateIntelligenceToBrief,
  applyTemplateIntelligenceRetheme,
  resolveTemplateIntelligenceId,
} from "@/lib/ai-core/template-intelligence/apply";

export { buildTemplateIntelligencePreviewHtml } from "@/lib/ai-core/template-intelligence/preview";
