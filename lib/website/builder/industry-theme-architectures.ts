/**
 * Industry Template Intelligence → Theme Architecture routing.
 * Enables Theme* scaffold preview/injection for installed structure templates.
 */
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";
import type {
  ThemePageArchitecture,
  ThemePageTopology,
  ThemeSectionShellVariant,
} from "@/lib/website/builder/theme-architecture";
import type { WebsiteThemePresetId } from "@/lib/website/builder/theme-catalog";
import { getIndustryHomeComponents } from "@/lib/website/builder/industry-home-compositions";
import { getThemeComponentIds } from "@/lib/website/builder/theme-component-registry";

type IndustryArchSeed = Omit<ThemePageArchitecture, "components"> & {
  components?: DesignRendererComponentId[];
};

function industryArch(seed: IndustryArchSeed): ThemePageArchitecture {
  return {
    ...seed,
    components:
      seed.components ??
      getIndustryHomeComponents(seed.templateIntelligenceId, seed.themeId),
  };
}

/** Premium industry TI profiles — each maps to a distinct theme topology. */
export const INDUSTRY_THEME_ARCHITECTURES: ThemePageArchitecture[] = [
  industryArch({
    themeId: "corporate",
    templateIntelligenceId: "ti-consulting-clarity",
    pageTopology: "sidebar-rail",
    sectionShellVariant: "default",
    description: "Enterprise consulting · sidebar intelligence · capability matrix",
    animationLanguage: "consulting reveal · staggered trust bands",
    responsiveBehavior: "collapsible rail · executive hierarchy · solid CTAs",
    floatingCta: false,
  }),
  industryArch({
    themeId: "technology",
    templateIntelligenceId: "ti-ai-company-signal",
    pageTopology: "sidebar-rail",
    sectionShellVariant: "bento",
    description: "AI signal · glass bento · interactive hero · glow accents",
    animationLanguage: "interactive stagger · glow-in · parallax-lite",
    responsiveBehavior: "dark mode · glass panels · sticky product CTA",
    floatingCta: true,
  }),
  industryArch({
    themeId: "editorial",
    templateIntelligenceId: "ti-agency-portfolio",
    pageTopology: "fullscreen-editorial",
    sectionShellVariant: "magazine",
    description: "Marketing agency · campaign showcase · conversion bands",
    animationLanguage: "editorial scroll · bold typography motion",
    responsiveBehavior: "magazine columns · performance CTAs",
    floatingCta: false,
  }),
  industryArch({
    themeId: "editorial",
    templateIntelligenceId: "ti-blog-editorial",
    pageTopology: "fullscreen-editorial",
    sectionShellVariant: "magazine",
    description: "Portfolio editorial · asymmetric mosaic · journal rhythm",
    animationLanguage: "magazine flow · column parallax",
    responsiveBehavior: "editorial type scale · minimal chrome",
    floatingCta: false,
  }),
  industryArch({
    themeId: "luxury",
    templateIntelligenceId: "ti-restaurant-dining",
    pageTopology: "fullscreen-editorial",
    sectionShellVariant: "editorial",
    description: "Fine dining · cinematic food hero · reservation-first",
    animationLanguage: "cinematic slow-reveal · warm parallax",
    responsiveBehavior: "immersive hero · atmospheric overlays",
    floatingCta: false,
  }),
  industryArch({
    themeId: "minimal",
    templateIntelligenceId: "ti-cafe-artisan",
    pageTopology: "card-first-masonry",
    sectionShellVariant: "minimal",
    description: "Artisan cafe · morning light · menu cards · community warmth",
    animationLanguage: "warm reveal · gentle stagger",
    responsiveBehavior: "rounded cards · cozy whitespace",
    floatingCta: false,
  }),
  industryArch({
    themeId: "luxury",
    templateIntelligenceId: "ti-hotel-sanctuary",
    pageTopology: "classic-stack",
    sectionShellVariant: "editorial",
    description: "Five-star sanctuary · room galleries · spa rituals",
    animationLanguage: "sanctuary parallax · soft reveals",
    responsiveBehavior: "immersive hospitality · concierge CTAs",
    floatingCta: false,
  }),
  industryArch({
    themeId: "luxury",
    templateIntelligenceId: "ti-travel-horizon",
    pageTopology: "fullscreen-editorial",
    sectionShellVariant: "editorial",
    description: "Travel horizon · destination cinematics · expedition booking",
    animationLanguage: "horizon scroll · destination fade",
    responsiveBehavior: "full-bleed destinations · package grids",
    floatingCta: false,
  }),
  industryArch({
    themeId: "corporate",
    templateIntelligenceId: "ti-real-estate-listings",
    pageTopology: "classic-stack",
    sectionShellVariant: "default",
    description: "Property showcase · listing intelligence · agent trust",
    animationLanguage: "property fade · card lift",
    responsiveBehavior: "listing grids · neighborhood proof",
    floatingCta: false,
  }),
  industryArch({
    themeId: "editorial",
    templateIntelligenceId: "ti-architecture-monograph",
    pageTopology: "fullscreen-editorial",
    sectionShellVariant: "magazine",
    description: "Architecture monograph · project folios · process essays",
    animationLanguage: "monograph flow · editorial columns",
    responsiveBehavior: "museum spacing · inquiry CTAs",
    floatingCta: false,
  }),
  industryArch({
    themeId: "corporate",
    templateIntelligenceId: "ti-construction-industrial",
    pageTopology: "classic-stack",
    sectionShellVariant: "default",
    description: "Industrial construction · capability matrix · safety trust",
    animationLanguage: "industrial snap · grid stagger",
    responsiveBehavior: "heavy-duty hierarchy · bid CTAs",
    floatingCta: false,
  }),
  industryArch({
    themeId: "minimal",
    templateIntelligenceId: "ti-medical-care",
    pageTopology: "classic-stack",
    sectionShellVariant: "minimal",
    description: "Clinical calm · care services · physician profiles",
    animationLanguage: "clinical calm · soft fade-up",
    responsiveBehavior: "accessible forms · trust hierarchy",
    floatingCta: false,
  }),
  industryArch({
    themeId: "minimal",
    templateIntelligenceId: "ti-dental-smile",
    pageTopology: "card-first-masonry",
    sectionShellVariant: "minimal",
    description: "Dental smile · bright trust · treatment clarity",
    animationLanguage: "smile reveal · gentle scale",
    responsiveBehavior: "rounded clinical cards · booking flows",
    floatingCta: false,
  }),
  industryArch({
    themeId: "modern",
    templateIntelligenceId: "ti-pharmacy-wellness",
    pageTopology: "classic-stack",
    sectionShellVariant: "default",
    description: "Pharmacy wellness · service lanes · pharmacist trust",
    animationLanguage: "wellness soft · warm reveal",
    responsiveBehavior: "wellness lanes · accessible CTAs",
    floatingCta: false,
  }),
  industryArch({
    themeId: "luxury",
    templateIntelligenceId: "ti-law-firm",
    pageTopology: "classic-stack",
    sectionShellVariant: "editorial",
    description: "Law firm authority · dark luxury · practice depth",
    animationLanguage: "authority cinematic · measured reveals",
    responsiveBehavior: "gravitas typography · consultation CTAs",
    floatingCta: false,
  }),
  industryArch({
    themeId: "corporate",
    templateIntelligenceId: "ti-finance-ledger",
    pageTopology: "sidebar-rail",
    sectionShellVariant: "default",
    description: "Finance ledger · institutional trust · advisory depth",
    animationLanguage: "ledger fade · precision stagger",
    responsiveBehavior: "data-forward hierarchy · portal CTAs",
    floatingCta: false,
  }),
  industryArch({
    themeId: "corporate",
    templateIntelligenceId: "ti-insurance-shield",
    pageTopology: "classic-stack",
    sectionShellVariant: "default",
    description: "Insurance shield · plan comparison · advisor trust",
    animationLanguage: "shield trust · subtle fade-up",
    responsiveBehavior: "plan cards · quote flows",
    floatingCta: false,
  }),
  industryArch({
    themeId: "modern",
    templateIntelligenceId: "ti-education-campus",
    pageTopology: "classic-stack",
    sectionShellVariant: "default",
    description: "Education campus · programs grid · admissions forward",
    animationLanguage: "campus rise · friendly stagger",
    responsiveBehavior: "program cards · enrollment CTAs",
    floatingCta: false,
  }),
  industryArch({
    themeId: "editorial",
    templateIntelligenceId: "ti-university-heritage",
    pageTopology: "fullscreen-editorial",
    sectionShellVariant: "magazine",
    description: "University heritage · scholarly gravitas · research highlights",
    animationLanguage: "heritage cinematic · serif motion",
    responsiveBehavior: "campus storytelling · apply grandeur",
    floatingCta: false,
  }),
  industryArch({
    themeId: "minimal",
    templateIntelligenceId: "ti-ecommerce-atelier",
    pageTopology: "card-first-masonry",
    sectionShellVariant: "card-first",
    description: "E-commerce atelier · editorial product · curated collections",
    animationLanguage: "atelier scroll · product lift",
    responsiveBehavior: "editorial commerce · seamless checkout cues",
    floatingCta: true,
  }),
  industryArch({
    themeId: "luxury",
    templateIntelligenceId: "ti-luxury-brands-atelier",
    pageTopology: "fullscreen-editorial",
    sectionShellVariant: "editorial",
    description: "Fashion runway · haute couture · lookbook cinematics",
    animationLanguage: "runway cinematic · editorial parallax",
    responsiveBehavior: "dark luxury · oversized type",
    floatingCta: false,
  }),
  industryArch({
    themeId: "luxury",
    templateIntelligenceId: "ti-beauty-glow",
    pageTopology: "fullscreen-editorial",
    sectionShellVariant: "editorial",
    description: "Beauty glow · luminous spa · ritual storytelling",
    animationLanguage: "glow parallax · soft luminance",
    responsiveBehavior: "spa editorial · booking luxury",
    floatingCta: false,
  }),
  industryArch({
    themeId: "bold",
    templateIntelligenceId: "ti-fitness-pulse",
    pageTopology: "card-first-masonry",
    sectionShellVariant: "card-first",
    description: "Fitness pulse · athletic momentum · membership conversion",
    animationLanguage: "energetic pulse · scale-in",
    responsiveBehavior: "dark energy · bold CTAs",
    floatingCta: true,
  }),
  industryArch({
    themeId: "luxury",
    templateIntelligenceId: "ti-automotive-showroom",
    pageTopology: "fullscreen-editorial",
    sectionShellVariant: "editorial",
    description: "Automotive showroom · vehicle stage · inventory intelligence",
    animationLanguage: "showroom cinematic · stage reveal",
    responsiveBehavior: "showroom dark · test-drive CTAs",
    floatingCta: false,
  }),
  industryArch({
    themeId: "corporate",
    templateIntelligenceId: "ti-logistics-freight",
    pageTopology: "sidebar-rail",
    sectionShellVariant: "default",
    description: "Logistics freight · fleet proof · route intelligence",
    animationLanguage: "freight snap · operations stagger",
    responsiveBehavior: "industrial clarity · quote flows",
    floatingCta: false,
  }),
  industryArch({
    themeId: "technology",
    templateIntelligenceId: "ti-manufacturing-precision",
    pageTopology: "sidebar-rail",
    sectionShellVariant: "bento",
    description: "Manufacturing precision · engineering matrix · quality certs",
    animationLanguage: "precision crisp · technical stagger",
    responsiveBehavior: "spec cards · RFQ conversion",
    floatingCta: false,
  }),
  industryArch({
    themeId: "modern",
    templateIntelligenceId: "ti-nonprofit-impact",
    pageTopology: "classic-stack",
    sectionShellVariant: "default",
    description: "Nonprofit impact · mission storytelling · donation paths",
    animationLanguage: "impact warm · human stories",
    responsiveBehavior: "warm humanitarian · volunteer CTAs",
    floatingCta: false,
  }),
];

/** Structure-template TI ids that must resolve to Theme* architecture. */
export const PREMIUM_STRUCTURE_TEMPLATE_TI_IDS = [
  "ti-corporate-trust",
  "ti-ai-company-signal",
] as const;

export function topologyForIndustryTi(
  tiId: string,
): ThemePageTopology | undefined {
  return INDUSTRY_THEME_ARCHITECTURES.find((a) => a.templateIntelligenceId === tiId)
    ?.pageTopology;
}

export function shellVariantForIndustryTi(
  tiId: string,
): ThemeSectionShellVariant | undefined {
  return INDUSTRY_THEME_ARCHITECTURES.find((a) => a.templateIntelligenceId === tiId)
    ?.sectionShellVariant;
}
