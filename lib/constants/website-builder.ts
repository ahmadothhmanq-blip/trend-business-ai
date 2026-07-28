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

export const WEBSITE_LANGUAGES = [
  "English",
  "Arabic",
  "Bilingual",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Italian",
] as const;

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
  login: "websiteFeatures.login",
  dashboard: "websiteFeatures.dashboard",
  blog: "websiteFeatures.blog",
  contact: "websiteFeatures.contact",
  booking: "websiteFeatures.booking",
  payment: "websiteFeatures.payment",
  chat: "websiteFeatures.chat",
};

export const WEBSITE_FEATURE_IDS = [
  "login",
  "dashboard",
  "blog",
  "contact",
  "booking",
  "payment",
  "chat",
] as const;

export type WebsiteType = (typeof WEBSITE_TYPES)[number];
export type WebsiteLanguage = (typeof WEBSITE_LANGUAGES)[number];
export type WebsiteColorStyle = (typeof WEBSITE_COLOR_STYLES)[number];
export type WebsiteDesignStyle = (typeof WEBSITE_DESIGN_STYLES)[number];
export type WebsitePageCount = (typeof WEBSITE_PAGE_COUNTS)[number];
export type WebsiteFeatureId = (typeof WEBSITE_FEATURE_IDS)[number];
