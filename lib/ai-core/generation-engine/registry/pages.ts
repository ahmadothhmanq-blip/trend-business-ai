import type { Tbge2IntentCategory, Tbge2PageKind } from "@/lib/ai-core/generation-engine/core/types";

export type Tbge2PageTemplate = {
  kind: Tbge2PageKind;
  name: string;
  path: string;
  purpose: string;
  seoPriority: "high" | "medium" | "low";
  inNavigation: boolean;
};

const CORE_PAGES: Tbge2PageTemplate[] = [
  { kind: "home", name: "Home", path: "/", purpose: "Primary entry and conversion", seoPriority: "high", inNavigation: true },
  { kind: "about", name: "About", path: "/about", purpose: "Brand story and trust", seoPriority: "medium", inNavigation: true },
  { kind: "services", name: "Services", path: "/services", purpose: "Offerings and value proposition", seoPriority: "high", inNavigation: true },
  { kind: "pricing", name: "Pricing", path: "/pricing", purpose: "Plans and conversion", seoPriority: "high", inNavigation: true },
  { kind: "faq", name: "FAQ", path: "/faq", purpose: "Objection handling", seoPriority: "medium", inNavigation: false },
  { kind: "blog", name: "Blog", path: "/blog", purpose: "Content marketing and SEO", seoPriority: "medium", inNavigation: true },
  { kind: "contact", name: "Contact", path: "/contact", purpose: "Lead capture and inquiries", seoPriority: "high", inNavigation: true },
  { kind: "gallery", name: "Gallery", path: "/gallery", purpose: "Visual showcase", seoPriority: "medium", inNavigation: true },
  { kind: "portfolio", name: "Portfolio", path: "/portfolio", purpose: "Work samples", seoPriority: "high", inNavigation: true },
  { kind: "menu", name: "Menu", path: "/menu", purpose: "Food and beverage offerings", seoPriority: "high", inNavigation: true },
  { kind: "team", name: "Team", path: "/team", purpose: "Staff and credibility", seoPriority: "low", inNavigation: false },
];

const INTENT_PAGE_KINDS: Record<Tbge2IntentCategory, Tbge2PageKind[]> = {
  website: ["home", "about", "services", "contact"],
  "landing-page": ["home", "contact"],
  portfolio: ["home", "portfolio", "about", "contact"],
  restaurant: ["home", "menu", "about", "gallery", "contact"],
  medical: ["home", "services", "about", "faq", "contact"],
  saas: ["home", "services", "pricing", "faq", "contact"],
  ecommerce: ["home", "services", "gallery", "contact"],
  "real-estate": ["home", "gallery", "about", "contact"],
  legal: ["home", "services", "about", "faq", "contact"],
  education: ["home", "services", "about", "blog", "contact"],
  agency: ["home", "portfolio", "services", "about", "contact"],
  blog: ["home", "blog", "about", "contact"],
  app: ["home", "services", "pricing", "faq", "contact"],
  nonprofit: ["home", "about", "services", "contact"],
  unknown: ["home", "about", "services", "contact"],
};

export function resolvePageTemplatesForIntent(intent: Tbge2IntentCategory): Tbge2PageTemplate[] {
  const kinds = INTENT_PAGE_KINDS[intent] ?? INTENT_PAGE_KINDS.unknown;
  return kinds.map((kind) => CORE_PAGES.find((p) => p.kind === kind)!).filter(Boolean);
}
