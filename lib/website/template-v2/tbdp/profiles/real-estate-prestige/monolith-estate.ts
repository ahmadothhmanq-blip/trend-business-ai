import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/**
 * Monolith Estate — TBDP template identity binding for real-estate-prestige.
 * Locked visual contract resolved through TBDP sector DNA (real-estate) +
 * luxury/executive/corporate experience profiles.
 * Values preserved for zero visual regression.
 */
export const MONOLITH_ESTATE_V2_TOKENS: TemplateV2DesignTokens = {
  colors: {
    primary: "#1C1917",
    secondary: "#3D3A36",
    accent: "#B8956B",
    background: "#F5F0EB",
    foreground: "#1C1917",
    muted: "rgba(28,25,23,0.58)",
    surface: "#FDFCFA",
    stone: "#E8E2DA",
    brass: "#B8956B",
    linen: "#FAF8F5",
  },
  typography: {
    display: "Fraunces",
    body: "Outfit",
    scale: {
      sm: "0.8125rem",
      base: "1.0625rem",
      lg: "1.375rem",
      xl: "3.25rem",
      display: "clamp(2.75rem, 6vw, 4.5rem)",
    },
  },
  languageProfile: {
    directionAdaptation: true,
    rtlTypography: {
      display: "Tajawal",
      body: "Noto Sans Arabic",
    },
    ltrTypography: {
      display: "Fraunces",
      body: "Outfit",
    },
  },
  spacing: {
    unit: "0.25rem",
    scale: ["0", "1", "2", "4", "6", "8", "12", "16", "20", "24", "32", "40", "48", "64", "80"],
  },
  radius: {
    sm: "2px",
    md: "4px",
    lg: "8px",
  },
  shadows: {
    surface: "0 24px 64px rgba(28,25,23,0.12)",
    glow: "0 0 80px rgba(184,149,107,0.14)",
    inset: "inset 0 1px 0 rgba(253,252,250,0.8)",
  },
  borders: {
    default: "rgba(28,25,23,0.1)",
    brass: "rgba(184,149,107,0.32)",
    subtle: "rgba(28,25,23,0.05)",
  },
};

/** Luxury/executive motion binding — maps TBDP sector motion profile to Monolith Estate entrances. */
export const MONOLITH_ESTATE_MOTION: TemplateV2MotionConfig = {
  preset: "monolith-reveal",
  reducedMotion: "fade",
  entrances: {
    hero: { type: "parallax-lift", durationMs: 900, staggerMs: 80 },
    section: { type: "stone-rise", durationMs: 680, staggerMs: 60 },
    dossier: { type: "snap-in", durationMs: 520, staggerMs: 40 },
  },
  microInteractions: {
    card: { hover: "lift-shadow", focus: "brass-ring" },
    image: { hover: "ken-burns-subtle" },
    button: { hover: "brass-glow", active: "press" },
  },
  imports: [],
};

/** TBDP responsive rules binding — breakpoints from foundations grid, Monolith wide container. */
export const MONOLITH_ESTATE_RESPONSIVE_BASE: Pick<
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
  containerMaxWidth: "88rem",
};

/** Template-owned structure — regions and component layout contracts. */
export const MONOLITH_ESTATE_RESPONSIVE_STRUCTURE: Pick<
  TemplateV2ResponsiveRules,
  "regions" | "components"
> = {
  regions: {
    header: { sticky: true, position: "top" },
    sidebar: { sticky: true, collapseBelow: "lg" },
    main: { collapseBelow: "sm" },
  },
  components: {
    "real-estate-prestige-hero": {
      layout: { lg: "full-bleed-estate", sm: "stacked" },
    },
    "real-estate-prestige-collection": {
      layout: { lg: "editorial-grid", sm: "stacked" },
    },
  },
};
