import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/**
 * Aura Signal — TBDP template identity binding for ai-startup-signal.
 * Dark signal canvas: cyan system chrome + refined crimson interactive accent.
 * Syne display + Outfit body.
 */
export const AURA_SIGNAL_V2_TOKENS: TemplateV2DesignTokens = {
  colors: {
    primary: "#020617",
    secondary: "#111827",
    /** CTA / selected / focus — premium crimson (not a background wash) */
    accent: "#E8364E",
    background: "#030712",
    foreground: "#F1F5F9",
    muted: "rgba(241,245,249,0.58)",
    surface: "#0B1220",
    /** Tech chrome — metrics, live status, ambient grid */
    signal: "#2EC8E0",
    grid: "rgba(46,200,224,0.075)",
    ink: "#030712",
  },
  typography: {
    display: "Syne",
    body: "Outfit",
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
      display: "Alexandria",
      body: "Noto Sans Arabic",
    },
    ltrTypography: {
      display: "Syne",
      body: "Outfit",
    },
  },
  spacing: {
    unit: "0.25rem",
    scale: ["0", "1", "2", "3", "4", "6", "8", "12", "16", "20", "24", "32", "40", "48", "64"],
  },
  radius: {
    sm: "10px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  shadows: {
    surface: "0 12px 40px rgba(0,0,0,0.28)",
    glow: "0 0 72px rgba(232,54,78,0.24)",
    card: "0 0 0 1px rgba(241,245,249,0.08), 0 16px 48px rgba(0,0,0,0.32)",
    signal: "0 0 96px rgba(46,200,224,0.18)",
  },
  borders: {
    default: "rgba(241,245,249,0.12)",
    accent: "rgba(232,54,78,0.42)",
    subtle: "rgba(241,245,249,0.06)",
    signal: "rgba(46,200,224,0.32)",
  },
};

export const AURA_SIGNAL_MOTION: TemplateV2MotionConfig = {
  preset: "signal-glow-reveal",
  reducedMotion: "fade",
  entrances: {
    hero: { type: "glow-stagger", durationMs: 780, staggerMs: 65 },
    section: { type: "slide-up", durationMs: 540, staggerMs: 45 },
    metric: { type: "count-up", durationMs: 920, staggerMs: 85 },
  },
  microInteractions: {
    button: { hover: "glow", active: "press" },
    card: { hover: "lift", focus: "ring" },
    marquee: { type: "scroll", speed: "slow" },
  },
  imports: [],
};

export const AURA_SIGNAL_RESPONSIVE_BASE: Pick<
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

export const AURA_SIGNAL_RESPONSIVE_STRUCTURE: Pick<
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
    "ai-startup-signal-hero": {
      layout: { lg: "dashboard-command", sm: "stacked" },
    },
    "ai-startup-signal-features": {
      layout: { lg: "bento-glass", sm: "stacked" },
    },
  },
};
