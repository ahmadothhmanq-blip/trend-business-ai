import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/**
 * Serenity Clinical — TBDP template identity binding for medical-premium.
 * Premium private-clinic aesthetic: soft sage, deep teal, warm white.
 * Display: Libre Baskerville · Body: Source Sans 3
 */
export const SERENITY_CLINICAL_V2_TOKENS: TemplateV2DesignTokens = {
  colors: {
    primary: "#1A4D4A",
    secondary: "#2A6560",
    accent: "#C4A882",
    background: "#FAFCFA",
    foreground: "#162826",
    muted: "rgba(22,40,38,0.58)",
    surface: "#E8EDE6",
    healing: "#6B9B8A",
    pearl: "#FAFCFA",
    sage: "#D8E2D4",
  },
  typography: {
    display: "Libre Baskerville",
    body: "Source Sans 3",
    scale: {
      sm: "0.875rem",
      base: "1.0625rem",
      lg: "1.25rem",
      xl: "2.75rem",
      display: "clamp(2.75rem, 5.2vw, 4rem)",
    },
  },
  languageProfile: {
    directionAdaptation: true,
    rtlTypography: {
      display: "El Messiri",
      body: "Noto Sans Arabic",
    },
    ltrTypography: {
      display: "Libre Baskerville",
      body: "Source Sans 3",
    },
  },
  spacing: {
    unit: "0.25rem",
    scale: ["0", "1", "2", "4", "6", "8", "12", "16", "20", "24", "32", "40", "48"],
  },
  radius: {
    sm: "4px",
    md: "10px",
    lg: "18px",
  },
  shadows: {
    surface: "0 8px 32px rgba(26,77,74,0.09)",
    glow: "0 0 48px rgba(107,155,138,0.14)",
    card: "0 1px 2px rgba(22,40,38,0.04), 0 12px 32px rgba(26,77,74,0.07)",
  },
  borders: {
    default: "rgba(22,40,38,0.09)",
    healing: "rgba(107,155,138,0.28)",
    subtle: "rgba(22,40,38,0.05)",
  },
};

/** Healthcare motion binding — maps TBDP sector motion profile to Serenity Clinical entrances. */
export const SERENITY_CLINICAL_MOTION: TemplateV2MotionConfig = {
  preset: "serenity-fade",
  reducedMotion: "fade",
  entrances: {
    hero: { type: "clinical-soft-fade", durationMs: 800, staggerMs: 70 },
    section: { type: "gentle-rise", durationMs: 560, staggerMs: 45 },
    card: { type: "scale-in", durationMs: 480, staggerMs: 50 },
  },
  microInteractions: {
    button: { hover: "soft-lift", active: "press", focus: "healing-ring" },
    card: { hover: "shadow-lift", focus: "visible-ring" },
  },
  imports: [],
};

/** TBDP responsive rules binding — breakpoints from foundations grid, Serenity container. */
export const SERENITY_CLINICAL_RESPONSIVE_BASE: Pick<
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
  containerMaxWidth: "76rem",
};

/** Template-owned structure — regions and component layout contracts. */
export const SERENITY_CLINICAL_RESPONSIVE_STRUCTURE: Pick<
  TemplateV2ResponsiveRules,
  "regions" | "components"
> = {
  regions: {
    header: { sticky: true, position: "top" },
    utility: { collapseBelow: "md", collapseMode: "stack" },
    overlay: { collapseBelow: "sm" },
    main: { collapseBelow: "sm" },
  },
  components: {
    "medical-premium-trust-hero": {
      layout: { lg: "editorial-split", sm: "stacked" },
    },
    "medical-premium-specialties": {
      layout: { lg: "bento-grid", sm: "stacked" },
    },
  },
};
