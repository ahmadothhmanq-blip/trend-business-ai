import { getGlsGenerationLanguageValues } from "@/lib/language-platform/generation/options";

export const WEBSITE_TYPE_KEYS: Record<string, string> = {
  Business: "business",
  Portfolio: "portfolio",
  "E-commerce": "e_commerce",
  SaaS: "saas",
  Blog: "blog",
  "Landing Page": "landing_page",
};

export const WEBSITE_TYPES = [
  "Business",
  "Portfolio",
  "E-commerce",
  "SaaS",
  "Blog",
  "Landing Page",
] as const;

/** GLS world languages + Bilingual for website generation. */
export const WEBSITE_LANGUAGES = getGlsGenerationLanguageValues(
  "website-builder",
) as readonly string[];

export const WEBSITE_COLOR_STYLE_KEYS: Record<string, string> = {
  "Black & Gold (Premium)": "black_gold_premium",
  "Dark Minimal": "dark_minimal",
  "Light Professional": "light_professional",
  "Bold Contrast": "bold_contrast",
  "Soft Neutral": "soft_neutral",
};

export const WEBSITE_COLOR_STYLES = [
  "Black & Gold (Premium)",
  "Dark Minimal",
  "Light Professional",
  "Bold Contrast",
  "Soft Neutral",
] as const;

export const WEBSITE_DESIGN_STYLE_KEYS: Record<string, string> = {
  "Modern SaaS": "modern_saas",
  Corporate: "corporate",
  Minimal: "minimal",
  Creative: "creative",
  Luxury: "luxury",
};

export const WEBSITE_DESIGN_STYLES = [
  "Modern SaaS",
  "Corporate",
  "Minimal",
  "Creative",
  "Luxury",
] as const;

export const WEBSITE_PAGE_COUNTS = ["1-3", "4-6", "7-10", "10+"] as const;

export const WEBSITE_FEATURE_LABEL_KEYS: Record<string, string> = {
  login: "authentication",
  dashboard: "dashboard",
  cms: "cms",
  blog: "blog",
  contact: "contact",
  booking: "booking",
  payment: "payments",
  ecommerce: "ecommerce",
  chat: "chat",
  notifications: "notifications",
  analytics: "analytics",
  crm: "crm",
  newsletter: "newsletter",
  search: "search",
  testimonials: "testimonials",
  gallery: "gallery",
  portfolio: "portfolio",
  faq: "faq",
  pricing: "pricing",
  maps: "maps",
  seo: "seo",
  localization: "localization",
  membership: "membership",
  uploads: "uploads",
};

export const WEBSITE_FEATURE_IDS = [
  "login",
  "dashboard",
  "cms",
  "blog",
  "contact",
  "booking",
  "payment",
  "ecommerce",
  "chat",
  "notifications",
  "analytics",
  "crm",
  "newsletter",
  "search",
  "testimonials",
  "gallery",
  "portfolio",
  "faq",
  "pricing",
  "maps",
  "seo",
  "localization",
  "membership",
  "uploads",
] as const;

export type WebsiteType = (typeof WEBSITE_TYPES)[number];
export type WebsiteLanguage = (typeof WEBSITE_LANGUAGES)[number];
export type WebsiteColorStyle = (typeof WEBSITE_COLOR_STYLES)[number];
export type WebsiteDesignStyle = (typeof WEBSITE_DESIGN_STYLES)[number];
export type WebsitePageCount = (typeof WEBSITE_PAGE_COUNTS)[number];
export type WebsiteFeatureId = (typeof WEBSITE_FEATURE_IDS)[number];
