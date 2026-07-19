import type {
  IndustryId,
  LayoutStyle,
  TemplateDesignPreset,
} from "@/lib/ai-core/templates/types";

export type SmartTemplateId =
  | "tourism-premium"
  | "automotive-luxury"
  | "restaurant-premium"
  | "real-estate"
  | "saas-startup"
  | "agency"
  | "clinic"
  | "education-campus"
  | "ecommerce-store";

export type SmartTemplateColorPalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
};

export type SmartTemplateTypography = {
  display: string;
  body: string;
  scale: string;
};

export type SmartTemplateCtaStyle = {
  primaryLabel: string;
  secondaryLabel: string;
  style: string;
};

export type SmartTemplateFooter = {
  columns: string[];
  newsletter: boolean;
  trustBadges: string[];
};

export type SmartTemplateSection = {
  key: string;
  label: string;
  sortOrder: number;
};

export type SmartTemplateDefinition = {
  id: SmartTemplateId;
  name: string;
  slug: string;
  category: string;
  description: string;
  industryId: IndustryId;
  layoutStyle: LayoutStyle;
  designPreset: TemplateDesignPreset;
  sections: SmartTemplateSection[];
  colorPalette: SmartTemplateColorPalette;
  typography: SmartTemplateTypography;
  ctaStyle: SmartTemplateCtaStyle;
  navigation: string[];
  footer: SmartTemplateFooter;
  requiredPages: string[];
  requiredFeatures: string[];
  contentTone: string;
  keywords: string[];
  spacing: { sectionY: string; container: string; radius: string };
};

/** DeepSeek analysis + selected template configuration. */
export type SmartTemplateSelectionResult = {
  templateId: SmartTemplateId;
  confidence: number;
  reason: string;
  source: "explicit" | "analysis" | "keyword" | "default";
  designConfiguration: {
    layoutStyle: LayoutStyle;
    designPreset: TemplateDesignPreset;
    colorPalette: SmartTemplateColorPalette;
    typography: SmartTemplateTypography;
    ctaStyle: SmartTemplateCtaStyle;
    navigation: string[];
    footer: SmartTemplateFooter;
    sections: string[];
    requiredPages: string[];
    requiredFeatures: string[];
    contentTone: string;
  };
  template: SmartTemplateDefinition;
};
