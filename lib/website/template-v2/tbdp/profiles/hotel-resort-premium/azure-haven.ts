import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/** Azure Haven — TBDP identity for hotel-resort-premium. */
export const AZURE_HAVEN_V2_TOKENS: TemplateV2DesignTokens = {
  colors: {
    primary: "#0C2340",
    secondary: "#1A4A6E",
    accent: "#4A9FD4",
    background: "#0C2340",
    foreground: "#F2E8DC",
    muted: "rgba(242,232,220,0.58)",
    surface: "#0F2A4A",
    sand: "#F2E8DC",
    azure: "#4A9FD4",
    pearl: "#FDFBF7",
  },
  typography: {
    display: "Cormorant Garamond",
    body: "Jost",
    scale: {
      sm: "0.875rem",
      base: "1.0625rem",
      lg: "1.375rem",
      xl: "3.25rem",
      display: "clamp(2.75rem, 6vw, 5rem)",
    },
  },
  languageProfile: {
    directionAdaptation: true,
    rtlTypography: { display: "Amiri", body: "Noto Sans Arabic" },
    ltrTypography: { display: "Cormorant Garamond", body: "Jost" },
  },
  spacing: {
    unit: "0.25rem",
    scale: ["0", "1", "2", "3", "4", "6", "8", "12", "16", "20", "24", "32", "40", "48", "64"],
  },
  radius: { sm: "2px", md: "4px", lg: "8px" },
  shadows: {
    surface: "0 32px 80px rgba(0,0,0,0.45)",
    glow: "0 0 100px rgba(74,159,212,0.18)",
    card: "0 8px 32px rgba(12,35,64,0.2)",
  },
  borders: {
    default: "rgba(242,232,220,0.1)",
    accent: "rgba(74,159,212,0.32)",
    subtle: "rgba(242,232,220,0.06)",
  },
};

export const AZURE_HAVEN_MOTION: TemplateV2MotionConfig = {
  preset: "azure-haven-reveal",
  reducedMotion: "fade",
  entrances: {
    hero: { type: "coastal-fade", durationMs: 900, staggerMs: 55 },
    section: { type: "gentle-rise", durationMs: 560, staggerMs: 45 },
    card: { type: "scale-in", durationMs: 480, staggerMs: 50 },
  },
  microInteractions: {
    button: { hover: "soft-lift", active: "press" },
    card: { hover: "shadow-lift", focus: "visible-ring" },
  },
  imports: [],
};

export const AZURE_HAVEN_RESPONSIVE_BASE: Pick<
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

export const AZURE_HAVEN_RESPONSIVE_STRUCTURE: Pick<
  TemplateV2ResponsiveRules,
  "regions" | "components"
> = {
  regions: {
    header: { sticky: true, position: "top" },
    sidebar: { collapseBelow: "lg", collapseMode: "drawer" },
    main: { collapseBelow: "sm" },
    utility: { collapseBelow: "md", collapseMode: "stack" },
  },
  components: {
    "hotel-resort-premium-hero": { layout: { lg: "cinematic-hospitality", sm: "stacked" } },
    "hotel-resort-premium-signature-dishes": { layout: { lg: "editorial-grid", sm: "stacked" } },
  },
};
