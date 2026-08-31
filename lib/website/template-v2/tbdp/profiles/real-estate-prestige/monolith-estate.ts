import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";

import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";

import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";



/**

 * Monolith Estate — TBDP template identity binding for real-estate-prestige.

 * Locked visual contract resolved through TBDP sector DNA (real-estate) +

 * luxury/executive/corporate experience profiles.

 * Values preserved for zero visual regression.

 */

export const MONOLITH_ESTATE_V2_TOKENS: TemplateV2DesignTokens = {

  colors: {

    primary: "#0E0D0B",

    secondary: "#16130F",

    accent: "#C9AE72",

    background: "#090807",

    foreground: "#F4EDE3",

    muted: "rgba(228, 212, 188, 0.62)",

    surface: "#12100D",

    "surface-elevated": "#1A1612",

    signal: "#C9AE72",

    grid: "rgba(201, 174, 114, 0.075)",

    ink: "#090807",

    stone: "rgba(244, 237, 227, 0.10)",

    brass: "#C9AE72",

    "brass-light": "#DCC894",

    "brass-deep": "#9E8248",

    linen: "#15120E",

  },

  typography: {

    display: "Fraunces",

    body: "Outfit",

    scale: {

      sm: "0.8125rem",

      base: "1.0625rem",

      lg: "1.375rem",

      xl: "3.25rem",

      display: "clamp(2.75rem, 6vw, 4.5rem)",

    },

  },

  languageProfile: {

    directionAdaptation: true,

    rtlTypography: {

      display: "Tajawal",

      body: "Noto Sans Arabic",

    },

    ltrTypography: {

      display: "Fraunces",

      body: "Outfit",

    },

  },

  spacing: {

    unit: "0.25rem",

    scale: ["0", "1", "2", "4", "6", "8", "12", "16", "20", "24", "32", "40", "48", "64", "80"],

  },

  radius: {

    sm: "2px",

    md: "4px",

    lg: "8px",

  },

  shadows: {

    surface: "0 16px 48px rgba(0,0,0,0.48)",

    glow: "0 0 88px rgba(201, 174, 114, 0.20), 0 0 24px rgba(201, 174, 114, 0.08)",

    card: "0 0 0 1px rgba(201, 174, 114, 0.14), 0 24px 56px rgba(0,0,0,0.42)",

  },

  borders: {

    default: "rgba(201, 174, 114, 0.16)",

    accent: "rgba(201, 174, 114, 0.44)",

    subtle: "rgba(244, 237, 227, 0.06)",

  },

};



/** Luxury/executive motion binding — maps TBDP sector motion profile to Monolith Estate entrances. */

export const MONOLITH_ESTATE_MOTION: TemplateV2MotionConfig = {

  preset: "monolith-reveal",

  reducedMotion: "fade",

  entrances: {

    hero: { type: "parallax-lift", durationMs: 900, staggerMs: 80 },

    section: { type: "stone-rise", durationMs: 680, staggerMs: 60 },

    dossier: { type: "snap-in", durationMs: 520, staggerMs: 40 },

  },

  microInteractions: {

    card: { hover: "lift-shadow", focus: "brass-ring" },

    image: { hover: "ken-burns-subtle" },

    button: { hover: "brass-glow", active: "press" },

  },

  imports: [],

};



/** TBDP responsive rules binding — breakpoints from foundations grid, Monolith wide container. */

export const MONOLITH_ESTATE_RESPONSIVE_BASE: Pick<

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



/** Template-owned structure — regions and component layout contracts. */

export const MONOLITH_ESTATE_RESPONSIVE_STRUCTURE: Pick<

  TemplateV2ResponsiveRules,

  "regions" | "components"

> = {

  regions: {

    header: { sticky: true, position: "top" },

    sidebar: { sticky: true, collapseBelow: "lg" },

    main: { collapseBelow: "sm" },

  },

  components: {

    "real-estate-prestige-hero": {

      layout: { lg: "full-bleed-estate", sm: "stacked" },

    },

    "real-estate-prestige-collection": {

      layout: { lg: "editorial-grid", sm: "stacked" },

    },

  },

};

