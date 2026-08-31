import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";
import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";
import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";

/**
 * Kinetic Atelier — TBDP template identity binding for creative-portfolio.
 * Locked visual contract resolved through TBDP sector DNA (creative-studio) +
 * creative/editorial/playful experience profiles.
 * Values preserved for zero visual regression.
 */
export const KINETIC_ATELIER_V2_TOKENS: TemplateV2DesignTokens = {
  colors: {
    primary: "#09090B",
    secondary: "#18181B",
    accent: "#E8FF47",
    background: "#09090B",
    foreground: "#F4F4EF",
    muted: "rgba(244,244,239,0.62)",
    surface: "#111114",
    signal: "#E8FF47",
    grid: "rgba(232,255,71,0.08)",
    ink: "#09090B",
    volt: "#E8FF47",
    magenta: "#FF2D6A",
    ghost: "#F4F4EF",
    zinc: "rgba(244,244,239,0.45)",
  },
  typography: {
    display: "Syne",
    body: "Instrument Sans",
    scale: {
      sm: "0.8125rem",
      base: "1rem",
      lg: "1.375rem",
      xl: "4rem",
      display: "clamp(3.5rem, 11vw, 9rem)",
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
      body: "Instrument Sans",
    },
  },
  spacing: {
    unit: "0.25rem",
    scale: ["0", "1", "2", "4", "6", "8", "12", "16", "20", "24", "32", "40", "48", "64", "96"],
  },
  radius: {
    sm: "0",
    md: "2px",
    lg: "4px",
  },
  shadows: {
    surface: "0 12px 40px rgba(0,0,0,0.28)",
    glow: "0 0 96px rgba(232,255,71,0.22)",
    card: "0 0 0 1px rgba(244,244,239,0.08), 0 16px 48px rgba(0,0,0,0.32)",
  },
  borders: {
    default: "rgba(244,244,239,0.12)",
    accent: "rgba(232,255,71,0.38)",
    subtle: "rgba(244,244,239,0.06)",
  },
};

/** Creative/editorial motion binding — maps TBDP sector motion profile to Kinetic Atelier entrances. */
export const KINETIC_ATELIER_MOTION: TemplateV2MotionConfig = {
  preset: "kinetic-spring-stagger",
  reducedMotion: "fade",
  entrances: {
    hero: { type: "kinetic-slam", durationMs: 900, staggerMs: 80 },
    section: { type: "asymmetric-rise", durationMs: 620, staggerMs: 55 },
    overlay: { type: "reveal-wipe", durationMs: 1100, staggerMs: 0 },
  },
  microInteractions: {
    link: { hover: "volt-underline", focus: "volt-ring" },
    card: { hover: "tilt-lift", focus: "visible-ring" },
    button: { hover: "volt-invert", active: "press" },
  },
  imports: [],
};

/** TBDP responsive rules binding — full-bleed editorial container. */
export const KINETIC_ATELIER_RESPONSIVE_BASE: Pick<
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

/** Template-owned structure — regions and component layout contracts. */
export const KINETIC_ATELIER_RESPONSIVE_STRUCTURE: Pick<
  TemplateV2ResponsiveRules,
  "regions" | "components"
> = {
  regions: {
    header: { sticky: true, position: "top" },
    overlay: { collapseBelow: "sm" },
    main: { collapseBelow: "sm" },
  },
  components: {
    "creative-portfolio-hero": {
      layout: { lg: "kinetic-split", sm: "stacked" },
    },
    "creative-portfolio-case-grid": {
      layout: { lg: "asymmetric-masonry", sm: "stacked" },
    },
  },
};
