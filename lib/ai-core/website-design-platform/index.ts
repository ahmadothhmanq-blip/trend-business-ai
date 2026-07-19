/**
 * Website Design Platform — public exports.
 */

export type {
  DesignPlatformFamily,
  DesignPlatformVertical,
  TemplateControlSurface,
  AutoDesignDecision,
  WebsiteIntelligenceSuggestion,
  WebsiteIntelligenceReport,
  BrandKitAttachment,
  FormLeadPayload,
  FormIntegrationConfig,
} from "@/lib/ai-core/website-design-platform/types";

export {
  DESIGN_PLATFORM_TAXONOMY,
  mapIndustryToVertical,
} from "@/lib/ai-core/website-design-platform/families";

export {
  runAutoDesignDecision,
  type AutoDesignInput,
} from "@/lib/ai-core/website-design-platform/auto-design";

export { buildControlSurfaceForTemplate } from "@/lib/ai-core/website-design-platform/template-architecture";

export {
  resolveLocaleFromLanguage,
  applyLocaleToWebsiteFiles,
  buildTranslationBrief,
  type SiteLocaleConfig,
} from "@/lib/ai-core/website-design-platform/i18n";

export { runWebsiteIntelligence } from "@/lib/ai-core/website-design-platform/intelligence";

export {
  brandKitFromIdentityRow,
  applyBrandKitToDesignSystem,
  applyBrandKitTokensToFiles,
} from "@/lib/ai-core/website-design-platform/brand-kit";

export {
  storeWebsiteLead,
  listWebsiteLeads,
  notifyLeadIntegrations,
  buildFormSubmitClientSnippet,
} from "@/lib/ai-core/website-design-platform/forms";

export {
  runWebsitePerformanceUpgrade,
  applyPerformancePatches,
} from "@/lib/ai-core/website-design-platform/performance";
