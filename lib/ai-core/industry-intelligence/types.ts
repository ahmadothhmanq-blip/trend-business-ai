import type {
  IndustryId,
  LayoutStyle,
  TemplateDesignPreset,
} from "@/lib/ai-core/templates/types";

/**
 * Rich Website Builder industry blueprint — pages, sections, CTAs,
 * content/design style, and image requirements for agency-grade sites.
 */
export type WebsiteIndustryIntelligence = {
  id: IndustryId;
  /** Public label (e.g. Healthcare for clinic). */
  label: string;
  description: string;
  keywords: string[];
  recommendedPages: string[];
  requiredSections: string[];
  ctaTypes: string[];
  contentStyle: string;
  designStyle: string;
  designPreset: TemplateDesignPreset;
  layoutStyle: LayoutStyle;
  industryPattern: string;
  imageRequirements: string[];
  requiredFeatures: string[];
  /** Preferred Smart Template Engine id when available. */
  preferredSmartTemplateId?: string;
  /** Preferred Premium Templates System id when available. */
  preferredPremiumTemplateId?:
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
};

export type IndustryDetectionSource =
  | "explicit"
  | "analysis"
  | "keyword"
  | "default";

export type IndustryDetectionResult = {
  industryId: IndustryId;
  confidence: number;
  reason: string;
  source: IndustryDetectionSource;
  profile: WebsiteIndustryIntelligence;
};
