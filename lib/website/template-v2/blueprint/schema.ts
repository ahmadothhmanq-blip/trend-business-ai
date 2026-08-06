import { z } from "zod";

const brandPersonalitySchema = z.enum([
  "professional",
  "bold",
  "warm",
  "luxury",
  "playful",
  "minimal",
  "technical",
]);

const websiteGoalSchema = z.enum([
  "lead-generation",
  "sales",
  "booking",
  "portfolio",
  "saas",
  "brand-awareness",
  "ecommerce",
  "trust",
]);

const visualStyleSchema = z.enum([
  "minimal",
  "editorial",
  "cinematic",
  "corporate",
  "modern",
  "luxury",
  "bold",
]);

const premiumLevelSchema = z.enum(["standard", "premium", "luxury"]);
const contentDensitySchema = z.enum(["sparse", "medium", "dense"]);
const sectionKindSchema = z.enum([
  "hero",
  "features",
  "about",
  "services",
  "portfolio",
  "pricing",
  "testimonials",
  "cta",
  "contact",
  "footer",
]);

export const blueprintInputSchema = z.object({
  industry: z.string().optional(),
  businessSubtype: z.string().optional(),
  brandPersonality: brandPersonalitySchema.optional(),
  businessSize: z.enum(["solo", "small", "medium", "enterprise"]).optional(),
  targetAudience: z
    .enum(["b2b", "b2c", "enterprise", "luxury", "startup", "consumer"])
    .optional(),
  websiteGoal: websiteGoalSchema.optional(),
  languageDirection: z.enum(["ltr", "rtl"]).optional(),
  contentDensity: contentDensitySchema.optional(),
  imageAvailability: z
    .enum(["none", "limited", "moderate", "rich"])
    .optional(),
  businessModel: z.enum(["product", "service", "hybrid"]).optional(),
  premiumLevel: premiumLevelSchema.optional(),
  visualStyle: visualStyleSchema.optional(),
  devicePriority: z
    .enum(["mobile-first", "balanced", "desktop-first"])
    .optional(),
  accessibilityLevel: z.enum(["standard", "enhanced", "strict"]).optional(),
  seed: z.string().optional(),
  sectionOrder: z.array(sectionKindSchema).optional(),
  blueprintId: z.string().optional(),
});

const colorPaletteSchema = z.object({
  presetId: z.string(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    foreground: z.string(),
    muted: z.string(),
    surface: z.string(),
    signal: z.string(),
  }),
  contrast: z.enum(["standard", "high"]),
  mode: z.enum(["light", "dark", "mixed"]),
});

const typographyProfileSchema = z.object({
  presetId: z.string(),
  display: z.string(),
  body: z.string(),
  scale: z.enum(["compact", "balanced", "expressive"]),
  rtlDisplay: z.string().optional(),
  rtlBody: z.string().optional(),
  headingWeight: z.union([
    z.literal(400),
    z.literal(500),
    z.literal(600),
    z.literal(700),
  ]),
  bodyWeight: z.union([z.literal(400), z.literal(500)]),
  letterSpacing: z.enum(["tight", "normal", "wide"]),
});

const sectionVariantSchema = z.object({
  sectionKind: sectionKindSchema,
  variantId: z.string(),
  composition: z.string(),
  score: z.number(),
  density: contentDensitySchema,
});

