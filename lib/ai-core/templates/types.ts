export type IndustryId =
  | "tourism"
  | "restaurant"
  | "ecommerce"
  | "saas"
  | "real-estate"
  | "automotive"
  | "agency"
  | "clinic"
  | "education"
  | "business";

export type LayoutStyle =
  | "editorial-hero"
  | "commerce-grid"
  | "product-saas"
  | "property-showcase"
  | "vehicle-showroom"
  | "studio-portfolio"
  | "corporate-trust"
  | "travel-premium"
  | "campus-education";

/** Matches Core / Website design presets (kept local to avoid circular imports). */
export type TemplateDesignPreset =
  | "luxury"
  | "modern"
  | "corporate"
  | "minimal"
  | "creative"
  | "tech"
  | "premium-brand";

/** Industry intelligence profile used by the AI Template Engine. */
export type IndustryProfile = {
  id: IndustryId;
  label: string;
  description: string;
  keywords: string[];
  layoutStyle: LayoutStyle;
  sections: string[];
  designPreset: TemplateDesignPreset;
  requiredFeatures: string[];
  suggestedPages: string[];
  contentTone: string;
  industryPattern: string;
  /** Website Builder intelligence extensions (optional for older callers). */
  ctaTypes?: string[];
  designStyle?: string;
  imageRequirements?: string[];
};

/** Resolved template choices applied at the start of a Core run. */
export type TemplateSelection = {
  industryId: IndustryId;
  label: string;
  layoutStyle: LayoutStyle;
  sections: string[];
  designPreset: TemplateDesignPreset;
  requiredFeatures: string[];
  suggestedPages: string[];
  contentTone: string;
  industryPattern: string;
  confidence: number;
  source: "explicit" | "keyword" | "analysis" | "default";
  /** Website Builder Smart Template Engine id when selected. */
  smartTemplateId?: string;
  /** Full design configuration from Smart Template Engine. */
  designConfiguration?: Record<string, unknown>;
  /** Agency-grade industry blueprint when Industry Website Intelligence ran. */
  industryIntelligence?: {
    id?: string;
    label?: string;
    industryPattern?: string;
    recommendedPages: string[];
    requiredSections: string[];
    ctaTypes: string[];
    contentStyle: string;
    designStyle: string;
    imageRequirements: string[];
  };
};
