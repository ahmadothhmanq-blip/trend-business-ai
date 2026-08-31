import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/**
 * Nexus Command — TBDP template identity binding for saas-enterprise.
 * Indigo command-center aesthetic with Syne display + DM Sans body.
 */
export const NEXUS_COMMAND_V2_TOKENS: TemplateV2DesignTokens = {
  colors: {
    primary: "#4338CA",
    secondary: "#1E1B4B",
    accent: "#818CF8",
    background: "#F8F9FC",
    foreground: "#0F172A",
    muted: "rgba(15,23,42,0.56)",
    surface: "#FFFFFF",
    signal: "#818CF8",
    grid: "rgba(67,56,202,0.05)",
    ink: "#4338CA",
  },
  typography: {
    display: "Syne",
    body: "DM Sans",
    scale: {
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.625rem",
      display: "clamp(1.875rem, 3vw, 2.5rem)",
    },
  },
  languageProfile: {
    directionAdaptation: true,
    rtlTypography: {
      display: "Cairo",
      body: "IBM Plex Sans Arabic",
    },
    ltrTypography: {
      display: "Syne",
      body: "DM Sans",
    },
  },
  spacing: {
    unit: "0.25rem",
    scale: ["0", "1", "2", "3", "4", "6", "8", "12", "16", "20", "24", "32", "40", "48", "64"],
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "18px",
    xl: "28px",
  },
  shadows: {
    surface: "0 20px 60px rgba(67,56,202,0.07), 0 2px 8px rgba(67,56,202,0.03)",
    glow: "0 0 64px rgba(129,140,248,0.18)",
    card: "0 0 0 1px rgba(67,56,202,0.05), 0 8px 32px rgba(67,56,202,0.06)",
  },
  borders: {
    default: "rgba(67,56,202,0.09)",
    accent: "rgba(129,140,248,0.32)",
    subtle: "rgba(67,56,202,0.05)",
  },
};

export const NEXUS_COMMAND_MOTION: TemplateV2MotionConfig = {
  preset: "nexus-grid-reveal",
  reducedMotion: "fade",
  entrances: {
    hero: { type: "grid-stagger", durationMs: 720, staggerMs: 60 },
    section: { type: "slide-up", durationMs: 520, staggerMs: 40 },
    metric: { type: "count-up", durationMs: 900, staggerMs: 80 },
  },
  microInteractions: {
    button: { hover: "glow", active: "press" },
    card: { hover: "lift", focus: "ring" },
    marquee: { type: "scroll", speed: "slow" },
  },
  imports: [],
};

export const NEXUS_COMMAND_RESPONSIVE_BASE: Pick<
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
  containerMaxWidth: "82rem",
};

export const NEXUS_COMMAND_RESPONSIVE_STRUCTURE: Pick<
  TemplateV2ResponsiveRules,
  "regions" | "components"
> = {
  regions: {
    header: { sticky: true, position: "top" },
    utility: { collapseBelow: "md", collapseMode: "stack" },
    main: { collapseBelow: "sm" },
    overlay: { collapseBelow: "sm", collapseMode: "fixed-bottom" },
  },
  components: {
    "saas-enterprise-hero": {
      layout: { lg: "bento-command", sm: "stacked" },
    },
    "saas-enterprise-features": {
      layout: { lg: "bento-asymmetric", sm: "stacked" },
    },
  },
};
