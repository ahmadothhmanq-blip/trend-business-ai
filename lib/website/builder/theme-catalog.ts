/**
 * Website Themes — complete design systems (layout + UI), not color swaps.
 * Each theme maps to a distinct Template Intelligence DNA profile.
 */

import type { TemplateDesignPreset } from "@/lib/ai-core/templates/types";
import { getTemplateIntelligence } from "@/lib/ai-core/template-intelligence/catalog";
import { resolveTemplateDNA } from "@/lib/ai-core/template-intelligence/template-dna";
import { resolveVisualThemePresetForIndustry } from "@/lib/website/builder/industry-layout-policy";
import {
  getThemePageArchitecture,
  type ThemePageTopology,
} from "@/lib/website/builder/theme-architecture";

import type { WebsiteThemePresetId } from "@/lib/website/contracts/theme";
export type { WebsiteThemePresetId } from "@/lib/website/contracts/theme";

export type WebsiteThemeCatalogEntry = {
  id: WebsiteThemePresetId;
  label: string;
  description: string;
  designPreset: TemplateDesignPreset;
  /** Drives full design rebuild via Template Intelligence + DNA. */
  templateIntelligenceId: string;
  layoutType: string;
  heroType: string;
  navigationType: string;
  footerType: string;
  animationProfile: string;
  cardStyle: string;
  sectionPreview: string[];
  pageTopology: ThemePageTopology;
};

function dnaPreview(tiId: string, themeId?: WebsiteThemePresetId): Pick<
  WebsiteThemeCatalogEntry,
  | "layoutType"
  | "heroType"
  | "navigationType"
  | "footerType"
  | "animationProfile"
  | "cardStyle"
  | "sectionPreview"
  | "pageTopology"
> {
  const arch = themeId ? getThemePageArchitecture(themeId) : getThemePageArchitecture(tiId);
  if (arch) {
    const template = getTemplateIntelligence(tiId);
    const dna = template ? resolveTemplateDNA(template) : null;
    return {
      layoutType: arch.pageTopology,
      heroType: dna?.heroProfile || "hero",
      navigationType: arch.components.find((c) => /Nav|Header/i.test(c)) || "nav",
      footerType: arch.components.find((c) => /Footer/i.test(c)) || "footer",
      animationProfile: arch.animationLanguage,
      cardStyle: dna?.cardProfile || "cards",
      sectionPreview: arch.components.filter((c) => !/Nav|Header|Footer|Floating/i.test(c)).slice(0, 6),
      pageTopology: arch.pageTopology,
    };
  }
  const template = getTemplateIntelligence(tiId);
  if (!template) {
    return {
      layoutType: "standard",
      heroType: "hero",
      navigationType: "nav",
      footerType: "footer",
      animationProfile: "fade",
      cardStyle: "cards",
      sectionPreview: [],
      pageTopology: "classic-stack",
    };
  }
  const dna = resolveTemplateDNA(template);
  return {
    layoutType: String(dna.layoutProfile),
    heroType: dna.heroProfile,
    navigationType: dna.navigationProfile,
    footerType: dna.footerProfile,
    animationProfile: dna.animationProfile,
    cardStyle: dna.cardProfile,
    sectionPreview: dna.sectionOrder.slice(0, 6),
    pageTopology: "classic-stack",
  };
}

