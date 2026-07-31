/**
 * Phase 3 premium visual token refinements per structure-template TI profile.
 * Deepens contrast, spacing rhythm, and motion without changing template IDs.
 */
import type { TemplateIntelligenceDefinition } from "@/lib/ai-core/template-intelligence/types";

type ColorPatch = Partial<TemplateIntelligenceDefinition["colors"]>;
type TypographyPatch = Partial<TemplateIntelligenceDefinition["typography"]>;

type PremiumVisualPatch = {
  colors?: ColorPatch;
  typography?: TypographyPatch;
  designStyle?: string;
  designPreset?: TemplateIntelligenceDefinition["designPreset"];
};

const PREMIUM_VISUAL_PATCHES: Record<string, PremiumVisualPatch> = {
  "ti-corporate-trust": {
    colors: { surface: "#F4F7FB", accent: "#1D4ED8" },
    designStyle: "Executive trust",
  },
  "ti-consulting-clarity": {
    colors: { primary: "#0B1220", accent: "#6366F1", surface: "#F8FAFC" },
    typography: { display: "Sora", heading: "Sora", body: "Inter" },
  },
  "ti-saas-growth": {
    colors: { primary: "#312E81", accent: "#4F46E5", background: "#FAFAFF" },
    designStyle: "Product-led velocity",
  },
  "ti-ai-company-signal": {
    colors: {
      primary: "#020617",
      accent: "#22D3EE",
      background: "#030712",
      surface: "#0F172A",
    },
    designStyle: "Signal-grade AI",
  },
  "ti-creative-studio": {
    colors: { accent: "#E11D48", background: "#FAFAFA" },
    designStyle: "Award-winning studio",
  },
  "ti-agency-portfolio": {
    colors: { primary: "#0A0A0A", accent: "#F43F5E" },
    designStyle: "Performance agency",
  },
  "ti-blog-editorial": {
    colors: { accent: "#E11D48", background: "#FAFAFA" },
    typography: { display: "Fraunces", heading: "Fraunces", body: "Inter" },
  },
  "ti-restaurant-dining": {
    colors: { accent: "#D6A45B", background: "#0C0A09", surface: "#1C1917" },
    designStyle: "Michelin atmosphere",
  },
  "ti-cafe-artisan": {
    colors: { accent: "#C4A574", background: "#FBF7F2" },
    designStyle: "Artisan morning",
  },
  "ti-hotel-sanctuary": {
    colors: { accent: "#C9A962", background: "#0F0E0D", surface: "#1F1D1B" },
    designStyle: "Five-star sanctuary",
  },
  "ti-travel-horizon": {
    colors: { accent: "#F59E0B", background: "#ECFEFF" },
    designStyle: "Destination cinematic",
  },
  "ti-real-estate-listings": {
    colors: { accent: "#0F766E", surface: "#FFFFFF" },
    designStyle: "Premium property",
  },
  "ti-architecture-monograph": {
    colors: { accent: "#B8A88A", background: "#F4F2EE" },
    typography: {
      display: "Instrument Serif",
      heading: "Instrument Serif",
      body: "Inter",
    },
  },
  "ti-construction-industrial": {
    colors: { accent: "#F59E0B", primary: "#1A2332" },
    designStyle: "Industrial authority",
  },
  "ti-medical-care": {
    colors: { accent: "#14B8A6", surface: "#F0F9FF" },
    designStyle: "Clinical excellence",
  },
  "ti-dental-smile": {
    colors: { accent: "#14B8A6", surface: "#F0FDFA" },
    designStyle: "Smile-forward care",
  },
  "ti-pharmacy-wellness": {
    colors: { accent: "#34D399", background: "#F0FDF4" },
    designStyle: "Wellness clarity",
  },
  "ti-law-firm": {
    colors: { accent: "#C9A962", background: "#020617", surface: "#0F172A" },
    designStyle: "Legal gravitas",
  },
  "ti-finance-ledger": {
    colors: { accent: "#0F766E", primary: "#1E3A5F" },
    designStyle: "Institutional finance",
  },
  "ti-insurance-shield": {
    colors: { accent: "#60A5FA", primary: "#1B4F8A" },
    designStyle: "Assured protection",
  },
  "ti-education-campus": {
    colors: { accent: "#F59E0B", primary: "#1D4ED8" },
    designStyle: "Campus forward",
  },
  "ti-university-heritage": {
    colors: { accent: "#D97706", background: "#FFFBEB" },
    typography: {
      display: "Libre Baskerville",
      heading: "Libre Baskerville",
      body: "Source Sans 3",
    },
  },
  "ti-ecommerce-atelier": {
    colors: { primary: "#141414", accent: "#A3A3A3" },
    designStyle: "Editorial commerce",
  },
  "ti-luxury-brands-atelier": {
    colors: { accent: "#DC2626", background: "#0A0A0A", surface: "#171717" },
    designStyle: "Haute couture",
  },
  "ti-beauty-glow": {
    colors: { accent: "#F0ABFC", background: "#FDF4FF" },
    designStyle: "Luminous spa",
  },
  "ti-fitness-pulse": {
    colors: { accent: "#FACC15", background: "#0A0A0A", surface: "#171717" },
    designStyle: "Athletic momentum",
  },
  "ti-automotive-showroom": {
    colors: { accent: "#DC2626", background: "#0A0A0A", surface: "#171717" },
    designStyle: "Showroom stage",
  },
  "ti-logistics-freight": {
    colors: { accent: "#38BDF8", primary: "#0F4C81" },
    designStyle: "Freight operations",
  },
  "ti-manufacturing-precision": {
    colors: { accent: "#0EA5E9", primary: "#334155" },
    designStyle: "Precision engineering",
  },
  "ti-nonprofit-impact": {
    colors: { accent: "#F59E0B", background: "#FFFBEB" },
    designStyle: "Humanitarian warmth",
  },
};

/** Apply Phase 3 premium visual refinements to a catalog template entry. */
export function enhancePremiumTemplateVisuals(
  template: TemplateIntelligenceDefinition,
): TemplateIntelligenceDefinition {
  const patch = PREMIUM_VISUAL_PATCHES[template.id];
  if (!patch) return template;

  return {
    ...template,
    designStyle: patch.designStyle ?? template.designStyle,
    designPreset: patch.designPreset ?? template.designPreset,
    colors: { ...template.colors, ...patch.colors },
    typography: { ...template.typography, ...patch.typography },
  };
}
