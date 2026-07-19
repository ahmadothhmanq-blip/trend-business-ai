/**
 * Brand Presets — starting brand systems for Website Builder.
 */

import type {
  BrandPresetId,
  BrandColorSystem,
  BrandSpacingRules,
  BrandTypographySystem,
  BrandUiStyle,
} from "@/lib/ai-core/brand-identity/types";
import type { PremiumStyleId } from "@/lib/ai-core/design-system/premium/types";
import type { DesignPresetId } from "@/lib/ai-core/design-system/types";

export type BrandPresetPackage = {
  id: BrandPresetId;
  label: string;
  premiumStyleId: PremiumStyleId;
  enginePreset: DesignPresetId;
  personalityDefault: string;
  voiceTone: string;
  visualDirection: string;
  imageDirection: string;
  animationDirection: string;
  componentStyle: string;
  archetype: string;
  colors: Omit<BrandColorSystem, "roles" | "direction"> & {
    direction: string;
  };
  typography: BrandTypographySystem;
  spacing: BrandSpacingRules;
  uiStyle: BrandUiStyle;
  logoStyle: string;
  iconConcept: string;
  symbolism: string[];
};

const PRESETS: Record<BrandPresetId, BrandPresetPackage> = {
  "luxury-brand": {
    id: "luxury-brand",
    label: "Luxury Brand",
    premiumStyleId: "luxury",
    enginePreset: "luxury",
    personalityDefault: "refined",
    voiceTone: "Poised, exclusive, sensorial — short sentences with quiet confidence",
    visualDirection:
      "Cinematic dark or deep neutrals with one precious accent; full-bleed imagery; editorial type",
    imageDirection:
      "Cinematic photography, shallow depth of field, material close-ups, golden-hour or studio noir",
    animationDirection: "Slow-reveal cinematic entrances, restrained hover lift",
    componentStyle: "Glass-bordered luxury surfaces · minimal logo-led nav · ink/gold CTAs",
    archetype: "The Ruler / The Creator",
    colors: {
      primary: "#1A1410",
      secondary: "#8B7355",
      accent: "#C9A227",
      neutral: "#6B635A",
      surface: "#14100E",
      background: "#0C0A09",
      foreground: "#F5F0E8",
      onPrimary: "#F5F0E8",
      direction: "Deep noir base with metallic gold accent — never loud brights",
    },
    typography: {
      displayFont: "Playfair Display",
      headingFont: "Playfair Display",
      bodyFont: "Source Sans 3",
      monoFont: "IBM Plex Mono",
      pairing: "Playfair Display + Source Sans 3",
      scaleNotes: "Expressive display serif with refined humanist body",
      direction: "Luxury editorial hierarchy — large display, calm body",
    },
    spacing: {
      sectionY: "7rem",
      sectionYMobile: "4.25rem",
      containerMax: "72rem",
      stack: "1.5rem",
      density: "airy",
      notes: "Museum-like breathing room; never cramped",
    },
    uiStyle: {
      density: "airy",
      corners: "soft",
      elevation: "soft",
      contrast: "high",
      buttons: "Solid primary with hairline secondary outline",
      cards: "Borderless editorial or subtle glass",
      navigation: "Transparent overlay → solid on scroll",
      notes: "Quiet luxury UI — fewer elements, stronger hierarchy",
    },
    logoStyle: "Wordmark-led with optional monogram mark",
    iconConcept: "Abstract monogram or refined geometric seal",
    symbolism: ["craft", "heritage", "exclusivity", "permanence"],
  },
  "technology-brand": {
    id: "technology-brand",
    label: "Technology Brand",
    premiumStyleId: "technology",
    enginePreset: "tech",
    personalityDefault: "innovative",
    voiceTone: "Precise, forward-looking, clear — technical without jargon overload",
    visualDirection:
      "Dark technical surfaces, luminous accents, product frames, geometric clarity",
    imageDirection:
      "Abstract light, hardware close-ups, UI-in-context, precise product photography",
    animationDirection: "Crisp stagger, glow-in accents, product-scale reveals",
    componentStyle: "Dark glass cards · compact sticky nav · luminous CTA pills",
    archetype: "The Magician / The Sage",
    colors: {
      primary: "#6366F1",
      secondary: "#22D3EE",
      accent: "#A78BFA",
      neutral: "#94A3B8",
      surface: "#111827",
      background: "#030712",
      foreground: "#F8FAFC",
      onPrimary: "#FFFFFF",
      direction: "Dark tech canvas with indigo/cyan luminous accents",
    },
    typography: {
      displayFont: "Space Grotesk",
      headingFont: "Space Grotesk",
      bodyFont: "IBM Plex Sans",
      monoFont: "IBM Plex Mono",
      pairing: "Space Grotesk + IBM Plex Sans",
      scaleNotes: "Geometric product display with highly readable body",
      direction: "Tech-forward type — tight tracking on display",
    },
    spacing: {
      sectionY: "6rem",
      sectionYMobile: "3.75rem",
      containerMax: "72rem",
      stack: "1.25rem",
      density: "balanced",
      notes: "Product-marketing density — breathable but information-rich",
    },
    uiStyle: {
      density: "balanced",
      corners: "soft",
      elevation: "elevated",
      contrast: "high",
      buttons: "Gradient or solid glow CTA + ghost secondary",
      cards: "Dark glass with subtle border glow",
      navigation: "Compact sticky with product CTA",
      notes: "Platform UI language — sharp, luminous, purposeful",
    },
    logoStyle: "Geometric wordmark + abstract tech mark",
    iconConcept: "Node, circuit, or signal-inspired abstract mark",
    symbolism: ["precision", "progress", "intelligence", "connectivity"],
  },
  "corporate-brand": {
    id: "corporate-brand",
    label: "Corporate Brand",
    premiumStyleId: "corporate",
    enginePreset: "corporate",
    personalityDefault: "trustworthy",
    voiceTone: "Confident, clear, professional — reassure without sounding cold",
    visualDirection:
      "Trust-forward blues and neutrals, symmetric layouts, crisp metrics, clean photography",
    imageDirection:
      "Confident professionals, refined offices, natural light, trustworthy clarity",
    animationDirection: "Subtle fade-up metrics, crisp transitions",
    componentStyle: "Elevated trust cards · corporate topbar · solid advisory CTAs",
    archetype: "The Caregiver / The Ruler",
    colors: {
      primary: "#1E3A5F",
      secondary: "#3B82F6",
      accent: "#0EA5E9",
      neutral: "#64748B",
      surface: "#F1F5F9",
      background: "#FFFFFF",
      foreground: "#0F172A",
      onPrimary: "#FFFFFF",
      direction: "Navy trust primary with sky accent — institutional clarity",
    },
    typography: {
      displayFont: "IBM Plex Sans",
      headingFont: "IBM Plex Sans",
      bodyFont: "IBM Plex Sans",
      monoFont: "IBM Plex Mono",
      pairing: "IBM Plex Sans family",
      scaleNotes: "Unified sans system for enterprise clarity",
      direction: "Corporate clarity — confident scale, readable body",
    },
    spacing: {
      sectionY: "5.5rem",
      sectionYMobile: "3.5rem",
      containerMax: "72rem",
      stack: "1.25rem",
      density: "balanced",
      notes: "Structured spacing — scannable and trustworthy",
    },
    uiStyle: {
      density: "balanced",
      corners: "soft",
      elevation: "soft",
      contrast: "medium",
      buttons: "Solid primary, outlined secondary",
      cards: "Elevated trust surfaces with clear borders",
      navigation: "Corporate sticky topbar with CTA",
      notes: "Enterprise polish — clarity over decoration",
    },
    logoStyle: "Wordmark with restrained emblem",
    iconConcept: "Shield, column, or abstract trust mark",
    symbolism: ["stability", "expertise", "integrity", "clarity"],
  },
  "creative-brand": {
    id: "creative-brand",
    label: "Creative Brand",
    premiumStyleId: "creative",
    enginePreset: "creative",
    personalityDefault: "bold",
    voiceTone: "Expressive, witty, distinctive — own a point of view",
    visualDirection:
      "Asymmetric compositions, bold type, high-contrast accents, portfolio-led storytelling",
    imageDirection:
      "Studio craft, bold compositions, editorial branding moments, unexpected crops",
    animationDirection: "Asymmetric staggered reveals, expressive but intentional",
    componentStyle: "Bold media surfaces · studio transparent nav · start-project CTAs",
    archetype: "The Creator / The Jester",
    colors: {
      primary: "#111111",
      secondary: "#F43F5E",
      accent: "#FBBF24",
      neutral: "#737373",
      surface: "#FAFAFA",
      background: "#FFFFFF",
      foreground: "#111111",
      onPrimary: "#FFFFFF",
      direction: "Ink black with hot accent — studio energy without chaos",
    },
    typography: {
      displayFont: "Syne",
      headingFont: "Syne",
      bodyFont: "DM Sans",
      monoFont: "IBM Plex Mono",
      pairing: "Syne + DM Sans",
      scaleNotes: "Characterful display with disciplined body",
      direction: "Creative display energy with readable body restraint",
    },
    spacing: {
      sectionY: "6.5rem",
      sectionYMobile: "4rem",
      containerMax: "74rem",
      stack: "1.35rem",
      density: "airy",
      notes: "Editorial breathing room for portfolio moments",
    },
    uiStyle: {
      density: "airy",
      corners: "sharp",
      elevation: "flat",
      contrast: "high",
      buttons: "Solid ink or accent slab CTAs",
      cards: "Bold media-first, minimal chrome",
      navigation: "Studio transparent / logo-led",
      notes: "Agency composition — type and image do the work",
    },
    logoStyle: "Custom wordmark or expressive lettermark",
    iconConcept: "Abstract mark from craft tool, frame, or signature stroke",
    symbolism: ["originality", "craft", "voice", "impact"],
  },
  "minimal-brand": {
    id: "minimal-brand",
    label: "Minimal Brand",
    premiumStyleId: "minimal",
    enginePreset: "minimal",
    personalityDefault: "calm",
    voiceTone: "Quiet, precise, essential — say less, mean more",
    visualDirection:
      "Near-monochrome, generous whitespace, centered quiet heroes, hairline rules",
    imageDirection:
      "Spare compositions, natural light, negative space, restrained color grade",
    animationDirection: "Barely-there fade-up, no decorative motion",
    componentStyle: "Border-only cards · hairline minimal nav · quiet ink CTAs",
    archetype: "The Sage / The Innocent",
    colors: {
      primary: "#171717",
      secondary: "#525252",
      accent: "#0A0A0A",
      neutral: "#A3A3A3",
      surface: "#FAFAFA",
      background: "#FFFFFF",
      foreground: "#171717",
      onPrimary: "#FFFFFF",
      direction: "Near-monochrome with a single decisive accent (ink)",
    },
    typography: {
      displayFont: "Instrument Sans",
      headingFont: "Instrument Sans",
      bodyFont: "Instrument Sans",
      monoFont: "IBM Plex Mono",
      pairing: "Instrument Sans family",
      scaleNotes: "Unified quiet sans — hierarchy via weight and size only",
      direction: "Minimal type — clarity through restraint",
    },
    spacing: {
      sectionY: "8rem",
      sectionYMobile: "4.5rem",
      containerMax: "68rem",
      stack: "1.75rem",
      density: "airy",
      notes: "Radical whitespace — every element earns its place",
    },
    uiStyle: {
      density: "airy",
      corners: "sharp",
      elevation: "flat",
      contrast: "subtle",
      buttons: "Solid ink, ghost secondary",
      cards: "Border-only or none",
      navigation: "Hairline minimal logo-led",
      notes: "Swiss-adjacent calm — no chrome for chrome's sake",
    },
    logoStyle: "Ultra-clean wordmark",
    iconConcept: "Single geometric letterform or line mark",
    symbolism: ["clarity", "focus", "essence", "calm"],
  },
  "premium-saas-brand": {
    id: "premium-saas-brand",
    label: "Premium SaaS Brand",
    premiumStyleId: "saas",
    enginePreset: "tech",
    personalityDefault: "innovative",
    voiceTone: "Helpful, confident, product-led — benefit-first without hype",
    visualDirection:
      "Bright product surfaces, UI frames, bento capabilities, trial-ready CTAs",
    imageDirection:
      "Product UI in context, clean desks, soft product lighting, lifestyle-work hybrids",
    animationDirection: "Product stagger + soft glow-in, purposeful micro-interactions",
    componentStyle: "Elevated soft cards · sticky product CTA nav · trial/demo pair",
    archetype: "The Creator / The Hero",
    colors: {
      primary: "#4F46E5",
      secondary: "#818CF8",
      accent: "#06B6D4",
      neutral: "#64748B",
      surface: "#F8FAFC",
      background: "#FFFFFF",
      foreground: "#0F172A",
      onPrimary: "#FFFFFF",
      direction: "Bright product indigo with cyan accent — PLG clarity",
    },
    typography: {
      displayFont: "Sora",
      headingFont: "Sora",
      bodyFont: "Inter",
      monoFont: "IBM Plex Mono",
      pairing: "Sora + Inter",
      scaleNotes: "Geometric product display + highly readable body",
      direction: "SaaS product marketing type — scannable and friendly",
    },
    spacing: {
      sectionY: "5.75rem",
      sectionYMobile: "3.5rem",
      containerMax: "72rem",
      stack: "1.2rem",
      density: "balanced",
      notes: "Product-marketing density — features breathe, CTAs stay close",
    },
    uiStyle: {
      density: "balanced",
      corners: "soft",
      elevation: "elevated",
      contrast: "medium",
      buttons: "Solid primary + outlined demo secondary",
      cards: "Elevated soft with subtle shadow",
      navigation: "Sticky product CTA bar",
      notes: "Premium PLG UI — conversion-aware without looking cheap",
    },
    logoStyle: "Friendly geometric wordmark + app icon mark",
    iconConcept: "Simplified app glyph or abstract productivity mark",
    symbolism: ["velocity", "clarity", "growth", "reliability"],
  },
};

export const BRAND_PRESET_IDS = Object.keys(PRESETS) as BrandPresetId[];

export function getBrandPreset(id: BrandPresetId): BrandPresetPackage {
  return PRESETS[id];
}

export function listBrandPresets(): BrandPresetPackage[] {
  return BRAND_PRESET_IDS.map((id) => PRESETS[id]!);
}

export function normalizeBrandPresetId(value: unknown): BrandPresetId | null {
  const v = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, "-");
  if (v in PRESETS) return v as BrandPresetId;
  if (/luxury|exclusive|resort|fine.?dining/.test(v)) return "luxury-brand";
  if (/tech|ai\b|cyber|hardware|futur/.test(v)) return "technology-brand";
  if (/corporate|enterprise|financ|bank|clinic|trust/.test(v)) {
    return "corporate-brand";
  }
  if (/creative|agency|studio|bold/.test(v)) return "creative-brand";
  if (/minimal|quiet|sparse|scandinavian/.test(v)) return "minimal-brand";
  if (/saas|software|plg|product.?led|subscription/.test(v)) {
    return "premium-saas-brand";
  }
  return null;
}
