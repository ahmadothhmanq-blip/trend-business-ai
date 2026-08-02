/**
 * Theme Architecture — each theme owns a distinct page topology and exclusive component library.
 */

import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";
import type { WebsiteThemePresetId } from "@/lib/website/builder/theme-catalog";
import { INDUSTRY_THEME_ARCHITECTURES } from "@/lib/website/builder/industry-theme-architectures";
import { getIndustryHomeComponents } from "@/lib/website/builder/industry-home-compositions";

import type { ThemePageTopology, ThemeSectionShellVariant } from "@/lib/website/contracts/theme-architecture";
export type {
  ThemePageTopology,
  ThemeSectionShellVariant,
} from "@/lib/website/contracts/theme-architecture";

export type ThemePageArchitecture = {
  themeId: WebsiteThemePresetId;
  templateIntelligenceId: string;
  pageTopology: ThemePageTopology;
  sectionShellVariant: ThemeSectionShellVariant;
  /** Exclusive theme-scoped component tree — no shared theme components across themes. */
  components: DesignRendererComponentId[];
  floatingCta: boolean;
  animationLanguage: string;
  responsiveBehavior: string;
  description: string;
};

function arch(
  entry: Omit<ThemePageArchitecture, "components"> & {
    components?: DesignRendererComponentId[];
  },
): ThemePageArchitecture {
  const components =
    entry.components ??
    getIndustryHomeComponents(entry.templateIntelligenceId, entry.themeId);
  return { ...entry, components };
}

export const THEME_PAGE_ARCHITECTURES: ThemePageArchitecture[] = [
  arch({
    themeId: "luxury",
    templateIntelligenceId: "ti-luxury-noir",
    pageTopology: "classic-stack",
    sectionShellVariant: "editorial",
    description: "Transparent overlay nav · luxury editorial hero · storytelling · mosaic gallery",
    animationLanguage: "cinematic slow-reveal · parallax-lite",
    responsiveBehavior: "fluid type · stacked editorial bands · ghost CTAs",
    floatingCta: false,
  }),
  arch({
    themeId: "modern",
    templateIntelligenceId: "ti-modern-clean",
    pageTopology: "classic-stack",
    sectionShellVariant: "default",
    description: "Pill navigation · split product hero · feature grid · pricing band",
    animationLanguage: "stagger cards 70ms · fade-up",
    responsiveBehavior: "sticky pill nav · stacked feature grid · solid CTAs",
    floatingCta: false,
  }),
  arch({
    themeId: "minimal",
    templateIntelligenceId: "ti-minimal-white",
    pageTopology: "card-first-masonry",
    sectionShellVariant: "minimal",
    description: "Centered logo nav · full-bleed hero · borderless highlights · quiet footer",
    animationLanguage: "soft fade-up · no parallax",
    responsiveBehavior: "centered nav · card-first bands · generous whitespace",
    floatingCta: false,
  }),
  arch({
    themeId: "corporate",
    templateIntelligenceId: "ti-corporate-trust",
    pageTopology: "classic-stack",
    sectionShellVariant: "default",
    description: "Corporate topbar · split trust hero · process steps · trust strip",
    animationLanguage: "subtle fade-up entrances",
    responsiveBehavior: "sticky topbar · trust-first hierarchy · multi-column footer",
    floatingCta: false,
  }),
  arch({
    themeId: "creative",
    templateIntelligenceId: "ti-creative-studio",
    pageTopology: "fullscreen-editorial",
    sectionShellVariant: "magazine",
    description: "Studio transparent nav · cinematic fullscreen hero · portfolio mosaic",
    animationLanguage: "asymmetric staggered reveals",
    responsiveBehavior: "overlay nav on hero · mosaic breakpoints · bold CTAs",
    floatingCta: false,
  }),
  arch({
    themeId: "technology",
    templateIntelligenceId: "ti-technology-dark",
    pageTopology: "sidebar-rail",
    sectionShellVariant: "bento",
    description: "Sidebar navigation · interactive hero · glass bento grid · floating CTA",
    animationLanguage: "interactive stagger · glow-in",
    responsiveBehavior: "collapsible sidebar · bento reflow · sticky floating CTA",
    floatingCta: true,
  }),
  arch({
    themeId: "editorial",
    templateIntelligenceId: "ti-red-premium",
    pageTopology: "fullscreen-editorial",
    sectionShellVariant: "magazine",
    description: "Hamburger nav · fullscreen editorial hero · magazine sections · large type",
    animationLanguage: "editorial scroll reveals · letter-spacing motion",
    responsiveBehavior: "off-canvas menu · magazine columns · oversized headlines",
    floatingCta: false,
  }),
  arch({
    themeId: "bold",
    templateIntelligenceId: "ti-saas-growth",
    pageTopology: "card-first-masonry",
    sectionShellVariant: "card-first",
    description: "Centered nav · product hero · masonry gallery · layered pricing · floating CTA",
    animationLanguage: "scale-in cards · conversion micro-motion",
    responsiveBehavior: "card-first homepage · masonry reflow · persistent demo CTA",
    floatingCta: true,
  }),
  ...INDUSTRY_THEME_ARCHITECTURES,
];

const BY_THEME_ID = new Map(
  THEME_PAGE_ARCHITECTURES.map((a) => [a.themeId, a]),
);
const BY_TI_ID = new Map(
  THEME_PAGE_ARCHITECTURES.map((a) => [a.templateIntelligenceId, a]),
);

export function getThemePageArchitecture(
  themeOrTiId: string,
): ThemePageArchitecture | undefined {
  return (
    BY_THEME_ID.get(themeOrTiId as WebsiteThemePresetId) ||
    BY_TI_ID.get(themeOrTiId)
  );
}

export function resolveThemePageArchitecture(
  themeOrTiId: string,
): ThemePageArchitecture | null {
  return getThemePageArchitecture(themeOrTiId) ?? null;
}
