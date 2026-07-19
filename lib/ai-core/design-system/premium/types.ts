import type { DesignPresetId } from "@/lib/ai-core/design-system/types";

/** Public premium style names (Technology/Futuristic → engine `tech`). */
export type PremiumStyleId =
  | "luxury"
  | "modern"
  | "minimal"
  | "corporate"
  | "futuristic"
  | "creative"
  | "technology"
  | "saas"
  | "premium-brand";

export type PremiumTypographySystem = {
  displayFont: string;
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  weights: { display: number; heading: number; body: number; medium: number };
  lineHeights: { display: string; heading: string; body: string };
  tracking: { display: string; heading: string; body: string };
  scale: {
    display: string;
    h1: string;
    h2: string;
    h3: string;
    body: string;
    small: string;
  };
  notes: string;
};

export type PremiumColorHarmony = {
  mode: "complementary" | "analogous" | "triadic" | "split" | "mono";
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  surface: string;
  background: string;
  foreground: string;
  muted: string;
  success: string;
  warning: string;
  danger: string;
  onPrimary: string;
  harmonyNotes: string;
};

export type PremiumSpacingSystem = {
  unit: string;
  scale: Record<"xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl", string>;
  sectionY: string;
  sectionYMobile: string;
  containerMax: string;
  gutter: string;
  stack: string;
  notes: string;
};

export type PremiumRadiusScale = {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
  default: string;
};

export type PremiumShadowScale = {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  glow: string;
  default: string;
  notes: string;
};

export type PremiumGradientSystem = {
  hero: string;
  cta: string;
  surface: string;
  accent: string;
  mesh?: string;
  notes: string;
};

export type PremiumGlassSystem = {
  enabled: boolean;
  background: string;
  border: string;
  blur: string;
  saturate: string;
  notes: string;
};

export type PremiumAnimationPresets = {
  motion: "none" | "subtle" | "expressive";
  easing: string;
  durationFast: string;
  duration: string;
  durationSlow: string;
  entrances: string[];
  hover: string;
  pageTransition: string;
  notes: string;
};

export type PremiumResponsiveRules = {
  breakpoints: { sm: string; md: string; lg: string; xl: string };
  containerPadding: { mobile: string; tablet: string; desktop: string };
  typographyScale: { mobile: string; desktop: string };
  gridColumns: { mobile: number; tablet: number; desktop: number };
  heroMinHeight: { mobile: string; desktop: string };
  rules: string[];
};

export type PremiumLayoutIntelligence = {
  heroStyle: string;
  sectionLayout: string;
  cardStyle: string;
  navigationStyle: string;
  footerStyle: string;
  ctaStyle: string;
  density: "airy" | "balanced" | "compact";
  rules: string[];
};

/** Complete premium visual identity package. */
export type PremiumDesignSystem = {
  styleId: PremiumStyleId;
  /** Maps to existing DesignPresetId (`futuristic` → `tech`). */
  enginePreset: DesignPresetId;
  label: string;
  typography: PremiumTypographySystem;
  colors: PremiumColorHarmony;
  spacing: PremiumSpacingSystem;
  radius: PremiumRadiusScale;
  shadows: PremiumShadowScale;
  gradients: PremiumGradientSystem;
  glass: PremiumGlassSystem;
  animation: PremiumAnimationPresets;
  responsive: PremiumResponsiveRules;
  layout: PremiumLayoutIntelligence;
  brandSummary: string;
};

export type BuildPremiumDesignInput = {
  preferredStyle?: string;
  industryId?: string;
  industryLabel?: string;
  designStyle?: string;
  brandTone?: string;
  layoutStyle?: string;
  /** From AI Layout Selection Engine. */
  layoutVariationId?: string;
  heroTreatment?: string;
  sectionLayout?: string;
  seedPrimary?: string;
  seedSecondary?: string;
  seedAccent?: string;
};
