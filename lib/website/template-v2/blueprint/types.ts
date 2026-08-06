import type {
  AccessibilityLevel,
  BrandPersonality,
  BusinessModel,
  BusinessSize,
  ContentDensity,
  DevicePriority,
  ImageAvailability,
  LanguageDirection,
  PremiumLevel,
  TargetAudience,
  VariantDecisionPlan,
  VisualStyle,
  WebsiteGoal,
} from "@/lib/website/template-v2/variants/decision/types";
import type { SectionKind, VariantComposition } from "@/lib/website/template-v2/variants/types";

/** Input for blueprint generation — extends decision context with blueprint-specific fields. */
export type BlueprintInput = {
  industry?: string;
  businessSubtype?: string;
  brandPersonality?: BrandPersonality;
  businessSize?: BusinessSize;
  targetAudience?: TargetAudience;
  websiteGoal?: WebsiteGoal;
  languageDirection?: LanguageDirection;
  contentDensity?: ContentDensity;
  imageAvailability?: ImageAvailability;
  businessModel?: BusinessModel;
  premiumLevel?: PremiumLevel;
  visualStyle?: VisualStyle;
  devicePriority?: DevicePriority;
  accessibilityLevel?: AccessibilityLevel;
  /** Stable seed for deterministic output (e.g. project id). */
  seed?: string;
  /** Optional explicit section order override. */
  sectionOrder?: SectionKind[];
  /** Optional blueprint id override. */
  blueprintId?: string;
};

export type BlueprintColorRole =
  | "primary"
  | "secondary"
  | "accent"
  | "background"
  | "foreground"
  | "muted"
  | "surface"
  | "signal";

export type BlueprintColorPalette = {
  presetId: string;
  colors: Record<BlueprintColorRole, string>;
  contrast: "standard" | "high";
  mode: "light" | "dark" | "mixed";
};

export type BlueprintTypographyScale = "compact" | "balanced" | "expressive";

export type BlueprintTypographyProfile = {
  presetId: string;
  display: string;
  body: string;
  scale: BlueprintTypographyScale;
  rtlDisplay?: string;
  rtlBody?: string;
  headingWeight: 400 | 500 | 600 | 700;
  bodyWeight: 400 | 500;
  letterSpacing: "tight" | "normal" | "wide";
};

export type BlueprintSectionVariant = {
  sectionKind: SectionKind;
  variantId: string;
  composition: VariantComposition;
  score: number;
  density: ContentDensity;
};

export type BlueprintContainerWidths = {
  narrow: string;
  default: string;
  wide: string;
  fullBleed: boolean;
};

export type BlueprintGridStrategy = {
  columns: 12 | 16;
  gutter: "tight" | "standard" | "relaxed";
  alignment: "start" | "center" | "stretch";
  rhythm: "dense" | "balanced" | "airy";
};

export type BlueprintHeroLayout =
  | "split"
  | "stacked"
  | "full-bleed"
  | "asymmetric"
  | "centered";

export type BlueprintHeroComposition = {
  variantId: string;
  composition: VariantComposition;
  layout: BlueprintHeroLayout;
  mediaPosition: "left" | "right" | "background" | "none";
  ctaPlacement: "inline" | "below" | "floating";
  minHeight: "viewport" | "content" | "compact";
};

export type BlueprintCtaStrategy = {
  variantId: string;
  placement: "mid-page" | "pre-footer" | "inline-section";
  frequency: "single" | "dual";
  emphasis: "subtle" | "standard" | "bold";
  conversionGoal: WebsiteGoal;
};

export type BlueprintImageStrategy = {
  availability: ImageAvailability;
  heroTreatment: "full-bleed" | "contained" | "typography-only" | "icon-only";
  sectionImagery: "rich" | "selective" | "minimal" | "none";
  stockPreference: "photography" | "illustration" | "abstract" | "mixed";
  lazyLoadBelowFold: boolean;
};

export type BlueprintMotionIntensity = "none" | "subtle" | "moderate" | "expressive";

export type BlueprintMotionStrategy = {
  preset: string;
  intensity: BlueprintMotionIntensity;
  reducedMotionFallback: "instant" | "fade";
  heroEntrance: string;
  sectionEntrance: string;
  microInteractions: boolean;
  parallax: boolean;
};

export type BlueprintNavigationStyle = {
  layout: "top-bar" | "centered-logo" | "split-nav" | "transparent-overlay";
  sticky: boolean;
  mobilePattern: "hamburger" | "bottom-bar" | "drawer";
  density: "compact" | "standard" | "spacious";
};

export type BlueprintFooterStyle = {
  variantId: string;
  layout: "columns" | "centered" | "mega" | "inline";
  newsletter: boolean;
  socialLinks: boolean;
  legalLinks: boolean;
};

export type BlueprintBreakpointStrategy = {
  name: string;
  minWidth: number;
};

export type BlueprintResponsiveStrategy = {
  devicePriority: DevicePriority;
  breakpoints: BlueprintBreakpointStrategy[];
  containerMaxWidth: string;
  mobileNav: boolean;
  stackOrder: "content-first" | "visual-first";
  imageScaling: "cover" | "contain" | "responsive";
};

export type BlueprintAccessibilityProfile = {
  level: AccessibilityLevel;
  focusVisible: boolean;
  skipLink: boolean;
  ariaLandmarks: boolean;
  colorContrastMinimum: "AA" | "AAA";
  motionSafe: boolean;
  rtlSupport: boolean;
};

export type BlueprintSeoProfile = {
  primaryGoal: WebsiteGoal;
  schemaTypes: string[];
  openGraph: boolean;
  structuredData: boolean;
  headingHierarchy: "strict" | "flexible";
  metaDescriptionTone: "conversion" | "informational" | "brand";
};

export type WebsiteBlueprintMeta = {
  version: string;
  blueprintId: string;
  generatedAt: string;
  seed?: string;
  decisionEngineVersion: string;
};

/**
 * Complete website blueprint — single source of truth for future rendering.
 * Does not contain HTML or React; describes the visual experience only.
 */
export type WebsiteBlueprint = {
  meta: WebsiteBlueprintMeta;

  industry: string;
  businessSubtype: string;
  brandPersonality: BrandPersonality;
  websiteGoal: WebsiteGoal;
  visualStyle: VisualStyle;
  premiumLevel: PremiumLevel;

  colorPalette: BlueprintColorPalette;
  typographyProfile: BlueprintTypographyProfile;

  sectionOrder: SectionKind[];
  sectionVariants: BlueprintSectionVariant[];
  sectionDensity: Partial<Record<SectionKind, ContentDensity>>;

  containerWidths: BlueprintContainerWidths;
  gridStrategy: BlueprintGridStrategy;

  heroComposition: BlueprintHeroComposition;
  ctaStrategy: BlueprintCtaStrategy;
  imageStrategy: BlueprintImageStrategy;
  motionStrategy: BlueprintMotionStrategy;
  navigationStyle: BlueprintNavigationStyle;
  footerStyle: BlueprintFooterStyle;
  responsiveStrategy: BlueprintResponsiveStrategy;
  accessibilityProfile: BlueprintAccessibilityProfile;
  seoProfile: BlueprintSeoProfile;

  /** Internal decision trace — produced by the Decision Engine. */
  decisionPlan: VariantDecisionPlan;
};

export type BlueprintValidation = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};
