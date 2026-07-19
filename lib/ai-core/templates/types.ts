export type IndustryId =
  | "restaurant"
  | "ecommerce"
  | "saas"
  | "real-estate"
  | "automotive"
  | "agency"
  | "clinic"
  | "business";

export type LayoutStyle =
  | "editorial-hero"
  | "commerce-grid"
  | "product-saas"
  | "property-showcase"
  | "vehicle-showroom"
  | "studio-portfolio"
  | "corporate-trust";

/** Matches Core / Website design presets (kept local to avoid circular imports). */
export type TemplateDesignPreset =
  | "luxury"
  | "modern"
  | "corporate"
  | "minimal"
  | "creative"
  | "tech";

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
};
