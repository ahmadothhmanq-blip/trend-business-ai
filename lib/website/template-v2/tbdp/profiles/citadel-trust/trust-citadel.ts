import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/** Trust Citadel — TBDP identity for citadel-trust. */
export const TRUST_CITADEL_V2_TOKENS: TemplateV2DesignTokens = {
  colors: {
    primary: "#0A1F35",
    secondary: "#143050",
    accent: "#6B9DC4",
    background: "#060E18",
    foreground: "#E6EEF5",
    muted: "rgba(230,238,245,0.62)",
    surface: "#0e2137",
    signal: "#6B9DC4",
    grid: "rgba(107,157,196,0.08)",
    ink: "#060E18",
  },
  typography: {
    display: "Libre Baskerville",
    body: "Source Sans 3",
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
    ltrTypography: { display: "Libre Baskerville", body: "Source Sans 3" },
  },
  spacing: {
    unit: "0.25rem",
    scale: ["0", "1", "2", "3", "4", "6", "8", "12", "16", "20", "24", "32", "40", "48", "64"],
  },
  radius: { sm: "10px", md: "16px", lg: "24px", xl: "32px" },
  shadows: {
    surface: "0 12px 40px rgba(0,0,0,0.28)",
    glow: "0 0 96px rgba(107,157,196,0.22)",
    card: "0 0 0 1px rgba(230,238,245,0.08), 0 16px 48px rgba(0,0,0,0.32)",
  },
  borders: {
    default: "rgba(230,238,245,0.12)",
    accent: "rgba(107,157,196,0.38)",
    subtle: "rgba(230,238,245,0.06)",
  },
};

export const TRUST_CITADEL_MOTION: TemplateV2MotionConfig = {
  preset: "citadel-trust-reveal",
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

export const TRUST_CITADEL_RESPONSIVE_BASE: Pick<
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

export const TRUST_CITADEL_RESPONSIVE_STRUCTURE: Pick<
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
    "citadel-trust-hero": {
      layout: { lg: "split-trust", sm: "stacked" },
    },
  },
};
