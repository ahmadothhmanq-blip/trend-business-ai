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
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Arabic",
] as const;

export const WEBSITE_COLOR_STYLES = [
  "Black & Gold (Premium)",
  "Dark Minimal",
  "Light Professional",
  "Bold Contrast",
  "Soft Neutral",
] as const;

export const WEBSITE_DESIGN_STYLES = [
  "Modern SaaS",
  "Corporate",
  "Minimal",
  "Creative",
  "Luxury",
] as const;

export const WEBSITE_PAGE_COUNTS = ["1-3", "4-6", "7-10", "10+"] as const;

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
