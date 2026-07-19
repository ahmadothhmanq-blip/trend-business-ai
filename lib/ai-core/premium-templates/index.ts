/**
 * Premium Templates System — world-class AI-driven industry templates
 * for Trend Business AI Website Builder.
 *
 * Packs: Luxury Business, SaaS, Real Estate, Automotive, Tourism,
 * Restaurant, Healthcare, E-commerce, Agency, Education.
 *
 * Each pack: page structure, premium layout, section order, design style,
 * recommended components, image requirements, content strategy.
 * Selection + configure adapt by industry, audience, website goal, brand style.
 */

export type {
  PremiumTemplateId,
  PremiumTemplatePage,
  PremiumTemplateSection,
  PremiumContentStrategy,
  PremiumImageRequirement,
  PremiumTemplateDefinition,
  ConfiguredPremiumTemplate,
  PremiumTemplateSelectionContext,
} from "@/lib/ai-core/premium-templates/types";

export {
  PREMIUM_TEMPLATE_CATALOG,
  PREMIUM_TEMPLATE_IDS,
  isPremiumTemplateId,
  getPremiumTemplate,
  listPremiumTemplates,
  premiumTemplateForIndustry,
} from "@/lib/ai-core/premium-templates/catalog";

export { configurePremiumTemplate } from "@/lib/ai-core/premium-templates/configure";

export { selectPremiumTemplate } from "@/lib/ai-core/premium-templates/select";

export {
  premiumToTemplateSelection,
  applyPremiumTemplateToBrief,
} from "@/lib/ai-core/premium-templates/apply";
