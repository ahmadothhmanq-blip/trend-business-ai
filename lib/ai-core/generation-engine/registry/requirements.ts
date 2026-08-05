import type { Tbge2RequirementId } from "@/lib/ai-core/generation-engine/core/types";

export type Tbge2RequirementPattern = {
  id: Tbge2RequirementId;
  keywords: string[];
  weight: number;
};

export const TBGE2_REQUIREMENT_PATTERNS: readonly Tbge2RequirementPattern[] = [
  { id: "booking", keywords: ["booking", "reservation", "appointment", "schedule"], weight: 1.2 },
  { id: "payments", keywords: ["payment", "checkout", "stripe", "paypal", "billing"], weight: 1.2 },
  { id: "crm", keywords: ["crm", "customer management", "lead management", "pipeline"], weight: 1.1 },
  { id: "blog", keywords: ["blog", "articles", "news", "posts"], weight: 1.0 },
  { id: "gallery", keywords: ["gallery", "photos", "portfolio images", "showcase"], weight: 1.0 },
  { id: "multi-language", keywords: ["multi-language", "multilingual", "bilingual", "translation"], weight: 1.1 },
  { id: "contact", keywords: ["contact", "get in touch", "reach us"], weight: 0.9 },
  { id: "forms", keywords: ["form", "inquiry", "quote request", "lead form"], weight: 1.0 },
  { id: "authentication", keywords: ["login", "sign up", "auth", "user accounts"], weight: 1.1 },
  { id: "dashboard", keywords: ["dashboard", "admin panel", "back office"], weight: 1.1 },
  { id: "ecommerce", keywords: ["ecommerce", "cart", "products", "shop"], weight: 1.2 },
  { id: "newsletter", keywords: ["newsletter", "email list", "subscribe"], weight: 0.9 },
  { id: "testimonials", keywords: ["testimonials", "reviews", "social proof"], weight: 0.8 },
  { id: "faq", keywords: ["faq", "frequently asked"], weight: 0.8 },
  { id: "pricing", keywords: ["pricing", "plans", "packages", "rates"], weight: 1.0 },
  { id: "chat", keywords: ["chat", "live chat", "messaging", "whatsapp"], weight: 0.9 },
  { id: "analytics", keywords: ["analytics", "tracking", "google analytics"], weight: 0.7 },
  { id: "seo", keywords: ["seo", "search engine", "ranking"], weight: 0.8 },
  { id: "social", keywords: ["social media", "instagram", "facebook", "linkedin"], weight: 0.7 },
] as const;

/** Default requirements always included for marketing websites. */
export const TBGE2_BASE_REQUIREMENTS: readonly Tbge2RequirementId[] = [
  "contact",
  "forms",
  "seo",
] as const;
