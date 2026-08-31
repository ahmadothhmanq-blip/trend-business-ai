import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/** Meridian Capital — TBDP identity for finance-premium. */
export const APEX_LEDGER_V2_TOKENS: TemplateV2DesignTokens = {
  colors: {
    primary: "#0B1F33",
    secondary: "#163352",
    accent: "#C9A962",
    background: "#EDEAE4",
    foreground: "#0B1F33",
    muted: "rgba(11,31,51,0.56)",
    surface: "#FFFFFF",
    signal: "#C9A962",
    grid: "rgba(11,31,51,0.05)",
    ink: "#0B1F33",
  },
  typography: {
    display: "Playfair Display",
    body: "Lato",
    scale: {
      sm: "0.875rem",
      base: "1rem",
      lg: "1.375rem",
      xl: "2.875rem",
      display: "clamp(2.5rem, 5vw, 3.75rem)",
    },
  },
  languageProfile: {
    directionAdaptation: true,
    rtlTypography: { display: "Amiri", body: "Lato" },
    ltrTypography: { display: "Playfair Display", body: "Lato" },
  },
  spacing: {
    unit: "0.25rem",
    scale: ["0", "1", "2", "3", "4", "6", "8", "12", "16", "20", "24", "32", "40", "48", "64"],
  },
  radius: { sm: "2px", md: "4px", lg: "8px", xl: "12px" },
  shadows: {
    surface: "0 20px 60px rgba(11,31,51,0.07), 0 2px 8px rgba(11,31,51,0.03)",
    glow: "0 0 64px rgba(201,169,98,0.18)",
    card: "0 0 0 1px rgba(11,31,51,0.05), 0 8px 32px rgba(11,31,51,0.06)",
  },
  borders: {
    default: "rgba(11,31,51,0.09)",
    accent: "rgba(201,169,98,0.32)",
    subtle: "rgba(11,31,51,0.05)",
  },
};

export const APEX_LEDGER_MOTION: TemplateV2MotionConfig = {
  preset: "meridian-reveal",
  reducedMotion: "fade",
  entrances: {
    hero: { type: "slide-up", durationMs: 720, staggerMs: 55 },
    section: { type: "slide-up", durationMs: 560, staggerMs: 45 },
    metric: { type: "count-up", durationMs: 950, staggerMs: 80 },
  },
  microInteractions: {
    button: { hover: "glow", active: "press" },
    card: { hover: "lift", focus: "ring" },
  },
  imports: [],
};

export const APEX_LEDGER_RESPONSIVE_BASE: Pick<
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

export const APEX_LEDGER_RESPONSIVE_STRUCTURE: Pick<
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
    "finance-premium-hero": { layout: { lg: "split-trust", sm: "stacked" } },
    "finance-premium-features": { layout: { lg: "grid-3", sm: "stacked" } },
  },
};
