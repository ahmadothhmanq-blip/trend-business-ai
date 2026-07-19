/**
 * Smart Template Engine — Website Builder professional template library.
 * Prompt → DeepSeek analysis → template selection → design configuration.
 */

export type {
  SmartTemplateId,
  SmartTemplateDefinition,
  SmartTemplateSelectionResult,
  SmartTemplateColorPalette,
  SmartTemplateTypography,
  SmartTemplateCtaStyle,
  SmartTemplateFooter,
  SmartTemplateSection,
} from "@/lib/website/smart-templates/types";

export {
  SMART_TEMPLATE_CATALOG,
  SMART_TEMPLATE_IDS,
  getSmartTemplate,
  listSmartTemplates,
  isSmartTemplateId,
} from "@/lib/website/smart-templates/catalog";

export {
  selectSmartTemplate,
  mergeSmartTemplateFeatures,
} from "@/lib/website/smart-templates/select";

export {
  enrichBriefWithSmartTemplate,
  smartSelectionToTemplateSelection,
} from "@/lib/website/smart-templates/apply";

export {
  loadSmartTemplatesFromDatabase,
  getCatalogTemplate,
} from "@/lib/website/smart-templates/repository";