export const websiteBlueprintSchema = z.object({
  meta: z.object({
    version: z.string(),
    blueprintId: z.string(),
    generatedAt: z.string(),
    seed: z.string().optional(),
    decisionEngineVersion: z.string(),
  }),
  industry: z.string(),
  businessSubtype: z.string(),
  brandPersonality: brandPersonalitySchema,
  websiteGoal: websiteGoalSchema,
  visualStyle: visualStyleSchema,
  premiumLevel: premiumLevelSchema,
  colorPalette: colorPaletteSchema,
  typographyProfile: typographyProfileSchema,
  sectionOrder: z.array(sectionKindSchema).min(3),
  sectionVariants: z.array(sectionVariantSchema).min(1),
  sectionDensity: z.partialRecord(sectionKindSchema, contentDensitySchema),
  containerWidths: z.object({
    narrow: z.string(),
    default: z.string(),
    wide: z.string(),
    fullBleed: z.boolean(),
  }),
  gridStrategy: z.object({
    columns: z.union([z.literal(12), z.literal(16)]),
    gutter: z.enum(["tight", "standard", "relaxed"]),
    alignment: z.enum(["start", "center", "stretch"]),
    rhythm: z.enum(["dense", "balanced", "airy"]),
  }),
  heroComposition: z.object({
    variantId: z.string(),
    composition: z.string(),
    layout: z.enum(["split", "stacked", "full-bleed", "asymmetric", "centered"]),
    mediaPosition: z.enum(["left", "right", "background", "none"]),
    ctaPlacement: z.enum(["inline", "below", "floating"]),
    minHeight: z.enum(["viewport", "content", "compact"]),
  }),
  ctaStrategy: z.object({
    variantId: z.string(),
    placement: z.enum(["mid-page", "pre-footer", "inline-section"]),
    frequency: z.enum(["single", "dual"]),
    emphasis: z.enum(["subtle", "standard", "bold"]),
    conversionGoal: websiteGoalSchema,
  }),
  imageStrategy: z.object({
    availability: z.enum(["none", "limited", "moderate", "rich"]),
    heroTreatment: z.enum([
      "full-bleed",
      "contained",
      "typography-only",
      "icon-only",
    ]),
    sectionImagery: z.enum(["rich", "selective", "minimal", "none"]),
    stockPreference: z.enum([
      "photography",
      "illustration",
      "abstract",
      "mixed",
    ]),
    lazyLoadBelowFold: z.boolean(),
  }),
  motionStrategy: z.object({
    preset: z.string(),
    intensity: z.enum(["none", "subtle", "moderate", "expressive"]),
    reducedMotionFallback: z.enum(["instant", "fade"]),
    heroEntrance: z.string(),
    sectionEntrance: z.string(),
    microInteractions: z.boolean(),
    parallax: z.boolean(),
  }),
  navigationStyle: z.object({
    layout: z.enum([
      "top-bar",
      "centered-logo",
      "split-nav",
      "transparent-overlay",
    ]),
    sticky: z.boolean(),
    mobilePattern: z.enum(["hamburger", "bottom-bar", "drawer"]),
    density: z.enum(["compact", "standard", "spacious"]),
  }),
  footerStyle: z.object({
    variantId: z.string(),
    layout: z.enum(["columns", "centered", "mega", "inline"]),
    newsletter: z.boolean(),
    socialLinks: z.boolean(),
    legalLinks: z.boolean(),
  }),
  responsiveStrategy: z.object({
    devicePriority: z.enum(["mobile-first", "balanced", "desktop-first"]),
    breakpoints: z.array(
      z.object({ name: z.string(), minWidth: z.number() }),
    ),
    containerMaxWidth: z.string(),
    mobileNav: z.boolean(),
    stackOrder: z.enum(["content-first", "visual-first"]),
    imageScaling: z.enum(["cover", "contain", "responsive"]),
  }),
  accessibilityProfile: z.object({
    level: z.enum(["standard", "enhanced", "strict"]),
    focusVisible: z.boolean(),
    skipLink: z.boolean(),
    ariaLandmarks: z.boolean(),
    colorContrastMinimum: z.enum(["AA", "AAA"]),
    motionSafe: z.boolean(),
    rtlSupport: z.boolean(),
  }),
  seoProfile: z.object({
    primaryGoal: websiteGoalSchema,
    schemaTypes: z.array(z.string()).min(1),
    openGraph: z.boolean(),
    structuredData: z.boolean(),
    headingHierarchy: z.enum(["strict", "flexible"]),
    metaDescriptionTone: z.enum(["conversion", "informational", "brand"]),
  }),
  decisionPlan: z.object({
    selections: z.record(z.string(), z.unknown()),
    scored: z.record(z.string(), z.array(z.unknown())).optional(),
    diversityApplied: z.boolean(),
    context: z.record(z.string(), z.unknown()),
    engineVersion: z.string(),
  }),
});

export type BlueprintInputSchema = z.infer<typeof blueprintInputSchema>;
export type WebsiteBlueprintSchema = z.infer<typeof websiteBlueprintSchema>;
