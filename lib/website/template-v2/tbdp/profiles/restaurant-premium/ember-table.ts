import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/** Ember Table — TBDP identity for restaurant-premium. */
export const EMBER_TABLE_V2_TOKENS: TemplateV2DesignTokens = {
  colors: {
    primary: "#1A1410",
    secondary: "#2A2118",
    accent: "#D4844A",
    background: "#0E0A08",
    foreground: "#F7F0E8",
    muted: "rgba(247,240,232,0.62)",
    surface: "#1C1510",
    signal: "#D4844A",
    grid: "rgba(212,132,74,0.1)",
    ink: "#0E0A08",
    copper: "#e09a62",
    ember: "#b56a38",
    linen: "#f7f0e8",
  },
  typography: {
    display: "Fraunces",
    body: "Literata",
    scale: {
      sm: "0.8125rem",
      base: "1.0625rem",
      lg: "1.375rem",
      xl: "3.5rem",
      display: "clamp(2.875rem, 6.5vw, 5rem)",
    },
  },
  languageProfile: {
    directionAdaptation: true,
    rtlTypography: { display: "Amiri", body: "Noto Sans Arabic" },
    ltrTypography: { display: "Fraunces", body: "Literata" },
  },
  spacing: {
    unit: "0.25rem",
    scale: ["0", "1", "2", "4", "6", "8", "12", "16", "20", "24", "32", "40", "48", "64", "80", "96"],
  },
  radius: { sm: "2px", md: "4px", lg: "8px" },
  shadows: {
    surface: "0 12px 40px rgba(0,0,0,0.28)",
    glow: "0 0 96px rgba(200,120,64,0.22)",
    card: "0 0 0 1px rgba(245,237,228,0.08), 0 16px 48px rgba(0,0,0,0.32)",
  },
  borders: {
    default: "rgba(245,237,228,0.12)",
    accent: "rgba(200,120,64,0.38)",
    subtle: "rgba(245,237,228,0.06)",
  },
};

export const EMBER_TABLE_MOTION: TemplateV2MotionConfig = {
  preset: "ember-table-reveal",
  reducedMotion: "fade",
  entrances: {
    hero: { type: "rp-reveal-hero", durationMs: 1100, staggerMs: 140 },
    section: { type: "rp-reveal-section", durationMs: 800, staggerMs: 100 },
    line: { type: "rp-draw-line", durationMs: 700, staggerMs: 0 },
  },
  microInteractions: {
    button: { hover: "copper-lift", active: "press" },
    image: { hover: "ken-burns-subtle" },
  },
  imports: [],
};

export const EMBER_TABLE_RESPONSIVE_BASE: Pick<
  TemplateV2ResponsiveRules,
  "breakpoints" | "containerMaxWidth"
> = {
  breakpoints: [
    { name: "sm", minWidth: 640 },
    { name: "md", minWidth: 768 },
    { name: "lg", minWidth: 1024 },
    { name: "xl", minWidth: 1280 },
    { name: "2xl", minWidth: 1536 },
  ],
  containerMaxWidth: "90rem",
};

export const EMBER_TABLE_RESPONSIVE_STRUCTURE: Pick<
  TemplateV2ResponsiveRules,
  "regions" | "components"
> = {
  regions: {
    header: { sticky: true, position: "top" },
    sidebar: { sticky: true, collapseBelow: "lg", collapseMode: "drawer" },
    main: { collapseBelow: "sm" },
  },
  components: {
    "restaurant-premium-hero": { layout: { lg: "cinematic-fullbleed", sm: "stacked-portrait" } },
    "restaurant-premium-gallery": { layout: { lg: "editorial-mosaic", sm: "scroll-snap-strip" } },
  },
};
