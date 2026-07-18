import type {
  AiDesignSystem,
  DesignPresetId,
} from "@/lib/ai-core/design-system/types";

type PresetBase = Omit<AiDesignSystem, "industryPattern" | "layoutStyle">;

export const DESIGN_PRESETS: Record<DesignPresetId, PresetBase> = {
  luxury: {
    preset: "luxury",
    style: "Luxury editorial",
    colors: {
      primary: "#D4AF37",
      secondary: "#1A1A1A",
      accent: "#C9A227",
      neutral: "#6B7280",
      surface: "#F5F5F4",
      background: "#0A0A0A",
      foreground: "#FAFAF9",
    },
    typography: {
      headingFont: "Playfair Display",
      bodyFont: "Source Sans 3",
      scale: ["text-5xl", "text-3xl", "text-xl", "text-base"],
      notes: "Serif display + refined sans body",
    },
    spacing: {
      unit: "4px",
      scale: ["6", "10", "16", "24", "32", "48"],
      sectionGap: "6rem",
      containerMax: "72rem",
      notes: "Generous editorial whitespace",
    },
    uiStyle: {
      density: "airy",
      corners: "soft",
      elevation: "soft",
      contrast: "high",
      notes: "Cinematic contrast with gold accents",
    },
    componentStyle: {
      buttons: "Solid gold CTA with quiet ghost secondary",
      cards: "Glass/dark panels with thin gold borders",
      inputs: "Understated dark fields with gold focus",
      navigation: "Minimal top bar, logo-led",
      palette: ["Hero", "Gallery", "Testimonials", "CTA", "Footer"],
    },
    animationStyle: {
      motion: "subtle",
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      duration: "600ms",
      entrances: ["fade-up", "slow parallax"],
      notes: "Slow, premium reveals — never busy",
    },
    layoutRules: [
      "Full-bleed hero imagery",
      "Generous whitespace",
      "Gold accent CTAs",
    ],
    uiPatterns: ["Split hero", "Masonry proof", "Sticky CTA bar"],
    borderRadius: "0.75rem",
    shadowStyle: "soft gold glow",
  },
  modern: {
    preset: "modern",
    style: "Modern product",
    colors: {
      primary: "#2563EB",
      secondary: "#0F172A",
      accent: "#22D3EE",
      neutral: "#64748B",
      surface: "#F1F5F9",
      background: "#FFFFFF",
      foreground: "#0F172A",
    },
    typography: {
      headingFont: "Space Grotesk",
      bodyFont: "IBM Plex Sans",
      scale: ["text-4xl", "text-2xl", "text-lg", "text-base"],
      notes: "Geometric product UI typography",
    },
    spacing: {
      unit: "4px",
      scale: ["4", "8", "12", "16", "24", "32"],
      sectionGap: "5rem",
      containerMax: "72rem",
      notes: "Product marketing rhythm",
    },
    uiStyle: {
      density: "balanced",
      corners: "soft",
      elevation: "elevated",
      contrast: "medium",
      notes: "Clean SaaS / product marketing UI",
    },
    componentStyle: {
      buttons: "Primary filled + outline secondary",
      cards: "Elevated feature cards with icon headers",
      inputs: "Rounded fields with clear focus rings",
      navigation: "Sticky product nav with CTA",
      palette: ["Hero", "FeatureGrid", "Pricing", "FAQ", "CTA"],
    },
    animationStyle: {
      motion: "subtle",
      easing: "ease-out",
      duration: "400ms",
      entrances: ["fade-up", "stagger cards"],
      notes: "Crisp micro-interactions",
    },
    layoutRules: [
      "Card grids with clear hierarchy",
      "Mobile-first breakpoints",
      "High-contrast CTAs",
    ],
    uiPatterns: ["Bento features", "Logo cloud", "Pricing cards"],
    borderRadius: "1rem",
    shadowStyle: "soft elevated",
  },
  corporate: {
    preset: "corporate",
    style: "Corporate trust",
    colors: {
      primary: "#1E3A5F",
      secondary: "#334155",
      accent: "#0EA5E9",
      neutral: "#64748B",
      surface: "#F8FAFC",
      background: "#FFFFFF",
      foreground: "#0F172A",
    },
    typography: {
      headingFont: "Source Serif 4",
      bodyFont: "Inter",
      scale: ["text-4xl", "text-2xl", "text-lg", "text-base"],
      notes: "Authoritative serif headings + neutral body",
    },
    spacing: {
      unit: "4px",
      scale: ["4", "8", "12", "20", "28", "40"],
      sectionGap: "4.5rem",
      containerMax: "70rem",
      notes: "Structured institutional spacing",
    },
    uiStyle: {
      density: "balanced",
      corners: "soft",
      elevation: "soft",
      contrast: "medium",
      notes: "Trust-first professional UI",
    },
    componentStyle: {
      buttons: "Navy primary, muted secondary",
      cards: "Bordered service cards",
      inputs: "Standard form fields with clear labels",
      navigation: "Multi-link corporate header",
      palette: ["Hero", "Services", "Stats", "Testimonials", "Contact"],
    },
    animationStyle: {
      motion: "subtle",
      easing: "ease-in-out",
      duration: "350ms",
      entrances: ["fade", "slide-up"],
      notes: "Conservative motion for credibility",
    },
    layoutRules: [
      "Clear section hierarchy",
      "Trust signals above the fold",
      "Accessible contrast",
    ],
    uiPatterns: ["Service columns", "Proof strip", "Contact band"],
    borderRadius: "0.5rem",
    shadowStyle: "light card shadow",
  },
  minimal: {
    preset: "minimal",
    style: "Minimal clean",
    colors: {
      primary: "#111827",
      secondary: "#6B7280",
      accent: "#111827",
      neutral: "#9CA3AF",
      surface: "#F9FAFB",
      background: "#FFFFFF",
      foreground: "#111827",
    },
    typography: {
      headingFont: "Geist",
      bodyFont: "Geist",
      scale: ["text-4xl", "text-xl", "text-base", "text-sm"],
      notes: "Single-family minimal system",
    },
    spacing: {
      unit: "4px",
      scale: ["4", "8", "16", "24", "40", "64"],
      sectionGap: "7rem",
      containerMax: "64rem",
      notes: "Sparse, intentional whitespace",
    },
    uiStyle: {
      density: "airy",
      corners: "sharp",
      elevation: "flat",
      contrast: "high",
      notes: "Quiet UI, content-first",
    },
    componentStyle: {
      buttons: "Black text buttons / thin outlines",
      cards: "Borderless content blocks",
      inputs: "Underline or hairline inputs",
      navigation: "Sparse wordmark nav",
      palette: ["Hero", "Work", "Process", "About", "Contact"],
    },
    animationStyle: {
      motion: "subtle",
      easing: "linear",
      duration: "300ms",
      entrances: ["fade"],
      notes: "Almost still — motion only for clarity",
    },
    layoutRules: ["Max whitespace", "Few components", "Strong type hierarchy"],
    uiPatterns: ["Large type hero", "Single-column content", "Quiet footer"],
    borderRadius: "0.25rem",
    shadowStyle: "none",
  },
  creative: {
    preset: "creative",
    style: "Creative expressive",
    colors: {
      primary: "#F43F5E",
      secondary: "#0F172A",
      accent: "#A78BFA",
      neutral: "#94A3B8",
      surface: "#FFF1F2",
      background: "#FFFBF7",
      foreground: "#0F172A",
    },
    typography: {
      headingFont: "Clash Display",
      bodyFont: "Satoshi",
      scale: ["text-5xl", "text-3xl", "text-xl", "text-base"],
      notes: "Expressive display + friendly body",
    },
    spacing: {
      unit: "4px",
      scale: ["4", "8", "14", "22", "36", "56"],
      sectionGap: "5.5rem",
      containerMax: "74rem",
      notes: "Asymmetric but readable rhythm",
    },
    uiStyle: {
      density: "balanced",
      corners: "pill",
      elevation: "elevated",
      contrast: "high",
      notes: "Playful studio / agency energy",
    },
    componentStyle: {
      buttons: "Bold pill CTAs with accent hover",
      cards: "Tilted/offset portfolio cards",
      inputs: "Soft rounded fields with accent focus",
      navigation: "Creative sticky with work CTA",
      palette: ["Hero", "Work", "Services", "Process", "Contact"],
    },
    animationStyle: {
      motion: "expressive",
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      duration: "500ms",
      entrances: ["fade-up", "scale-in", "stagger"],
      notes: "Personality-forward motion without chaos",
    },
    layoutRules: [
      "Asymmetric hero compositions",
      "Portfolio-forward sections",
      "Strong accent moments",
    ],
    uiPatterns: ["Offset gallery", "Marquee proof", "Bold CTA band"],
    borderRadius: "1.25rem",
    shadowStyle: "colorful soft elevation",
  },
};

export const DESIGN_PRESET_IDS = Object.keys(DESIGN_PRESETS) as DesignPresetId[];

export function getDesignPreset(id: DesignPresetId): PresetBase {
  return DESIGN_PRESETS[id];
}

export function normalizeDesignPreset(value: unknown): DesignPresetId {
  const v = String(value ?? "")
    .toLowerCase()
    .trim();
  if (v === "luxury" || v === "modern" || v === "corporate" || v === "minimal" || v === "creative") {
    return v;
  }
  if (/luxury|premium|gold|editorial/.test(v)) return "luxury";
  if (/corporate|enterprise|trust|professional/.test(v)) return "corporate";
  if (/minimal|clean|sparse/.test(v)) return "minimal";
  if (/creative|agency|studio|bold|playful|expressive/.test(v)) return "creative";
  return "modern";
}
