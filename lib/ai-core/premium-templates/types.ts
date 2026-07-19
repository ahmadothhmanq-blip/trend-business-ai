import type { WebsiteGoal } from "@/lib/ai-core/components/types";
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";
import type {
  IndustryId,
  LayoutStyle,
  TemplateDesignPreset,
} from "@/lib/ai-core/templates/types";
import type { SmartTemplateId } from "@/lib/website/smart-templates/types";

export type PremiumTemplateId =
  | "luxury-business"
  | "saas"
  | "real-estate"
  | "automotive"
  | "tourism"
  | "restaurant"
  | "healthcare"
  | "ecommerce"
  | "agency"
  | "education";

export type PremiumTemplatePage = {
  name: string;
  path: string;
  purpose: string;
  keySections: string[];
  /** Optional primary CTA label for this page. */
  primaryCta?: string;
};

export type PremiumTemplateSection = {
  key: string;
  label: string;
  sortOrder: number;
  /** Preferred Professional Components Library id. */
  componentId: DesignRendererComponentId;
  assetRole?: "hero" | "product" | "service" | "section" | "background";
  contentGoal: string;
};

export type PremiumContentStrategy = {
  brandVoice: string;
  messagingPillars: string[];
  proofPoints: string[];
  seoTopics: string[];
  ctaHierarchy: string[];
  audienceNotes: string;
};

export type PremiumImageRequirement = {
  role: "hero" | "product" | "service" | "section" | "background" | "gallery";
  brief: string;
};

export type PremiumTemplateDefinition = {
  id: PremiumTemplateId;
  name: string;
  description: string;
  industryId: IndustryId;
  /** Compatibility with existing Smart Template Engine. */
  smartTemplateId: SmartTemplateId;
  designStyle: string;
  designPreset: TemplateDesignPreset;
  layoutStyle: LayoutStyle;
  brandStyles: string[];
  defaultWebsiteGoal: WebsiteGoal;
  pageStructure: PremiumTemplatePage[];
  sections: PremiumTemplateSection[];
  recommendedComponents: DesignRendererComponentId[];
  imageRequirements: PremiumImageRequirement[];
  contentStrategy: PremiumContentStrategy;
  keywords: string[];
  colorHints: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  typographyHints: { display: string; body: string };
  /** Ordered conversion path labels for strategy / CTAs. */
  conversionPath?: string[];
};

/** AI-configured instance — base template adapted to goal/audience/style. */
export type ConfiguredPremiumTemplate = {
  template: PremiumTemplateDefinition;
  websiteGoal: WebsiteGoal;
  brandStyle: string;
  designPreset: TemplateDesignPreset;
  designStyle: string;
  layoutStyle: LayoutStyle;
  pageStructure: PremiumTemplatePage[];
  sections: PremiumTemplateSection[];
  recommendedComponents: DesignRendererComponentId[];
  imageRequirements: PremiumImageRequirement[];
  contentStrategy: PremiumContentStrategy;
  conversionPath: string[];
  layoutNotes: string[];
  confidence: number;
  reason: string;
  source: "explicit" | "analysis" | "keyword" | "industry" | "default";
};

export type PremiumTemplateSelectionContext = {
  industryId?: IndustryId | string;
  businessType?: string;
  targetAudience?: string;
  websiteGoal?: WebsiteGoal | string;
  brandStyle?: string;
  designStyle?: string;
  prompt?: string;
  features?: string[];
  explicitTemplateId?: string;
};
