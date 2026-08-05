import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/**
 * Atelier Commerce — TBDP template identity binding for ecommerce-premium.
 * Editorial luxury retail: ivory foundations, ink typography, champagne gold accents.
 * TBDP sector DNA: logistics (e-commerce operators) + luxury/editorial/minimal profiles.
 */
export const ATELIER_COMMERCE_V2_TOKENS: TemplateV2DesignTokens = {
  colors: {
    primary: "#12100E",
    secondary: "#2A2724",
    accent: "#C9A962",
    background: "#FAF8F5",
    foreground: "#12100E",
    muted: "rgba(18,16,14,0.58)",
    surface: "#FFFFFF",
    linen: "#F3EFE8",
    champagne: "#C9A962",
    ink: "#12100E",
  },
  typography: {
    display: "Playfair Display",
    body: "Manrope",
    scale: {
      sm: "0.8125rem",
      base: "1.0625rem",
      lg: "1.375rem",
      xl: "3.25rem",
      display: "clamp(2.75rem, 5.5vw, 4.5rem)",
    },
  },
  languageProfile: {
    directionAdaptation: true,
    rtlTypography: {
      display: "Amiri",
      body: "Noto Sans Arabic",
    },
    ltrTypography: {
      display: "Playfair Display",
      body: "Manrope",
    },
  },
  spacing: {
    unit: "0.25rem",
    scale: ["0", "1", "2", "3", "4", "6", "8", "12", "16", "20", "24", "32", "40", "48", "64"],
  },
  radius: {
    sm: "2px",
    md: "4px",
    lg: "8px",
    xl: "12px",
  },
  shadows: {
    surface: "0 24px 64px rgba(18,16,14,0.08)",
    glow: "0 0 80px rgba(201,169,98,0.16)",
    card: "0 1px 2px rgba(18,16,14,0.04), 0 16px 48px rgba(18,16,14,0.06)",
  },
  borders: {
    default: "rgba(18,16,14,0.1)",
    accent: "rgba(201,169,98,0.32)",
    subtle: "rgba(18,16,14,0.05)",
  },
};

export const ATELIER_COMMERCE_MOTION: TemplateV2MotionConfig = {
  preset: "atelier-reveal",
  reducedMotion: "fade",
  entrances: {
    hero: { type: "editorial-fade", durationMs: 820, staggerMs: 60 },
    section: { type: "gentle-rise", durationMs: 560, staggerMs: 44 },
    card: { type: "scale-in", durationMs: 480, staggerMs: 50 },
  },
  microInteractions: {
    button: { hover: "soft-lift", active: "press", focus: "gold-ring" },
    card: { hover: "shadow-lift", focus: "visible-ring" },
    product: { hover: "image-zoom", focus: "ring" },
  },
  imports: [],
};

export const ATELIER_COMMERCE_RESPONSIVE_BASE: Pick<
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

export const ATELIER_COMMERCE_RESPONSIVE_STRUCTURE: Pick<
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
    "ecommerce-premium-hero": {
      layout: { lg: "editorial-split", sm: "stacked" },
    },
    "ecommerce-premium-product-grid": {
      layout: { lg: "masonry-catalog", sm: "stacked" },
    },
  },
};
