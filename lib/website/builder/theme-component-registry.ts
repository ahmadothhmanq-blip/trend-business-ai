/**
 * Independent theme component libraries — each curated theme owns exclusive component IDs.
 * No theme may reference another theme's components. Legacy shared IDs remain for industry flows.
 */

import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";
import type { WebsiteThemePresetId } from "@/lib/website/builder/theme-catalog";

export type ThemeComponentRole =
  | "nav"
  | "hero"
  | "features"
  | "services"
  | "gallery"
  | "story"
  | "testimonials"
  | "pricing"
  | "faq"
  | "cta"
  | "contact"
  | "process"
  | "trust"
  | "cases"
  | "integrations"
  | "blog"
  | "timeline"
  | "portfolio"
  | "footer"
  | "floating-cta";

export type ThemeComponentSpec = {
  id: DesignRendererComponentId;
  role: ThemeComponentRole;
  path: string;
  exportName: string;
  themeId: WebsiteThemePresetId;
};

function spec(
  themeId: WebsiteThemePresetId,
  id: DesignRendererComponentId,
  role: ThemeComponentRole,
  file: string,
): ThemeComponentSpec {
  const exportName = id;
  return {
    id,
    role,
    themeId,
    exportName,
    path: `components/themes/${themeId}/${file}.tsx`,
  };
}

/** Exclusive component library per curated theme. */
export const THEME_COMPONENT_LIBRARIES: Record<
  WebsiteThemePresetId,
  ThemeComponentSpec[]
> = {
  luxury: [
    spec("luxury", "ThemeLuxuryNav", "nav", "nav"),
    spec("luxury", "ThemeLuxuryHero", "hero", "hero"),
    spec("luxury", "ThemeLuxuryStory", "story", "story"),
    spec("luxury", "ThemeLuxuryGallery", "gallery", "gallery"),
    spec("luxury", "ThemeLuxuryTestimonials", "testimonials", "testimonials"),
    spec("luxury", "ThemeLuxuryCta", "cta", "cta"),
    spec("luxury", "ThemeLuxuryFooter", "footer", "footer"),
  ],
  modern: [
    spec("modern", "ThemeModernNav", "nav", "nav"),
    spec("modern", "ThemeModernHero", "hero", "hero"),
    spec("modern", "ThemeModernFeatures", "features", "features"),
    spec("modern", "ThemeModernServices", "services", "services"),
    spec("modern", "ThemeModernPricing", "pricing", "pricing"),
    spec("modern", "ThemeModernFaq", "faq", "faq"),
    spec("modern", "ThemeModernFooter", "footer", "footer"),
  ],
  minimal: [
    spec("minimal", "ThemeMinimalNav", "nav", "nav"),
    spec("minimal", "ThemeMinimalHero", "hero", "hero"),
    spec("minimal", "ThemeMinimalHighlights", "features", "highlights"),
    spec("minimal", "ThemeMinimalServices", "services", "services"),
    spec("minimal", "ThemeMinimalTestimonials", "testimonials", "testimonials"),
    spec("minimal", "ThemeMinimalContact", "contact", "contact"),
    spec("minimal", "ThemeMinimalFooter", "footer", "footer"),
  ],
  corporate: [
    spec("corporate", "ThemeCorporateNav", "nav", "nav"),
    spec("corporate", "ThemeCorporateHero", "hero", "hero"),
    spec("corporate", "ThemeCorporateProcess", "process", "process"),
    spec("corporate", "ThemeCorporateServices", "services", "services"),
    spec("corporate", "ThemeCorporateTrust", "trust", "trust"),
    spec("corporate", "ThemeCorporateTestimonials", "testimonials", "testimonials"),
    spec("corporate", "ThemeCorporateContact", "contact", "contact"),
    spec("corporate", "ThemeCorporateFooter", "footer", "footer"),
  ],
  creative: [
    spec("creative", "ThemeCreativeNav", "nav", "nav"),
    spec("creative", "ThemeCreativeHero", "hero", "hero"),
    spec("creative", "ThemeCreativeGallery", "gallery", "gallery"),
    spec("creative", "ThemeCreativeCases", "cases", "cases"),
    spec("creative", "ThemeCreativeStory", "story", "story"),
    spec("creative", "ThemeCreativeCta", "cta", "cta"),
    spec("creative", "ThemeCreativeFooter", "footer", "footer"),
  ],
  technology: [
    spec("technology", "ThemeTechNav", "nav", "nav"),
    spec("technology", "ThemeTechHero", "hero", "hero"),
    spec("technology", "ThemeTechBento", "features", "bento"),
    spec("technology", "ThemeTechCases", "cases", "cases"),
    spec("technology", "ThemeTechIntegrations", "integrations", "integrations"),
    spec("technology", "ThemeTechTrust", "trust", "trust"),
    spec("technology", "ThemeTechCta", "cta", "cta"),
    spec("technology", "ThemeTechFooter", "footer", "footer"),
    spec("technology", "ThemeTechFloatingCta", "floating-cta", "floating-cta"),
  ],
  editorial: [
    spec("editorial", "ThemeEditorialNav", "nav", "nav"),
    spec("editorial", "ThemeEditorialHero", "hero", "hero"),
    spec("editorial", "ThemeEditorialMagazine", "blog", "magazine"),
    spec("editorial", "ThemeEditorialStory", "story", "story"),
    spec("editorial", "ThemeEditorialTimeline", "timeline", "timeline"),
    spec("editorial", "ThemeEditorialGallery", "gallery", "gallery"),
    spec("editorial", "ThemeEditorialFooter", "footer", "footer"),
  ],
  bold: [
    spec("bold", "ThemeBoldNav", "nav", "nav"),
    spec("bold", "ThemeBoldHero", "hero", "hero"),
    spec("bold", "ThemeBoldPortfolio", "portfolio", "portfolio"),
    spec("bold", "ThemeBoldFeatures", "features", "features"),
    spec("bold", "ThemeBoldPricing", "pricing", "pricing"),
    spec("bold", "ThemeBoldIntegrations", "integrations", "integrations"),
    spec("bold", "ThemeBoldFaq", "faq", "faq"),
    spec("bold", "ThemeBoldFooter", "footer", "footer"),
    spec("bold", "ThemeBoldFloatingCta", "floating-cta", "floating-cta"),
  ],
};

