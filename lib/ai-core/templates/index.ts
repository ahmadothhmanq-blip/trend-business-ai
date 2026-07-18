/**
 * AI Template Engine + Industry Intelligence (Phase 6).
 */

export type {
  IndustryId,
  IndustryProfile,
  LayoutStyle,
  TemplateDesignPreset,
  TemplateSelection,
} from "@/lib/ai-core/templates/types";

export {
  INDUSTRY_PROFILES,
  INDUSTRY_IDS,
  getIndustryProfile,
  listIndustryProfiles,
  isIndustryId,
} from "@/lib/ai-core/templates/industries";

export { selectIndustryTemplate } from "@/lib/ai-core/templates/select";

export {
  enrichBriefWithIndustryTemplate,
  getTemplateSelectionFromBrief,
} from "@/lib/ai-core/templates/apply";
