/**
 * Per-industry home page component orders — unique section flow for each of 30 templates.
 * Preserves theme-scoped component IDs; only reorders body sections for visual differentiation.
 */
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";
import type { WebsiteThemePresetId } from "@/lib/website/builder/theme-catalog";
import {
  getThemeComponentIds,
  isThemeFloatingCtaComponent,
  isThemeFooterComponent,
  isThemeNavComponent,
} from "@/lib/website/builder/theme-component-registry";

/** Explicit home component trees — nav/footer/floating-cta preserved, body sections uniquely ordered. */
const HOME_COMPONENT_ORDERS: Record<string, DesignRendererComponentId[]> = {
  "ti-corporate-trust": [
    "ThemeCorporateNav",
    "ThemeCorporateHero",
    "ThemeCorporateTrust",
    "ThemeCorporateServices",
    "ThemeCorporateProcess",
    "ThemeCorporateTestimonials",
    "ThemeCorporateContact",
    "ThemeCorporateFooter",
  ],
  "ti-consulting-clarity": [
    "ThemeCorporateNav",
    "ThemeCorporateHero",
    "ThemeCorporateServices",
    "ThemeCorporateProcess",
    "ThemeCorporateTrust",
    "ThemeCorporateTestimonials",
    "ThemeCorporateContact",
    "ThemeCorporateFooter",
  ],
  "ti-saas-growth": [
    "ThemeBoldNav",
    "ThemeBoldHero",
    "ThemeBoldFeatures",
    "ThemeBoldIntegrations",
    "ThemeBoldPortfolio",
    "ThemeBoldPricing",
    "ThemeBoldFaq",
    "ThemeBoldFooter",
    "ThemeBoldFloatingCta",
  ],
  "ti-ai-company-signal": [
    "ThemeTechNav",
    "ThemeTechHero",
    "ThemeTechBento",
    "ThemeTechIntegrations",
    "ThemeTechCases",
    "ThemeTechTrust",
    "ThemeTechCta",
    "ThemeTechFooter",
    "ThemeTechFloatingCta",
  ],
  "ti-creative-studio": [
    "ThemeCreativeNav",
    "ThemeCreativeHero",
    "ThemeCreativeGallery",
    "ThemeCreativeCases",
    "ThemeCreativeStory",
    "ThemeCreativeCta",
    "ThemeCreativeFooter",
  ],
  "ti-agency-portfolio": [
    "ThemeEditorialNav",
    "ThemeEditorialHero",
    "ThemeEditorialGallery",
    "ThemeEditorialMagazine",
    "ThemeEditorialStory",
    "ThemeEditorialTimeline",
    "ThemeEditorialFooter",
  ],
  "ti-blog-editorial": [
    "ThemeEditorialNav",
    "ThemeEditorialHero",
    "ThemeEditorialMagazine",
    "ThemeEditorialTimeline",
    "ThemeEditorialStory",
    "ThemeEditorialGallery",
    "ThemeEditorialFooter",
  ],
  "ti-restaurant-dining": [
    "ThemeLuxuryNav",
    "ThemeLuxuryHero",
    "ThemeLuxuryGallery",
    "ThemeLuxuryStory",
    "ThemeLuxuryTestimonials",
    "ThemeLuxuryCta",
    "ThemeLuxuryFooter",
  ],
  "ti-cafe-artisan": [
    "ThemeMinimalNav",
    "ThemeMinimalHero",
    "ThemeMinimalServices",
    "ThemeMinimalHighlights",
    "ThemeMinimalTestimonials",
    "ThemeMinimalContact",
    "ThemeMinimalFooter",
  ],
  "ti-hotel-sanctuary": [
    "ThemeLuxuryNav",
    "ThemeLuxuryHero",
    "ThemeLuxuryGallery",
    "ThemeLuxuryTestimonials",
    "ThemeLuxuryStory",
    "ThemeLuxuryCta",
    "ThemeLuxuryFooter",
  ],
  "ti-travel-horizon": [
    "ThemeLuxuryNav",
    "ThemeLuxuryHero",
    "ThemeLuxuryStory",
    "ThemeLuxuryGallery",
    "ThemeLuxuryCta",
    "ThemeLuxuryTestimonials",
    "ThemeLuxuryFooter",
  ],
  "ti-real-estate-listings": [
    "ThemeCorporateNav",
    "ThemeCorporateHero",
    "ThemeCorporateServices",
    "ThemeCorporateTrust",
    "ThemeCorporateProcess",
    "ThemeCorporateTestimonials",
    "ThemeCorporateContact",
    "ThemeCorporateFooter",
  ],
  "ti-architecture-monograph": [
    "ThemeEditorialNav",
    "ThemeEditorialHero",
    "ThemeEditorialGallery",
    "ThemeEditorialStory",
    "ThemeEditorialTimeline",
    "ThemeEditorialMagazine",
    "ThemeEditorialFooter",
  ],
  "ti-construction-industrial": [
    "ThemeCorporateNav",
    "ThemeCorporateHero",
    "ThemeCorporateProcess",
    "ThemeCorporateTrust",
    "ThemeCorporateServices",
    "ThemeCorporateTestimonials",
    "ThemeCorporateContact",
    "ThemeCorporateFooter",
  ],
  "ti-medical-care": [
    "ThemeMinimalNav",
    "ThemeMinimalHero",
    "ThemeMinimalHighlights",
    "ThemeMinimalServices",
    "ThemeMinimalContact",
    "ThemeMinimalTestimonials",
    "ThemeMinimalFooter",
  ],
  "ti-dental-smile": [
    "ThemeMinimalNav",
    "ThemeMinimalHero",
    "ThemeMinimalServices",
    "ThemeMinimalHighlights",
    "ThemeMinimalContact",
    "ThemeMinimalTestimonials",
    "ThemeMinimalFooter",
  ],
  "ti-pharmacy-wellness": [
    "ThemeModernNav",
    "ThemeModernHero",
    "ThemeModernServices",
    "ThemeModernFeatures",
    "ThemeModernFaq",
    "ThemeModernPricing",
    "ThemeModernFooter",
  ],
  "ti-law-firm": [
    "ThemeLuxuryNav",
    "ThemeLuxuryHero",
    "ThemeLuxuryStory",
    "ThemeLuxuryGallery",
    "ThemeLuxuryTestimonials",
    "ThemeLuxuryCta",
    "ThemeLuxuryFooter",
  ],
  "ti-finance-ledger": [
    "ThemeCorporateNav",
    "ThemeCorporateHero",
    "ThemeCorporateServices",
    "ThemeCorporateTestimonials",
    "ThemeCorporateTrust",
    "ThemeCorporateProcess",
    "ThemeCorporateContact",
    "ThemeCorporateFooter",
  ],
  "ti-insurance-shield": [
    "ThemeCorporateNav",
    "ThemeCorporateHero",
    "ThemeCorporateServices",
    "ThemeCorporateTrust",
    "ThemeCorporateTestimonials",
    "ThemeCorporateProcess",
    "ThemeCorporateContact",
    "ThemeCorporateFooter",
  ],
  "ti-education-campus": [
    "ThemeModernNav",
    "ThemeModernHero",
    "ThemeModernFeatures",
    "ThemeModernPricing",
    "ThemeModernServices",
    "ThemeModernFaq",
    "ThemeModernFooter",
  ],
  "ti-university-heritage": [
    "ThemeEditorialNav",
    "ThemeEditorialHero",
    "ThemeEditorialStory",
    "ThemeEditorialTimeline",
    "ThemeEditorialMagazine",
    "ThemeEditorialGallery",
    "ThemeEditorialFooter",
  ],
  "ti-ecommerce-atelier": [
    "ThemeMinimalNav",
    "ThemeMinimalHero",
    "ThemeMinimalHighlights",
    "ThemeMinimalServices",
    "ThemeMinimalTestimonials",
    "ThemeMinimalContact",
    "ThemeMinimalFooter",
  ],
  "ti-luxury-brands-atelier": [
    "ThemeLuxuryNav",
    "ThemeLuxuryHero",
    "ThemeLuxuryGallery",
    "ThemeLuxuryCta",
    "ThemeLuxuryStory",
    "ThemeLuxuryTestimonials",
    "ThemeLuxuryFooter",
  ],
  "ti-beauty-glow": [
    "ThemeLuxuryNav",
    "ThemeLuxuryHero",
    "ThemeLuxuryStory",
    "ThemeLuxuryTestimonials",
    "ThemeLuxuryGallery",
    "ThemeLuxuryCta",
    "ThemeLuxuryFooter",
  ],
  "ti-fitness-pulse": [
    "ThemeBoldNav",
    "ThemeBoldHero",
    "ThemeBoldPortfolio",
    "ThemeBoldFeatures",
    "ThemeBoldPricing",
    "ThemeBoldFaq",
    "ThemeBoldIntegrations",
    "ThemeBoldFooter",
    "ThemeBoldFloatingCta",
  ],
  "ti-automotive-showroom": [
    "ThemeLuxuryNav",
    "ThemeLuxuryHero",
    "ThemeLuxuryGallery",
    "ThemeLuxuryStory",
    "ThemeLuxuryCta",
    "ThemeLuxuryTestimonials",
    "ThemeLuxuryFooter",
  ],
  "ti-logistics-freight": [
    "ThemeCorporateNav",
    "ThemeCorporateHero",
    "ThemeCorporateProcess",
    "ThemeCorporateServices",
    "ThemeCorporateTrust",
    "ThemeCorporateTestimonials",
    "ThemeCorporateContact",
    "ThemeCorporateFooter",
  ],
  "ti-manufacturing-precision": [
    "ThemeTechNav",
    "ThemeTechHero",
    "ThemeTechTrust",
    "ThemeTechBento",
    "ThemeTechCases",
    "ThemeTechIntegrations",
    "ThemeTechCta",
    "ThemeTechFooter",
  ],
  "ti-nonprofit-impact": [
    "ThemeModernNav",
    "ThemeModernHero",
    "ThemeModernFeatures",
    "ThemeModernServices",
    "ThemeModernFaq",
    "ThemeModernPricing",
    "ThemeModernFooter",
  ],
};

