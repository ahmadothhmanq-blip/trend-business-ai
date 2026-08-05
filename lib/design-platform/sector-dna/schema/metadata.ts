import { z } from "zod";

export const tbdpSectorIdSchema = z.enum([
  "saas",
  "restaurant",
  "real-estate",
  "medical",
  "creative-studio",
  "hotel-resort",
  "law-firm",
  "finance",
  "education",
  "logistics",
]);

export const tbdpExperienceProfileIdSchema = z.enum([
  "luxury",
  "executive",
  "technical",
  "healthcare",
  "hospitality",
  "editorial",
  "creative",
  "corporate",
  "minimal",
  "playful",
]);

export const tbdpSectorPersonalitySchema = z.object({
  brand: z.string().min(1),
  visual: z.string().min(1),
  emotionalTone: z.string().min(1),
  philosophy: z.string().min(1),
  targetAudience: z.string().min(1),
});

export const tbdpSectorVisualStrategySchema = z.object({
  typographyProfile: z.enum(["latin-ltr", "latin-rtl", "arabic-rtl", "arabic-ltr"]),
  colorStrategy: z.object({
    primaryEmphasis: z.string().min(1),
    accentEmphasis: z.string().min(1),
    surfaceEmphasis: z.string().min(1),
    modePreference: z.enum(["light", "dark", "auto"]),
  }),
  surfaceStrategy: z.enum(["flat", "layered", "elevated", "immersive"]),
  spacingBehavior: z.enum(["compact", "balanced", "generous", "editorial"]),
  gridPreference: z.enum(["dense", "standard", "airy", "asymmetric"]),
  imageDirection: z.string().min(1),
  iconStyle: z.enum(["outline", "filled", "duotone", "minimal"]),
  illustrationStyle: z.string().min(1),
});

export const tbdpSectorComponentStrategySchema = z.object({
  preferredComponents: z.array(z.string().min(1)).min(1),
  heroStrategy: z.string().min(1),
  navigationStyle: z.string().min(1),
  ctaStrategy: z.string().min(1),
  contentHierarchy: z.string().min(1),
  cardStyle: z.string().min(1),
});

export const tbdpSectorExperienceBindingsSchema = z.object({
  experienceProfiles: z.array(tbdpExperienceProfileIdSchema).min(1),
  motionProfile: z.array(z.string().min(1)).min(1),
  interactionProfile: z.array(z.string().min(1)).min(1),
  feedbackProfile: z.array(z.string().min(1)).min(1),
  accessibilityProfile: z.object({
    contrastLevel: z.enum(["AA", "AAA"]),
    motionSensitivity: z.enum(["low", "medium", "high"]),
  }),
  responsiveProfile: z.object({
    mobileFirst: z.boolean(),
    primaryViewport: z.enum(["mobile", "tablet", "desktop"]),
    touchPriority: z.boolean(),
  }),
  directionProfile: z.object({
    rtlOptimized: z.boolean(),
    mirrorNavigation: z.boolean(),
    mirrorCarousel: z.boolean(),
  }),
});

export const tbdpSectorGrowthStrategySchema = z.object({
  seoPresentation: z.string().min(1),
  conversionStrategy: z.string().min(1),
  trustBuilding: z.string().min(1),
});

export const tbdpSectorAiMetadataSchema = z.object({
  layoutIds: z.array(z.string().min(1)).min(1),
  heroComponents: z.array(z.string().min(1)).min(1),
  navComponents: z.array(z.string().min(1)).min(1),
  ctaComponents: z.array(z.string().min(1)).min(1),
  motionPresets: z.array(z.string().min(1)).min(1),
  typographyProfiles: z.array(
    z.enum(["latin-ltr", "latin-rtl", "arabic-rtl", "arabic-ltr"]),
  ).min(1),
  spacingScale: z.enum(["compact", "balanced", "generous", "editorial"]),
  pageFlow: z.array(z.string().min(1)).min(1),
  primaryButtonVariant: z.string().min(1),
  cardComponents: z.array(z.string().min(1)).min(1),
  feedbackStates: z.array(z.string().min(1)).min(1),
  confidence: z.number().min(0).max(1),
});

/** Full sector DNA metadata schema. */
export const tbdpSectorDnaSchema = z.object({
  id: tbdpSectorIdSchema,
  name: z.string().min(1),
  experienceProfiles: z.array(tbdpExperienceProfileIdSchema).min(1),
  personality: tbdpSectorPersonalitySchema,
  visual: tbdpSectorVisualStrategySchema,
  components: tbdpSectorComponentStrategySchema,
  experience: tbdpSectorExperienceBindingsSchema,
  growth: tbdpSectorGrowthStrategySchema,
  ai: tbdpSectorAiMetadataSchema,
});

export const tbdpExperienceProfileDefinitionSchema = z.object({
  id: tbdpExperienceProfileIdSchema,
  label: z.string().min(1),
  description: z.string().min(1),
  motionBias: z.array(z.string().min(1)).min(1),
  interactionBias: z.array(z.string().min(1)).min(1),
  typographyBias: z.string().min(1),
  spacingBias: z.enum(["compact", "balanced", "generous", "editorial"]),
  colorBias: z.enum(["warm", "cool", "neutral", "bold", "clinical"]),
});
