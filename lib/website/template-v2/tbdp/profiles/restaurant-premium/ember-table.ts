import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/** Ember Table — TBDP identity for restaurant-premium. */
export const EMBER_TABLE_V2_TOKENS: TemplateV2DesignTokens = {
  colors: {
    primary: "#1B3D2F",
    secondary: "#2D5A45",
    accent: "#B87333",
    background: "#0A1210",
    foreground: "#F4EDE4",
    muted: "rgba(244,237,228,0.58)",
    surface: "#121F1A",
    copper: "#D4A574",
    ember: "#8B5A2B",
    linen: "#FFFCF7",
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
    surface: "0 32px 80px rgba(0,0,0,0.55)",
    glow: "0 0 100px rgba(212,165,116,0.14)",
    inset: "inset 0 1px 0 rgba(244,237,228,0.06)",
  },
  borders: {
    default: "rgba(244,237,228,0.1)",
    copper: "rgba(212,165,116,0.32)",
    subtle: "rgba(244,237,228,0.06)",
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
