import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/**
 * Nexus Command — TBDP template identity binding for saas-enterprise.
 * Indigo command-center aesthetic with Syne display + DM Sans body.
 */
export const NEXUS_COMMAND_V2_TOKENS: TemplateV2DesignTokens = {
  colors: {
    primary: "#4F46E5",
    secondary: "#0F172A",
    accent: "#818CF8",
    background: "#F9FAFB",
    foreground: "#0B1120",
    muted: "rgba(11,17,32,0.55)",
    surface: "#FFFFFF",
    signal: "#10B981",
    grid: "rgba(79,70,229,0.06)",
    ink: "#030712",
  },
  typography: {
    display: "Syne",
    body: "DM Sans",
    scale: {
      sm: "0.8125rem",
      base: "1rem",
      lg: "1.3125rem",
      xl: "3.125rem",
      display: "clamp(2.625rem, 5.2vw, 4rem)",
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
    surface: "0 2px 8px rgba(11,17,32,0.04), 0 20px 48px rgba(79,70,229,0.08)",
    glow: "0 0 96px rgba(79,70,229,0.2)",
    card: "0 0 0 1px rgba(11,17,32,0.04), 0 6px 28px rgba(11,17,32,0.05)",
  },
  borders: {
    default: "rgba(11,17,32,0.08)",
    accent: "rgba(79,70,229,0.28)",
    subtle: "rgba(11,17,32,0.04)",
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
