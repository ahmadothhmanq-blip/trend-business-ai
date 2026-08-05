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
    primary: "#1C1C1E",
    secondary: "#3A3A3C",
    accent: "#A67C52",
    background: "#F5F0EB",
    foreground: "#1C1C1E",
    muted: "rgba(28,28,30,0.58)",
    surface: "#FDFBF8",
    stone: "#E5DFD8",
    brass: "#A67C52",
    linen: "#FAF7F3",
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
    surface: "0 28px 72px rgba(28,28,30,0.14)",
    glow: "0 0 96px rgba(166,124,82,0.16)",
    inset: "inset 0 1px 0 rgba(253,251,248,0.85)",
  },
  borders: {
    default: "rgba(28,28,30,0.1)",
    brass: "rgba(166,124,82,0.35)",
    subtle: "rgba(28,28,30,0.05)",
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