const BY_ID = new Map<string, ThemeComponentSpec>();
const BY_THEME = new Map<WebsiteThemePresetId, ThemeComponentSpec[]>();

for (const [themeId, components] of Object.entries(THEME_COMPONENT_LIBRARIES)) {
  BY_THEME.set(themeId as WebsiteThemePresetId, components);
  for (const c of components) {
    BY_ID.set(c.id, c);
  }
}

export function isThemeScopedComponent(id: string): boolean {
  return BY_ID.has(id);
}

export function getThemeComponentSpec(
  id: string,
): ThemeComponentSpec | undefined {
  return BY_ID.get(id);
}

export function getThemeComponentRole(id: string): ThemeComponentRole | null {
  return BY_ID.get(id)?.role ?? null;
}

export function getThemeLibrary(
  themeId: WebsiteThemePresetId,
): ThemeComponentSpec[] {
  return THEME_COMPONENT_LIBRARIES[themeId] ?? [];
}

export function getThemeComponentIds(
  themeId: WebsiteThemePresetId,
): DesignRendererComponentId[] {
  return getThemeLibrary(themeId).map((c) => c.id);
}

export function resolveThemeIdFromComponent(id: string): WebsiteThemePresetId | null {
  return BY_ID.get(id)?.themeId ?? null;
}

/** Nav / footer / floating chrome role checks for compose. */
export function isThemeNavComponent(id: string): boolean {
  return getThemeComponentRole(id) === "nav";
}

export function isThemeFooterComponent(id: string): boolean {
  return getThemeComponentRole(id) === "footer";
}

export function isThemeHeroComponent(id: string): boolean {
  return getThemeComponentRole(id) === "hero";
}

export function isThemeFloatingCtaComponent(id: string): boolean {
  return getThemeComponentRole(id) === "floating-cta";
}

/** Nav, footer, or floating CTA — layout chrome excluded from body section slots. */
export function isThemeChromeComponent(id: string): boolean {
  return (
    isThemeNavComponent(id) ||
    isThemeFooterComponent(id) ||
    isThemeFloatingCtaComponent(id)
  );
}

/** Ensure no component ID is shared across themes. */
export function assertThemeLibrariesAreDisjoint(): void {
  const seen = new Map<string, WebsiteThemePresetId>();
  for (const [themeId, lib] of Object.entries(THEME_COMPONENT_LIBRARIES)) {
    for (const c of lib) {
      const prev = seen.get(c.id);
      if (prev && prev !== themeId) {
        throw new Error(`Theme component ${c.id} shared by ${prev} and ${themeId}`);
      }
      seen.set(c.id, themeId as WebsiteThemePresetId);
    }
  }
}

assertThemeLibrariesAreDisjoint();
