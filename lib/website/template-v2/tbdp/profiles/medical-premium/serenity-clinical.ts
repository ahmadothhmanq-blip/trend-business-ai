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
    primary: "#1B4D48",
    secondary: "#2A635D",
    accent: "#C4A882",
    background: "#F7FAF8",
    foreground: "#142E2B",
    muted: "rgba(20,46,43,0.56)",
    surface: "#FFFFFF",
    signal: "#C4A882",
    grid: "rgba(27,77,72,0.05)",
    ink: "#1B4D48",
    healing: "#9ca286",
    pearl: "#F7FAF8",
    sage: "#c4d4d1",
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
    surface: "0 20px 60px rgba(27,77,72,0.07), 0 2px 8px rgba(27,77,72,0.03)",
    glow: "0 0 64px rgba(196,168,130,0.18)",
    card: "0 0 0 1px rgba(27,77,72,0.05), 0 8px 32px rgba(27,77,72,0.06)",
  },
  borders: {
    default: "rgba(27,77,72,0.09)",
    accent: "rgba(196,168,130,0.32)",
    subtle: "rgba(27,77,72,0.05)",
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
