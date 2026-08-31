import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/** Executive Atlas — TBDP identity for corporate-business. */
export const EXECUTIVE_ATLAS_V2_TOKENS: TemplateV2DesignTokens = {
  colors: {
    primary: "#0A1628",
    secondary: "#152238",
    accent: "#B89B6E",
    background: "#F8F6F2",
    foreground: "#0A1628",
    muted: "rgba(10,22,40,0.56)",
    surface: "#FFFFFF",
    signal: "#B89B6E",
    grid: "rgba(10,22,40,0.05)",
    ink: "#0A1628",
  },
  typography: {
    display: "Cormorant Garamond",
    body: "Inter",
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
    rtlTypography: { display: "Amiri", body: "Noto Sans Arabic" },
    ltrTypography: { display: "Cormorant Garamond", body: "Inter" },
  },
  spacing: {
    unit: "0.25rem",
    scale: ["0", "1", "2", "3", "4", "6", "8", "12", "16", "20", "24", "32", "40", "48", "64"],
  },
  radius: { sm: "4px", md: "8px", lg: "12px", xl: "20px" },
  shadows: {
    surface: "0 20px 60px rgba(10,22,40,0.07), 0 2px 8px rgba(10,22,40,0.03)",
    glow: "0 0 64px rgba(184,155,110,0.18)",
    card: "0 0 0 1px rgba(10,22,40,0.05), 0 8px 32px rgba(10,22,40,0.06)",
  },
  borders: {
    default: "rgba(10,22,40,0.09)",
    accent: "rgba(184,155,110,0.32)",
    subtle: "rgba(10,22,40,0.05)",
  },
};

export const EXECUTIVE_ATLAS_MOTION: TemplateV2MotionConfig = {
  preset: "atlas-reveal",
  reducedMotion: "fade",
  entrances: {
    hero: { type: "slide-up", durationMs: 680, staggerMs: 50 },
    section: { type: "slide-up", durationMs: 520, staggerMs: 40 },
    metric: { type: "count-up", durationMs: 880, staggerMs: 70 },
  },
  microInteractions: {
    button: { hover: "glow", active: "press" },
    card: { hover: "lift", focus: "ring" },
  },
  imports: [],
};

export const EXECUTIVE_ATLAS_RESPONSIVE_BASE: Pick<
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

export const EXECUTIVE_ATLAS_RESPONSIVE_STRUCTURE: Pick<
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
    "corporate-business-hero": { layout: { lg: "split-trust", sm: "stacked" } },
    "corporate-business-features": { layout: { lg: "grid-3", sm: "stacked" } },
  },
};
