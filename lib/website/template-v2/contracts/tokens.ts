export type TemplateV2LanguageProfile = {
  directionAdaptation?: boolean;
  rtlTypography?: {
    display: string;
    body: string;
  };
  ltrTypography?: {
    display?: string;
    body?: string;
  };
};

export type TemplateV2DesignTokens = {
  colors: Record<string, string>;
  typography: {
    display: string;
    body: string;
    scale?: Record<string, string>;
  };
  languageProfile?: TemplateV2LanguageProfile;
  spacing?: {
    unit?: string;
    scale?: string[];
  };
  radius?: Record<string, string>;
  shadows?: Record<string, string>;
  borders?: Record<string, string>;
};