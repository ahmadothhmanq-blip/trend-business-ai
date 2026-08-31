/** Unified language lifecycle layers. */
export type GlsLanguageLayer =
  | "platform"
  | "generation"
  | "website"
  | "template"
  | "content"
  | "preview"
  | "export"
  | "service";

export type GlsDirection = "ltr" | "rtl";

/** Script families for typography profile resolution. */
export type GlsTypographyScriptFamily =
  | "latin"
  | "arabic"
  | "hebrew"
  | "cjk"
  | "cyrillic"
  | "indic"
  | "thai"
  | "greek"
  | "vietnamese";

export type GlsTypographyProfileId =
  | "latin-ltr"
  | "latin-rtl"
  | "arabic-ltr"
  | "arabic-rtl"
  | "hebrew-rtl"
  | "cjk-ltr"
  | "cyrillic-ltr"
  | "indic-ltr"
  | "thai-ltr"
  | "greek-ltr"
  | "vietnamese-ltr";

/** TBDP-compatible typography profile (backward compat bridge). */
export type GlsTbdpTypographyProfileId =
  | "latin-ltr"
  | "latin-rtl"
  | "arabic-ltr"
  | "arabic-rtl";

export type GlsServiceId =
  | "website-builder"
  | "app-builder"
  | "landing-builder"
  | "video-studio"
  | "content-studio"
  | "brand-designer"
  | "logo-designer"
  | "image-generator"
  | "ai-agents"
  | "marketing-ai"
  | "business-manager"
  | "social-media"
  | "crm"
  | "erp";

export type GlsLocalizedSlugStrategy = "transliterate" | "native" | "latin";

export type GlsDirectionAdaptations = {
  spacingMirror: boolean;
  motionReverse: boolean;
  gridFlow: "row" | "row-reverse";
  iconMirror: boolean;
  navigationAlign: "start" | "end";
  carouselDirection: "ltr" | "rtl";
  timelineDirection: "ltr" | "rtl";
  drawerSide: "left" | "right";
};

export type GlsLocaleFormatting = {
  localeCode: string;
  htmlLang: string;
  numberLocale: string;
  dateLocale: string;
  currencyCode: string;
  unitSystem: "metric" | "imperial";
  timezone: string;
  calendar: "gregory" | "islamic" | "buddhist" | "japanese";
  pluralRules: string;
};

export type GlsSeoLocalization = {
  hreflang: string;
  alternateLocales: string[];
  localizedSlugStrategy: GlsLocalizedSlugStrategy;
  schemaOrgLanguage: string;
  sitemapLocalePrefix: string;
};

export type GlsAiLanguageResolution = {
  promptLanguage: string;
  outputLanguage: string;
  contentLanguage: string;
  websiteLanguage: string;
  templateLanguage: string;
  structuredOutputOnly: boolean;
  usesLlmLocalization: boolean;
};

/** Unified Global Language Context — single source for all products. */
export type GlsLanguageContext = {
  meta: {
    platformPhase: string;
    platformVersion: string;
    resolvedAt: string;
    contextHash: string;
  };
  platform: {
    locale: string;
    direction: GlsDirection;
    aiLanguage: string;
  };
  generation: {
    language: string;
    promptLanguage: string;
    outputLanguage: string;
  };
  website: {
    language: string;
    localeCode: string;
    htmlLang: string;
    direction: GlsDirection;
    rtl: boolean;
  };
  template: {
    language: string;
    languageNeutral: boolean;
  };
  content: {
    language: string;
    usesLlmLocalization: boolean;
  };
  typography: {
    scriptFamily: GlsTypographyScriptFamily;
    profileId: GlsTypographyProfileId;
    tbdpProfileId: GlsTbdpTypographyProfileId;
    fontHint?: string;
  };
  direction: {
    direction: GlsDirection;
    adaptations: GlsDirectionAdaptations;
  };
  locale: GlsLocaleFormatting;
  seo: GlsSeoLocalization;
  ai: GlsAiLanguageResolution;
  service?: {
    serviceId: GlsServiceId;
    language: string;
  };
};

export type GlsLanguageResolverInput = {
  platformLocale?: string | null;
  generationLanguage?: string | null;
  websiteLanguage?: string | null;
  templateLanguage?: string | null;
  contentLanguage?: string | null;
  serviceId?: GlsServiceId;
  serviceLanguage?: string | null;
  direction?: GlsDirection;
  timezone?: string;
  currencyCode?: string;
};
