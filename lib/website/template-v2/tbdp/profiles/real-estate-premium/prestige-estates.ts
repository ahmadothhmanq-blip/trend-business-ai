import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/**
 * Prestige Estates — TBDP template identity binding for real-estate-premium.
 * Editorial luxury real estate: charcoal, warm stone, bronze accents.
 * Display: Cormorant · Body: Work Sans
 */
export const PRESTIGE_ESTATES_V2_TOKENS: TemplateV2DesignTokens = {
  colors: {
    primary: "#1C1917",
    secondary: "#3D3834",
    accent: "#B8956B",
    background: "#FAF7F2",
    foreground: "#1C1917",
    muted: "rgba(28,25,23,0.56)",
    surface: "#FFFFFF",
    signal: "#B8956B",
    grid: "rgba(28,25,23,0.05)",
    ink: "#1C1917",
    stone: "rgba(28,25,23,0.12)",
    brass: "#B8956B",
    linen: "#faf7f2",
  },
  typography: {
    display: "Cormorant",
    body: "Work Sans",
    scale: {
      sm: "0.8125rem",
      base: "1.0625rem",
      lg: "1.375rem",
      xl: "3.5rem",
      display: "clamp(3rem, 6.5vw, 5rem)",
    },
  },
  languageProfile: {
    directionAdaptation: true,
    rtlTypography: {
      display: "Tajawal",
      body: "Noto Sans Arabic",
    },
    ltrTypography: {
      display: "Cormorant",
      body: "Work Sans",
    },
  },
  spacing: {
    unit: "0.25rem",
    scale: ["0", "1", "2", "4", "6", "8", "12", "16", "20", "24", "32", "40", "48", "64", "80"],
  },
  radius: {
    sm: "0",
    md: "2px",
    lg: "4px",
  },
  shadows: {
    surface: "0 20px 60px rgba(28,25,23,0.07), 0 2px 8px rgba(28,25,23,0.03)",
    glow: "0 0 64px rgba(184,149,107,0.18)",
    card: "0 0 0 1px rgba(28,25,23,0.05), 0 8px 32px rgba(28,25,23,0.06)",
  },
  borders: {
    default: "rgba(28,25,23,0.09)",
    accent: "rgba(184,149,107,0.32)",
    subtle: "rgba(28,25,23,0.05)",
  },
};

/** Editorial luxury motion — prestige reveal entrances and micro-interactions. */
export const PRESTIGE_ESTATES_MOTION: TemplateV2MotionConfig = {
  preset: "prestige-reveal",
  reducedMotion: "fade",
  entrances: {
    hero: { type: "parallax-lift", durationMs: 950, staggerMs: 90 },
    section: { type: "stone-rise", durationMs: 720, staggerMs: 70 },
    dossier: { type: "snap-in", durationMs: 540, staggerMs: 45 },
  },
  microInteractions: {
    card: { hover: "lift-shadow", focus: "brass-ring" },
    image: { hover: "ken-burns-subtle" },
    button: { hover: "brass-glow", active: "press" },
  },
  imports: [],
};

export const PRESTIGE_ESTATES_RESPONSIVE_BASE: Pick<
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

export const PRESTIGE_ESTATES_RESPONSIVE_STRUCTURE: Pick<
  TemplateV2ResponsiveRules,
  "regions" | "components"
> = {
  regions: {
    header: { sticky: true, position: "top" },
    sidebar: { sticky: true, collapseBelow: "lg" },
    main: { collapseBelow: "sm" },
  },
  components: {
    "real-estate-premium-hero": {
      layout: { lg: "editorial-full-bleed", sm: "stacked" },
    },
    "real-estate-premium-collection": {
      layout: { lg: "editorial-asymmetric", sm: "stacked" },
    },
  },
};
