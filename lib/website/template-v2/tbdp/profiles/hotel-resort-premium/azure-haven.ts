import type { TemplateV2DesignTokens } from "@/lib/website/template-v2/contracts/tokens";

import type { TemplateV2MotionConfig } from "@/lib/website/template-v2/contracts/motion";

import type { TemplateV2ResponsiveRules } from "@/lib/website/template-v2/contracts/package";



/** Mirage Haven — uncanny lavender hospitality with plum structure and hot-pink signal. */

export const AZURE_HAVEN_V2_TOKENS: TemplateV2DesignTokens = {

  colors: {

    primary: "#2A2340",

    secondary: "#4E3D6B",

    accent: "#FF5C8A",

    background: "#E6E0F5",

    foreground: "#1A1228",

    muted: "rgba(26,18,40,0.58)",

    surface: "#D8CFE8",

    "surface-elevated": "#F9F7FD",

    signal: "#FF5C8A",

    grid: "rgba(78,61,107,0.07)",

    ink: "#1A1228",

    sand: "#D8CFE8",

    azure: "#FF5C8A",

    "azure-light": "#FF8FB0",

    "azure-deep": "#E03D72",

    pearl: "#F9F7FD",

  },

  typography: {

    display: "Playfair Display",

    body: "Outfit",

    scale: {

      sm: "0.875rem",

      base: "1rem",

      lg: "1.125rem",

      xl: "1.75rem",

      display: "clamp(2.5rem, 4.8vw, 3.75rem)",

    },

  },

  languageProfile: {

    directionAdaptation: true,

    rtlTypography: { display: "Amiri", body: "Noto Sans Arabic" },

    ltrTypography: { display: "Playfair Display", body: "Outfit" },

  },

  spacing: {

    unit: "0.25rem",

    scale: ["0", "1", "2", "3", "4", "6", "8", "12", "16", "20", "24", "32", "40", "48", "64"],

  },

  radius: { sm: "6px", md: "12px", lg: "20px" },

  shadows: {

    surface: "0 2px 10px rgba(42,35,64,0.06), 0 14px 36px rgba(255,92,138,0.08)",

    glow: "0 20px 56px rgba(78,61,107,0.14), 0 8px 24px rgba(255,92,138,0.12)",

    card: "0 22px 52px rgba(42,35,64,0.1), 0 10px 24px rgba(255,92,138,0.08), 0 0 0 1px rgba(78,61,107,0.08)",

  },

  borders: {

    default: "rgba(26,18,40,0.11)",

    accent: "rgba(255,92,138,0.32)",

    subtle: "rgba(78,61,107,0.1)",

  },

};



export const AZURE_HAVEN_MOTION: TemplateV2MotionConfig = {

  preset: "mirage-haven-rise",

  reducedMotion: "fade",

  entrances: {

    hero: { type: "soft-rise", durationMs: 800, staggerMs: 60 },

    section: { type: "gentle-rise", durationMs: 520, staggerMs: 40 },

    card: { type: "scale-in", durationMs: 440, staggerMs: 45 },

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

  containerMaxWidth: "76rem",

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

    "hotel-resort-premium-hero": { layout: { lg: "split-editorial", sm: "stacked" } },

    "hotel-resort-premium-integrations": { layout: { lg: "editorial-grid", sm: "stacked" } },

  },

};

