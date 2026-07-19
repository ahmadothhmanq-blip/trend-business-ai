/**
 * Website Design Platform — unified architecture for Auto Design,
 * Advanced Templates, Switching, Intelligence, Brand Kit, i18n, Forms, Publish.
 * Website Builder only.
 */

export type DesignPlatformFamily =
  | "Luxury"
  | "Technology"
  | "Business"
  | "Creative"
  | "Hospitality"
  | "Commerce";

export type DesignPlatformVertical =
  | "Automotive"
  | "Real Estate"
  | "Luxury Brands"
  | "AI Companies"
  | "SaaS"
  | "Software"
  | "Corporate"
  | "Consulting"
  | "Finance"
  | "Agency"
  | "Portfolio"
  | "Restaurant"
  | "Hotel"
  | "Travel"
  | "Ecommerce"
  | "Product Brands";

/** Full visual surface a template must control. */
export type TemplateControlSurface = {
  header: string;
  navigation: string;
  heroLayout: string;
  sectionsStructure: string[];
  cardsStyle: string;
  buttons: string;
  typography: string;
  colors: string;
  spacing: string;
  animations: string;
  footer: string;
  mobileResponsive: string;
};

export type AutoDesignDecision = {
  industry: string;
  businessType: string;
  targetAudience: string;
  brandStyle: string;
  requiredSections: string[];
  family: DesignPlatformFamily;
  vertical: DesignPlatformVertical;
  templateIntelligenceId: string;
  premiumTemplateId?: string;
  designPreset: string;
  layoutStructure: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    surface: string;
  };
  typography: {
    display: string;
    heading: string;
    body: string;
  };
  components: string[];
  animations: {
    id: string;
    label: string;
  };
  controlSurface: TemplateControlSurface;
  confidence: number;
  reason: string;
  locale: {
    language: string;
    dir: "ltr" | "rtl";
    rtl: boolean;
  };
};

export type WebsiteIntelligenceSuggestion = {
  id: string;
  category:
    | "missing-section"
    | "layout"
    | "cta"
    | "seo"
    | "conversion"
    | "brand"
    | "performance"
    | "accessibility";
  title: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  command?: string;
  impact?: string;
};

export type WebsiteIntelligenceReport = {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  summary: string;
  suggestions: WebsiteIntelligenceSuggestion[];
  strengths: string[];
  generatedAt: string;
};

export type BrandKitAttachment = {
  brandIdentityId: string;
  name: string;
  primary?: string;
  secondary?: string;
  accent?: string;
  logoUrl?: string | null;
  displayFont?: string;
  bodyFont?: string;
};

export type FormLeadPayload = {
  generationId: string;
  formType: "contact" | "booking" | "quote" | "registration" | "custom";
  fields: Record<string, string>;
  pagePath?: string;
  locale?: string;
};

export type FormIntegrationConfig = {
  emailTo?: string;
  webhookUrl?: string;
  crmProvider?: "webhook" | "email" | "none";
  notifyOnSubmit?: boolean;
};
