import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/**
 * Studio Volt — TBDP template identity binding for creative-agency-premium.
 * Near-black canvas, electric lime accents, Space Grotesk + Inter typography.
 */
export const STUDIO_VOLT_V2_TOKENS: TemplateV2DesignTokens = {
  colors: {
    primary: "#0A0A0B",
    secondary: "#121214",
    accent: "#D4FF00",
    background: "#0A0A0B",
    foreground: "#F4F4F0",
    muted: "rgba(244,244,240,0.62)",
    surface: "#0e0e10",
    signal: "#D4FF00",
    grid: "rgba(212,255,0,0.08)",
    ink: "#0A0A0B",
    volt: "#D4FF00",
    ghost: "#F4F4F0",
    zinc: "rgba(244,244,240,0.62)",
  },
  typography: {
    display: "Space Grotesk",
    body: "Inter",
    scale: {
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.75rem",
      display: "clamp(2rem, 4vw, 3rem)",
    },
  },
  languageProfile: {
    directionAdaptation: true,
    rtlTypography: {
      display: "Alexandria",
      body: "Noto Sans Arabic",
    },
    ltrTypography: {
      display: "Space Grotesk",
      body: "Inter",
    },
  },
  spacing: {
    unit: "0.25rem",
    scale: ["0", "1", "2", "4", "6", "8", "12", "16", "20", "24", "32", "40", "48", "64", "96"],
  },
  radius: {
    sm: "0",
    md: "0",
    lg: "0",
  },
  shadows: {
    surface: "0 12px 40px rgba(0,0,0,0.28)",
    glow: "0 0 96px rgba(212,255,0,0.22)",
    card: "0 0 0 1px rgba(244,244,240,0.08), 0 16px 48px rgba(0,0,0,0.32)",
  },
  borders: {
    default: "rgba(244,244,240,0.12)",
    accent: "rgba(212,255,0,0.38)",
    subtle: "rgba(244,244,240,0.06)",
  },
};

export const STUDIO_VOLT_MOTION: TemplateV2MotionConfig = {
  preset: "kinetic-spring-stagger",
  reducedMotion: "fade",
  entrances: {
    hero: { type: "volt-slam", durationMs: 850, staggerMs: 70 },
    section: { type: "slide-rise", durationMs: 600, staggerMs: 50 },
    overlay: { type: "reveal-wipe", durationMs: 1000, staggerMs: 0 },
  },
  microInteractions: {
    link: { hover: "volt-underline", focus: "volt-ring" },
    card: { hover: "lift-glow", focus: "visible-ring" },
    button: { hover: "volt-invert", active: "press" },
  },
  imports: [],
};

export const STUDIO_VOLT_RESPONSIVE_BASE: Pick<
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
  containerMaxWidth: "100%",
};

export const STUDIO_VOLT_RESPONSIVE_STRUCTURE: Pick<
  TemplateV2ResponsiveRules,
  "regions" | "components"
> = {
  regions: {
    header: { sticky: true, position: "top" },
    overlay: { collapseBelow: "sm" },
    main: { collapseBelow: "sm" },
  },
  components: {
    "creative-agency-premium-hero": {
      layout: { lg: "volt-split", sm: "stacked" },
    },
    "creative-agency-premium-case-grid": {
      layout: { lg: "brutalist-masonry", sm: "stacked" },
    },
  },
};
