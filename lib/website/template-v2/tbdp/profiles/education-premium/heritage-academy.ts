import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/** Scholar's Hall — TBDP identity for education-premium. */
export const HERITAGE_ACADEMY_V2_TOKENS: TemplateV2DesignTokens = {
  colors: {
    primary: "#1B2A4A",
    secondary: "#2A3F66",
    accent: "#C5A572",
    background: "#F7F3EC",
    foreground: "#1B2A4A",
    muted: "rgba(27,42,74,0.56)",
    surface: "#FFFFFF",
    signal: "#C5A572",
    grid: "rgba(27,42,74,0.05)",
    ink: "#1B2A4A",
  },
  typography: {
    display: "EB Garamond",
    body: "Nunito Sans",
    scale: {
      sm: "0.875rem",
      base: "1.0625rem",
      lg: "1.375rem",
      xl: "2.875rem",
      display: "clamp(2.5rem, 5.2vw, 4rem)",
    },
  },
  languageProfile: {
    directionAdaptation: true,
    rtlTypography: { display: "Amiri", body: "Noto Sans Arabic" },
    ltrTypography: { display: "EB Garamond", body: "Nunito Sans" },
  },
  spacing: {
    unit: "0.25rem",
    scale: ["0", "1", "2", "3", "4", "6", "8", "12", "16", "20", "24", "32", "40", "48", "64"],
  },
  radius: { sm: "4px", md: "8px", lg: "12px", xl: "16px" },
  shadows: {
    surface: "0 20px 60px rgba(27,42,74,0.07), 0 2px 8px rgba(27,42,74,0.03)",
    glow: "0 0 64px rgba(197,165,114,0.18)",
    card: "0 0 0 1px rgba(27,42,74,0.05), 0 8px 32px rgba(27,42,74,0.06)",
  },
  borders: {
    default: "rgba(27,42,74,0.09)",
    accent: "rgba(197,165,114,0.32)",
    subtle: "rgba(27,42,74,0.05)",
  },
};

export const HERITAGE_ACADEMY_MOTION: TemplateV2MotionConfig = {
  preset: "scholarly-reveal",
  reducedMotion: "fade",
  entrances: {
    hero: { type: "scholarly-rise", durationMs: 720, staggerMs: 52 },
    section: { type: "gentle-rise", durationMs: 560, staggerMs: 44 },
    metric: { type: "count-up", durationMs: 920, staggerMs: 80 },
  },
  microInteractions: {
    button: { hover: "soft-lift", active: "press" },
    card: { hover: "lift", focus: "ring" },
  },
  imports: [],
};

export const HERITAGE_ACADEMY_RESPONSIVE_BASE: Pick<
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

export const HERITAGE_ACADEMY_RESPONSIVE_STRUCTURE: Pick<
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
    "education-premium-hero": { layout: { lg: "split-trust", sm: "stacked" } },
    "education-premium-features": { layout: { lg: "grid-3", sm: "stacked" } },
  },
};
