/**
 * Premium template library — installed Website Builder structure packages.
 */

/** @typedef {import('./generate-premium-template-library.mjs').PremiumTemplateConfig} PremiumTemplateConfig */

/** @type {PremiumTemplateConfig[]} */
export const PREMIUM_TEMPLATE_LIBRARY = [
  {
    id: "modern-business",
    name: "Corporate Command",
    description:
      "Executive-grade corporate presence with trust-first hierarchy, boardroom typography, and measured conversion paths.",
    category: "corporate",
    industry: "Corporate",
    tags: ["corporate", "enterprise", "trust", "b2b"],
    keywords: ["corporate", "executive", "boardroom", "trust"],
    tiId: "ti-corporate-trust",
    layoutKind: "single-column",
    regionIds: ["header", "main", "footer"],
    featured: true,
    featuredRank: 1,
    pageDefs: [
      { id: "home", title: "Home", path: "/" },
      { id: "about", title: "About", path: "/about" },
      { id: "services", title: "Services", path: "/services" },
      { id: "contact", title: "Contact", path: "/contact" },
    ],
    canvas: {
      columns: 12,
      gutter: "1.25rem",
      margin: "1.5rem",
      maxWidth: "76rem",
      spacingScale: ["0.25", "0.5", "0.75", "1", "1.5", "2.5", "4", "6"],
      typography: {
        display: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif",
        body: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif",
        scale: { sm: "0.875rem", base: "1rem", lg: "1.375rem", xl: "2.25rem" },
      },
      radius: { sm: "4px", md: "8px", lg: "12px" },
      shadows: { surface: "0 1px 2px rgba(15,23,42,0.06)" },
      colors: {
        primary: "#0F2B46",
        secondary: "#1E4976",
        accent: "#2563EB",
        background: "#FFFFFF",
        foreground: "#0F172A",
        muted: "rgba(15,23,42,0.58)",
        surface: "#F8FAFC",
      },
      animation: "subtle-fade-up",
    },
  },
  {
    id: "ai-startup-signal",
    name: "AI Signal",
    description:
      "Futuristic AI startup with cinematic full-bleed hero, glass bento panels, and signal-grade dark mode aesthetics.",
    category: "ai-startup",
    industry: "AI Startup",
    tags: ["ai", "startup", "ml", "futuristic"],
    keywords: ["ai", "machine learning", "startup", "signal"],
    tiId: "ti-ai-company-signal",
    layoutKind: "full-bleed",
    regionIds: ["header", "main", "overlay", "footer"],
    featured: true,
    featuredRank: 2,
    pageDefs: [
      { id: "home", title: "Home", path: "/" },
      { id: "platform", title: "Platform", path: "/platform" },
      { id: "research", title: "Research", path: "/research" },
      { id: "careers", title: "Careers", path: "/careers" },
    ],
    canvas: {
      columns: 12,
      gutter: "1.5rem",
      margin: "0",
      maxWidth: "100%",
      spacingScale: ["0.5", "1", "1.5", "2", "3", "4", "6", "10"],
      typography: {
        display: "Syne, ui-sans-serif, system-ui, sans-serif",
        body: "Outfit, ui-sans-serif, system-ui, sans-serif",
        scale: { sm: "0.875rem", base: "1.0625rem", lg: "1.5rem", xl: "3.5rem" },
      },
      radius: { sm: "10px", md: "18px", lg: "28px" },
      shadows: { surface: "0 0 40px rgba(34,211,238,0.15)" },
      colors: {
        primary: "#020617",
        secondary: "#0F172A",
        accent: "#22D3EE",
        background: "#030712",
        foreground: "#F0F9FF",
        muted: "rgba(240,249,255,0.62)",
        surface: "#0F172A",
      },
      animation: "glow-stagger",
    },
    grid: {
      columns: "1fr",
      rows: "auto auto auto auto",
      templateAreas: '"header" "overlay" "main" "footer"',
      gap: "0",
      regionGap: "0",
    },
  },
];