function assertValidOrder(
  tiId: string,
  themeId: WebsiteThemePresetId,
  order: DesignRendererComponentId[],
): void {
  const library = new Set(getThemeComponentIds(themeId));
  for (const id of order) {
    if (!library.has(id)) {
      throw new Error(
        `Invalid home composition for ${tiId}: ${id} not in ${themeId} library`,
      );
    }
  }
  const nav = order.filter((id) => isThemeNavComponent(id));
  const footer = order.filter((id) => isThemeFooterComponent(id));
  if (nav.length !== 1 || footer.length !== 1) {
    throw new Error(
      `Invalid home composition for ${tiId}: requires exactly one nav and footer`,
    );
  }
}

/** Resolve unique home component order for a template intelligence profile. */
export function getIndustryHomeComponents(
  templateIntelligenceId: string,
  themeId: WebsiteThemePresetId,
): DesignRendererComponentId[] {
  const order = HOME_COMPONENT_ORDERS[templateIntelligenceId];
  if (!order) return getThemeComponentIds(themeId);
  assertValidOrder(templateIntelligenceId, themeId, order);
  return order;
}

/** Layout signature for uniqueness validation — body section order only. */
export function industryHomeLayoutSignature(templateIntelligenceId: string): string {
  const order = HOME_COMPONENT_ORDERS[templateIntelligenceId];
  if (!order) return "";
  return order
    .filter(
      (id) =>
        !isThemeNavComponent(id) &&
        !isThemeFooterComponent(id) &&
        !isThemeFloatingCtaComponent(id),
    )
    .join(">");
}

export const INDUSTRY_HOME_COMPOSITION_TI_IDS = Object.keys(
  HOME_COMPONENT_ORDERS,
) as (keyof typeof HOME_COMPONENT_ORDERS)[];
