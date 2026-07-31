export type AgencyBrandKit = {
  companyName: string;
  tagline: string;
  logoConcept: string;
  logoStyle: string;
  colorPalette: {
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
  trustElements: string[];
  contactPlaceholders: {
    email: string;
    phone: string;
    address: string;
  };
  /** SVG logo assets — generated programmatically */
  logos?: {
    light: string;
    dark: string;
    monogram: string;
    favicon: string;
  };
  /** Complete brand guidelines object */
  guidelines?: import("@/lib/ai-core/agency-brand-kit/guidelines").BrandGuidelines;
};

export const AGENCY_BRAND_KIT_KEY = "agencyBrandKit";
