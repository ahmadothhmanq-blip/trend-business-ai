/** Supported industry sectors. */
export type TbdpSectorId =
  | "saas"
  | "restaurant"
  | "real-estate"
  | "medical"
  | "creative-studio"
  | "hotel-resort"
  | "law-firm"
  | "finance"
  | "education"
  | "logistics";

/** Experience personality profiles — reusable across sectors. */
export type TbdpExperienceProfileId =
  | "luxury"
  | "executive"
  | "technical"
  | "healthcare"
  | "hospitality"
  | "editorial"
  | "creative"
  | "corporate"
  | "minimal"
  | "playful";

export type TbdpSectorPersonality = {
  brand: string;
  visual: string;
  emotionalTone: string;
  philosophy: string;
  targetAudience: string;
};

export type TbdpSectorVisualStrategy = {
  typographyProfile: "latin-ltr" | "latin-rtl" | "arabic-rtl" | "arabic-ltr";
  colorStrategy: {
    primaryEmphasis: string;
    accentEmphasis: string;
    surfaceEmphasis: string;
    modePreference: "light" | "dark" | "auto";
  };
  surfaceStrategy: "flat" | "layered" | "elevated" | "immersive";
  spacingBehavior: "compact" | "balanced" | "generous" | "editorial";
  gridPreference: "dense" | "standard" | "airy" | "asymmetric";
  imageDirection: string;
  iconStyle: "outline" | "filled" | "duotone" | "minimal";
  illustrationStyle: string;
};

export type TbdpSectorComponentStrategy = {
  preferredComponents: string[];
  heroStrategy: string;
  navigationStyle: string;
  ctaStrategy: string;
  contentHierarchy: string;
  cardStyle: string;
};

export type TbdpSectorExperienceBindings = {
  experienceProfiles: TbdpExperienceProfileId[];
  motionProfile: string[];
  interactionProfile: string[];
  feedbackProfile: string[];
  accessibilityProfile: {
    contrastLevel: "AA" | "AAA";
    motionSensitivity: "low" | "medium" | "high";
  };
  responsiveProfile: TbdpSectorResponsiveProfile;
  directionProfile: {
    rtlOptimized: boolean;
    mirrorNavigation: boolean;
    mirrorCarousel: boolean;
  };
};

export type TbdpSectorResponsiveProfile = {
  mobileFirst: boolean;
  primaryViewport: "mobile" | "tablet" | "desktop";
  touchPriority: boolean;
};

export type TbdpSectorGrowthStrategy = {
  seoPresentation: string;
  conversionStrategy: string;
  trustBuilding: string;
};

/** AI-selectable recommendations exposed per sector. */
export type TbdpSectorAiMetadata = {
  layoutIds: string[];
  heroComponents: string[];
  navComponents: string[];
  ctaComponents: string[];
  motionPresets: string[];
  typographyProfiles: TbdpSectorVisualStrategy["typographyProfile"][];
  spacingScale: TbdpSectorVisualStrategy["spacingBehavior"];
  pageFlow: string[];
  primaryButtonVariant: string;
  cardComponents: string[];
  feedbackStates: string[];
  confidence: number;
};

export type TbdpSectorDnaProfile = {
  id: TbdpSectorId;
  name: string;
  experienceProfiles: TbdpExperienceProfileId[];
  personality: TbdpSectorPersonality;
  visual: TbdpSectorVisualStrategy;
  components: TbdpSectorComponentStrategy;
  experience: TbdpSectorExperienceBindings;
  growth: TbdpSectorGrowthStrategy;
  ai: TbdpSectorAiMetadata;
};

export type TbdpExperienceProfileDefinition = {
  id: TbdpExperienceProfileId;
  label: string;
  description: string;
  motionBias: string[];
  interactionBias: string[];
  typographyBias: string;
  spacingBias: TbdpSectorVisualStrategy["spacingBehavior"];
  colorBias: "warm" | "cool" | "neutral" | "bold" | "clinical";
};

export type TbdpAiSelectionRequest = {
  sectorId: TbdpSectorId;
  locale?: string;
  direction?: "ltr" | "rtl";
  goal?: "conversion" | "trust" | "engagement" | "information";
};

export type TbdpAiSelectionResult = {
  sector: TbdpSectorDnaProfile;
  experienceProfile: TbdpExperienceProfileDefinition;
  selections: {
    layoutId: string;
    heroComponent: string;
    navComponent: string;
    ctaComponent: string;
    motionPresets: string[];
    typographyProfile: string;
    spacingBehavior: string;
    pageFlow: string[];
    primaryButton: string;
    cardComponent: string;
  };
  metadata: TbdpSectorAiMetadata;
};
