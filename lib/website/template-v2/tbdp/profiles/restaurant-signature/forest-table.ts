import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/**
 * Forest Table — TBDP template identity binding for restaurant-signature.
 * Locked visual contract resolved through TBDP sector DNA (restaurant) +
 * hospitality experience profile. Values preserved for zero visual regression.
 */
export const FOREST_TABLE_V2_TOKENS: TemplateV2DesignTokens = {
  colors: {
    primary: "#1A3D32",
    secondary: "#264A3E",
    accent: "#B87333",
    background: "#0A1210",
    foreground: "#F4EDE4",
    muted: "rgba(244,237,228,0.62)",
    surface: "#193129",
    signal: "#B87333",
    grid: "rgba(184,115,51,0.08)",
    ink: "#0A1210",
    copper: "#c1844b",
    ember: "#975e2a",
    linen: "#f4ede5",
  },
  typography: {
    display: "Cormorant Garamond",
    body: "DM Sans",
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
    rtlTypography: {
      display: "Amiri",
      body: "Noto Sans Arabic",
    },
    ltrTypography: {
      display: "Cormorant Garamond",
      body: "DM Sans",
    },
  },
  spacing: {
    unit: "0.25rem",
    scale: ["0", "1", "2", "4", "6", "8", "12", "16", "20", "24", "32", "40", "48", "64", "80", "96"],
  },
  radius: {
    sm: "2px",
    md: "4px",
    lg: "8px",
  },
  shadows: {
    surface: "0 12px 40px rgba(0,0,0,0.28)",
    glow: "0 0 96px rgba(184,115,51,0.22)",
    card: "0 0 0 1px rgba(244,237,228,0.08), 0 16px 48px rgba(0,0,0,0.32)",
  },
  borders: {
    default: "rgba(244,237,228,0.12)",
    accent: "rgba(184,115,51,0.38)",
    subtle: "rgba(244,237,228,0.06)",
  },
};

/** Hospitality motion binding — maps TBDP sector motion profile to Forest Table entrances. */
export const FOREST_TABLE_MOTION: TemplateV2MotionConfig = {
  preset: "forest-table-reveal",
  reducedMotion: "fade",
  entrances: {
    hero: { type: "rs-reveal-hero", durationMs: 1100, staggerMs: 140 },
    section: { type: "rs-reveal-section", durationMs: 800, staggerMs: 100 },
    line: { type: "rs-draw-line", durationMs: 700, staggerMs: 0 },
  },
  microInteractions: {
    button: { hover: "copper-lift", active: "press" },
    image: { hover: "ken-burns-subtle" },
  },
  imports: [],
};

/** TBDP responsive rules binding — breakpoints from foundations grid, wide container for hospitality. */
export const FOREST_TABLE_RESPONSIVE_BASE: Pick<
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

/** Template-owned structure — regions and component layout contracts. */
export const FOREST_TABLE_RESPONSIVE_STRUCTURE: Pick<
  TemplateV2ResponsiveRules,
  "regions" | "components"
> = {
  regions: {
    header: { sticky: true, position: "top" },
    sidebar: { sticky: true, collapseBelow: "lg", collapseMode: "drawer" },
    main: { collapseBelow: "sm" },
  },
  components: {
    "restaurant-signature-hero": {
      layout: { lg: "cinematic-fullbleed", sm: "stacked-portrait" },
    },
    "restaurant-signature-gallery": {
      layout: { lg: "editorial-mosaic", sm: "scroll-snap-strip" },
    },
  },
};