/** Curated themes — each is a complete website design language. */
export const WEBSITE_THEME_CATALOG: WebsiteThemeCatalogEntry[] = [
  {
    id: "luxury",
    label: "Luxury Noir",
    description: "Cinematic editorial hero, transparent nav, mosaic gallery, ghost CTAs",
    designPreset: "luxury",
    templateIntelligenceId: "ti-luxury-noir",
    ...dnaPreview("ti-luxury-noir", "luxury"),
  },
  {
    id: "modern",
    label: "Modern Product",
    description: "Pill navigation, split product hero, bento features, pricing band",
    designPreset: "modern",
    templateIntelligenceId: "ti-modern-clean",
    ...dnaPreview("ti-modern-clean", "modern"),
  },
  {
    id: "minimal",
    label: "Minimal White",
    description: "Logo-led nav, full-bleed minimal hero, borderless cards, quiet spacing",
    designPreset: "minimal",
    templateIntelligenceId: "ti-minimal-white",
    ...dnaPreview("ti-minimal-white", "minimal"),
  },
  {
    id: "corporate",
    label: "Corporate Trust",
    description: "Topbar nav, split trust hero, process steps, multi-column footer",
    designPreset: "corporate",
    templateIntelligenceId: "ti-corporate-trust",
    ...dnaPreview("ti-corporate-trust", "corporate"),
  },
  {
    id: "creative",
    label: "Creative Studio",
    description: "Cinematic hero, asymmetric portfolio mosaic, bold creative CTAs",
    designPreset: "creative",
    templateIntelligenceId: "ti-creative-studio",
    ...dnaPreview("ti-creative-studio", "creative"),
  },
  {
    id: "technology",
    label: "Technology Dark",
    description: "Sticky product nav, interactive hero, glass bento grid, glow CTAs",
    designPreset: "tech",
    templateIntelligenceId: "ti-technology-dark",
    ...dnaPreview("ti-technology-dark", "technology"),
  },
  {
    id: "editorial",
    label: "Red Premium",
    description: "Editorial flagship hero, premium red accents, storytelling sections",
    designPreset: "premium-brand",
    templateIntelligenceId: "ti-red-premium",
    ...dnaPreview("ti-red-premium", "editorial"),
  },
  {
    id: "bold",
    label: "SaaS Growth",
    description: "Conversion-focused hero, logo cloud, pricing table, demo CTA band",
    designPreset: "premium-brand",
    templateIntelligenceId: "ti-saas-growth",
    ...dnaPreview("ti-saas-growth", "bold"),
  },
];

export function getWebsiteThemeEntry(
  id: string,
): WebsiteThemeCatalogEntry | undefined {
  return WEBSITE_THEME_CATALOG.find(
    (t) => t.id === id || t.templateIntelligenceId === id,
  );
}

export function resolveThemeForStyle(
  style: string,
  industryId?: string | null,
): WebsiteThemeCatalogEntry {
  if (industryId) {
    const preset = resolveVisualThemePresetForIndustry(industryId, style);
    return getWebsiteThemeEntry(preset)!;
  }
  const s = style.toLowerCase();
  if (/luxury|premium|exclusive|gold|boutique/.test(s)) {
    return getWebsiteThemeEntry("luxury")!;
  }
  if (/minimal|clean|quiet|simple/.test(s)) {
    return getWebsiteThemeEntry("minimal")!;
  }
  if (/corporate|enterprise|trust|professional/.test(s)) {
    return getWebsiteThemeEntry("corporate")!;
  }
  if (/creative|studio|bold|playful|portfolio/.test(s)) {
    return getWebsiteThemeEntry("creative")!;
  }
  if (/tech|saas|software|ai|digital|b2b/.test(s)) {
    return getWebsiteThemeEntry("technology")!;
  }
  if (/editorial|magazine|red|fashion/.test(s)) {
    return getWebsiteThemeEntry("editorial")!;
  }
  return getWebsiteThemeEntry("modern")!;
}

export { resolveVisualThemePresetForIndustry } from "@/lib/website/builder/industry-layout-policy";

export function resolveThemeTemplateIntelligenceId(
  style: string,
  explicitThemeId?: string | null,
  industryId?: string | null,
): string {
  if (explicitThemeId) {
    const entry = getWebsiteThemeEntry(explicitThemeId);
    if (entry) return entry.templateIntelligenceId;
  }
  return resolveThemeForStyle(style, industryId).templateIntelligenceId;
}
