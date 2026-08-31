import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/** Industrial Forge — TBDP identity for forge-industrial. */
export const INDUSTRIAL_FORGE_V2_TOKENS: TemplateV2DesignTokens = {
  colors: {
    primary: "#1C1917",
    secondary: "#44403C",
    accent: "#E85D04",
    background: "#F5F4F2",
    foreground: "#1C1917",
    muted: "rgba(28,25,23,0.56)",
    surface: "#FFFFFF",
    signal: "#E85D04",
    grid: "rgba(28,25,23,0.05)",
    ink: "#1C1917",
  },
  typography: {
    display: "Archivo",
    body: "Inter",
    scale: {
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.625rem",
      display: "clamp(1.875rem, 3vw, 2.5rem)"
},
  },
  languageProfile: {
    directionAdaptation: true,
    rtlTypography: { display: "Alexandria", body: "Noto Sans Arabic" },
    ltrTypography: { display: "Archivo", body: "Inter" },
  },
  spacing: {
    unit: "0.25rem",
    scale: ["0", "1", "2", "3", "4", "6", "8", "12", "16", "20", "24", "32", "40", "48", "64"],
  },
  radius: { sm: "10px", md: "16px", lg: "24px", xl: "32px" },
  shadows: {
    surface: "0 20px 60px rgba(28,25,23,0.07), 0 2px 8px rgba(28,25,23,0.03)",
    glow: "0 0 64px rgba(232,93,4,0.18)",
    card: "0 0 0 1px rgba(28,25,23,0.05), 0 8px 32px rgba(28,25,23,0.06)",
  },
  borders: {
    default: "rgba(28,25,23,0.09)",
    accent: "rgba(232,93,4,0.32)",
    subtle: "rgba(28,25,23,0.05)",
  },
};

export const INDUSTRIAL_FORGE_MOTION: TemplateV2MotionConfig = {
  preset: "forge-industrial-reveal",
  reducedMotion: "fade",
  entrances: {
    hero: { type: "slide-up", durationMs: 720, staggerMs: 55 },
    section: { type: "slide-up", durationMs: 560, staggerMs: 45 },
    metric: { type: "count-up", durationMs: 900, staggerMs: 80 },
  },
  microInteractions: {
    button: { hover: "glow", active: "press" },
    card: { hover: "lift", focus: "ring" },
  },
  imports: [],
};

export const INDUSTRIAL_FORGE_RESPONSIVE_BASE: Pick<
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

export const INDUSTRIAL_FORGE_RESPONSIVE_STRUCTURE: Pick<
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
    "forge-industrial-hero": {
      layout: { lg: "split-trust", sm: "stacked" },
    },
  },
};
