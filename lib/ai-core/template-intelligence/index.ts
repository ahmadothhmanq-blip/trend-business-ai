export type {
  TemplateIntelligenceCategory,
  TemplateIntelligenceDefinition,
  TemplateIntelligenceSelectionInput,
  TemplateIntelligenceSelectionResult,
  TemplateAnimationProfile,
  TemplateColorSystem,
  TemplateTypographySystem,
  TemplateVisualPreset,
  TemplateSectionSpec,
  TemplateHeroVariant,
  TemplateCardVariant,
  TemplateNavigationVariant,
  TemplateFooterVariant,
  TemplateSpacingPreset,
  TemplateButtonPreset,
  TemplateChromePreset,
  TemplateLayoutPreset,
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
  applyTemplateVisualSwitch,
  resolveTemplateIntelligenceId,
} from "@/lib/ai-core/template-intelligence/apply";

export {
  resolveTemplateVisualPreset,
  buildTemplateVisualCss,
} from "@/lib/ai-core/template-intelligence/visual-preset";

export {
  resolveComponentsForIndustryAndTemplate,
  resolveVerticalPaletteId,
  sanitizeCtaForIndustry,
  getIndustryComponentPalette,
  getSectionLabelForIndustry,
  normalizeVerticalIndustryId,
  inferVerticalFromText,
  PALETTE_TECHNOLOGY,
  PALETTE_SAAS,
  PALETTE_AUTOMOTIVE,
  PALETTE_RESTAURANT,
  PALETTE_REAL_ESTATE,
} from "@/lib/ai-core/template-intelligence/industry-palettes";

export { buildSectionSpecsFromComponents } from "@/lib/ai-core/template-intelligence/section-specs";

export {
  resolveTemplateIntelligenceForMarketplace,
  verifyCanonicalTemplateIntelligenceCatalog,
  CANONICAL_TEMPLATE_INTELLIGENCE_IDS,
} from "@/lib/ai-core/template-intelligence/resolve-marketplace";

export { buildTemplateIntelligencePreviewHtml } from "@/lib/ai-core/template-intelligence/preview";
