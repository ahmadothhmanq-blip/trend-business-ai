import type { WebsiteThemePresetId } from "@/lib/website/builder/theme-catalog";
import type { ThemePageTopology } from "@/lib/website/contracts/theme-architecture";
import type { VisualSkinId } from "@/lib/website/visual-skin/types";

export type VisualSkinThemeBridge = {
  templateV2PackageId: string;
  tbdpTemplateIdentity?: string;
  websiteThemeId?: WebsiteThemePresetId;
  templateIntelligenceId: string;
  defaultLayoutId: string;
  navigationVariant?: string;
  pageTopology?: ThemePageTopology;
  heroLayoutMode?: string;
};

export const VISUAL_SKIN_THEME_BRIDGE: Record<VisualSkinId, VisualSkinThemeBridge> = {
  signal: {
    templateV2PackageId: "ai-startup-signal",
    tbdpTemplateIdentity: "aura-signal",
    websiteThemeId: "technology",
    templateIntelligenceId: "ti-ai-company-signal",
    defaultLayoutId: "default",
    navigationVariant: "product",
    pageTopology: "sidebar-rail",
    heroLayoutMode: "dashboard-command",
  },
  volt: {
    templateV2PackageId: "creative-agency-premium",
    tbdpTemplateIdentity: "studio-volt",
    websiteThemeId: "creative",
    templateIntelligenceId: "ti-creative-studio",
    defaultLayoutId: "default",
    navigationVariant: "creative",
    pageTopology: "fullscreen-editorial",
    heroLayoutMode: "kinetic-type",
  },
  ledger: {
    templateV2PackageId: "finance-premium",
    tbdpTemplateIdentity: "apex-ledger",
    websiteThemeId: "luxury",
    templateIntelligenceId: "ti-finance-ledger",
    defaultLayoutId: "default",
    navigationVariant: "corporate",
    pageTopology: "classic-stack",
    heroLayoutMode: "split-trust",
  },
  atlas: {
    templateV2PackageId: "corporate-business",
    tbdpTemplateIdentity: "executive-atlas",
    websiteThemeId: "corporate",
    templateIntelligenceId: "ti-corporate-trust",
    defaultLayoutId: "default",
    navigationVariant: "corporate",
    pageTopology: "classic-stack",
    heroLayoutMode: "editorial-split",
  },
  monolith: {
    templateV2PackageId: "real-estate-prestige",
    tbdpTemplateIdentity: "monolith-estate",
    websiteThemeId: "luxury",
    templateIntelligenceId: "ti-real-estate-listings",
    defaultLayoutId: "default",
    navigationVariant: "luxury",
    pageTopology: "fullscreen-editorial",
    heroLayoutMode: "parallax-estate",
  },
  serenity: {
    templateV2PackageId: "medical-premium",
    tbdpTemplateIdentity: "serenity-clinical",
    websiteThemeId: "modern",
    templateIntelligenceId: "ti-medical-care",
    defaultLayoutId: "default",
    navigationVariant: "healthcare",
    pageTopology: "classic-stack",
    heroLayoutMode: "clinical-calm",
  },
  haven: {
    templateV2PackageId: "hotel-resort-premium",
    tbdpTemplateIdentity: "azure-haven",
    websiteThemeId: "luxury",
    templateIntelligenceId: "ti-hotel-sanctuary",
    defaultLayoutId: "default",
    navigationVariant: "luxury",
    pageTopology: "fullscreen-editorial",
    heroLayoutMode: "ocean-hero",
  },
  ember: {
    templateV2PackageId: "restaurant-premium",
    tbdpTemplateIdentity: "ember-table",
    websiteThemeId: "editorial",
    templateIntelligenceId: "ti-restaurant-dining",
    defaultLayoutId: "default",
    navigationVariant: "hospitality",
    pageTopology: "fullscreen-editorial",
    heroLayoutMode: "culinary-stage",
  },
  heritage: {
    templateV2PackageId: "education-premium",
    tbdpTemplateIdentity: "heritage-academy",
    websiteThemeId: "corporate",
    templateIntelligenceId: "ti-education-campus",
    defaultLayoutId: "default",
    navigationVariant: "corporate",
    pageTopology: "classic-stack",
    heroLayoutMode: "academic-crest",
  },
  atelier: {
    templateV2PackageId: "ecommerce-premium",
    tbdpTemplateIdentity: "atelier-commerce",
    websiteThemeId: "luxury",
    templateIntelligenceId: "ti-ecommerce-atelier",
    defaultLayoutId: "default",
    navigationVariant: "luxury",
    pageTopology: "fullscreen-editorial",
    heroLayoutMode: "editorial-commerce",
  },
  nexus: {
    templateV2PackageId: "saas-enterprise",
    tbdpTemplateIdentity: "nexus-command",
    websiteThemeId: "technology",
    templateIntelligenceId: "ti-saas-growth",
    defaultLayoutId: "default",
    navigationVariant: "product",
    pageTopology: "sidebar-rail",
    heroLayoutMode: "dashboard-bento",
  },
  kinetic: {
    templateV2PackageId: "creative-portfolio",
    tbdpTemplateIdentity: "kinetic-atelier",
    websiteThemeId: "creative",
    templateIntelligenceId: "ti-agency-portfolio",
    defaultLayoutId: "default",
    navigationVariant: "creative",
    pageTopology: "fullscreen-editorial",
    heroLayoutMode: "kinetic-type",
  },
  estates: {
    templateV2PackageId: "real-estate-premium",
    tbdpTemplateIdentity: "prestige-estates",
    websiteThemeId: "luxury",
    templateIntelligenceId: "ti-real-estate-listings",
    defaultLayoutId: "default",
    navigationVariant: "luxury",
    pageTopology: "fullscreen-editorial",
    heroLayoutMode: "gallery-estate",
  },
  forest: {
    templateV2PackageId: "restaurant-signature",
    tbdpTemplateIdentity: "forest-table",
    websiteThemeId: "editorial",
    templateIntelligenceId: "ti-restaurant-dining",
    defaultLayoutId: "default",
    navigationVariant: "hospitality",
    pageTopology: "fullscreen-editorial",
    heroLayoutMode: "culinary-stage",
  },
  prism: {
    templateV2PackageId: "prism-aurora",
    tbdpTemplateIdentity: "aurora-prism",
    websiteThemeId: "technology",
    templateIntelligenceId: "ti-software-studio",
    defaultLayoutId: "default",
    navigationVariant: "product",
    pageTopology: "sidebar-rail",
    heroLayoutMode: "aurora-gradient",
  },
  obsidian: {
    templateV2PackageId: "obsidian-noir",
    tbdpTemplateIdentity: "noir-obsidian",
    websiteThemeId: "luxury",
    templateIntelligenceId: "ti-luxury-noir",
    defaultLayoutId: "default",
    navigationVariant: "luxury",
    pageTopology: "fullscreen-editorial",
    heroLayoutMode: "noir-editorial",
  },
  pulse: {
    templateV2PackageId: "pulse-fintech",
    tbdpTemplateIdentity: "neon-pulse",
    websiteThemeId: "bold",
    templateIntelligenceId: "ti-technology-dark",
    defaultLayoutId: "default",
    navigationVariant: "product",
    pageTopology: "sidebar-rail",
    heroLayoutMode: "fintech-terminal",
  },
  forge: {
    templateV2PackageId: "forge-industrial",
    tbdpTemplateIdentity: "industrial-forge",
    websiteThemeId: "corporate",
    templateIntelligenceId: "ti-consulting-clarity",
    defaultLayoutId: "default",
    navigationVariant: "corporate",
    pageTopology: "classic-stack",
    heroLayoutMode: "industrial-grid",
  },
  citadel: {
    templateV2PackageId: "citadel-trust",
    tbdpTemplateIdentity: "trust-citadel",
    websiteThemeId: "corporate",
    templateIntelligenceId: "ti-law-firm",
    defaultLayoutId: "default",
    navigationVariant: "corporate",
    pageTopology: "classic-stack",
    heroLayoutMode: "authority-split",
  },
  lumina: {
    templateV2PackageId: "lumina-wellness",
    tbdpTemplateIdentity: "glow-lumina",
    websiteThemeId: "minimal",
    templateIntelligenceId: "ti-modern-clean",
    defaultLayoutId: "default",
    navigationVariant: "healthcare",
    pageTopology: "classic-stack",
    heroLayoutMode: "wellness-soft",
  },
  /** @deprecated Use `signal` */
  sovereign: {
    templateV2PackageId: "ai-startup-signal",
    tbdpTemplateIdentity: "aura-signal",
    websiteThemeId: "technology",
    templateIntelligenceId: "ti-ai-company-signal",
    defaultLayoutId: "default",
    navigationVariant: "product",
    pageTopology: "sidebar-rail",
    heroLayoutMode: "dashboard-command",
  },
  /** @deprecated Use `volt` */
  prestige: {
    templateV2PackageId: "creative-agency-premium",
    tbdpTemplateIdentity: "studio-volt",
    websiteThemeId: "creative",
    templateIntelligenceId: "ti-creative-studio",
    defaultLayoutId: "default",
    navigationVariant: "creative",
    pageTopology: "fullscreen-editorial",
    heroLayoutMode: "kinetic-type",
  },
};

export function resolveVisualSkinThemeBridge(skinId: string): VisualSkinThemeBridge | null {
  return VISUAL_SKIN_THEME_BRIDGE[skinId] ?? null;
}

export function resolveVisualSkinV2PackageId(skinId: string): string | null {
  return resolveVisualSkinThemeBridge(skinId)?.templateV2PackageId ?? null;
}

export function isVisualSkinV2PackageId(packageId: string): boolean {
  const id = packageId.trim();
  return Object.values(VISUAL_SKIN_THEME_BRIDGE).some(
    (bridge) => bridge.templateV2PackageId === id,
  );
}
