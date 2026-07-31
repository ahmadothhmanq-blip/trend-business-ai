/**
 * Per-industry inner page section recipes — theme-scaffold sections per route.
 */
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";
import {
  getThemeComponentIds,
  getThemeComponentRole,
  isThemeFloatingCtaComponent,
  isThemeFooterComponent,
  isThemeNavComponent,
} from "@/lib/website/builder/theme-component-registry";
import { getThemePageArchitecture } from "@/lib/website/builder/theme-architecture";

export type InnerPageSectionRecipe = {
  eyebrow: string;
  headline: string;
  subtitle: string;
  /** Body-only theme component IDs (no nav/footer). */
  componentIds: DesignRendererComponentId[];
};

type PageKey =
  | "about"
  | "services"
  | "products"
  | "contact"
  | "blog"
  | "pricing"
  | "portfolio"
  | "menu"
  | "gallery"
  | "team"
  | "programs"
  | "destinations"
  | "listings"
  | "rooms"
  | "treatments"
  | "cases"
  | "careers"
  | "faq"
  | "reservation"
  | "shop"
  | "default";

function normalizePageKey(slug: string, pageName: string): PageKey {
  const raw = `${slug} ${pageName}`.toLowerCase();
  if (/about|story|heritage|mission|who-we/.test(raw)) return "about";
  if (/service|solution|capabilit|practice|offer/.test(raw)) return "services";
  if (/product|collection|catalog|inventory|vehicle|model/.test(raw)) return "products";
  if (/contact|inquir|book|appoint|reserv/.test(raw)) return "contact";
  if (/blog|journal|news|insight|article/.test(raw)) return "blog";
  if (/pric|plan|package|membership|tuition/.test(raw)) return "pricing";
  if (/portfolio|work|project|case|showcase/.test(raw)) return "portfolio";
  if (/menu|dish|dining/.test(raw)) return "menu";
  if (/gallery|lookbook|photo/.test(raw)) return "gallery";
  if (/team|staff|doctor|attorney|faculty|crew/.test(raw)) return "team";
  if (/program|course|curriculum|degree/.test(raw)) return "programs";
  if (/destination|tour|trip|expedition/.test(raw)) return "destinations";
  if (/listing|propert|home|estate/.test(raw)) return "listings";
  if (/room|suite|accommodation|stay/.test(raw)) return "rooms";
  if (/treatment|spa|wellness|therapy/.test(raw)) return "treatments";
  if (/case|client|success/.test(raw)) return "cases";
  if (/career|join|hiring/.test(raw)) return "careers";
  if (/faq|question|help/.test(raw)) return "faq";
  if (/reserv|table|booking/.test(raw)) return "reservation";
  if (/shop|store|boutique/.test(raw)) return "shop";
  return "default";
}

function isBodyComponent(id: string): boolean {
  return (
    !isThemeNavComponent(id) &&
    !isThemeFooterComponent(id) &&
    !isThemeFloatingCtaComponent(id)
  );
}

function bodyComponentsByRole(
  themeId: string,
  roles: string[],
): DesignRendererComponentId[] {
  const lib = getThemeComponentIds(themeId as never);
  const result: DesignRendererComponentId[] = [];
  for (const role of roles) {
    const match = lib.find((id) => getThemeComponentRole(id) === role);
    if (match && isBodyComponent(match)) result.push(match);
  }
  return result;
}

function fallbackBodyComponents(
  themeId: string,
  count = 3,
): DesignRendererComponentId[] {
  return getThemeComponentIds(themeId as never)
    .filter(isBodyComponent)
    .slice(0, count);
}

/** Route-specific section recipes keyed by normalized page type. */
const PAGE_RECIPES: Record<PageKey, (themeId: string) => InnerPageSectionRecipe> = {
  about: (themeId) => ({
    eyebrow: "Our story",
    headline: "Built on purpose, refined over time",
    subtitle:
      "Meet the people, principles, and milestones behind the brand — told with clarity and conviction.",
    componentIds: bodyComponentsByRole(themeId, [
      "story",
      "timeline",
      "testimonials",
      "trust",
    ]),
  }),
  services: (themeId) => ({
    eyebrow: "What we deliver",
    headline: "Services designed for real outcomes",
    subtitle:
      "Structured offerings with transparent scope, expert execution, and measurable results.",
    componentIds: bodyComponentsByRole(themeId, [
      "services",
      "process",
      "features",
      "faq",
    ]),
  }),
  products: (themeId) => ({
    eyebrow: "Collections",
    headline: "Products crafted for discerning clients",
    subtitle:
      "Explore curated selections with premium materials, thoughtful details, and lasting value.",
    componentIds: bodyComponentsByRole(themeId, [
      "gallery",
      "portfolio",
      "features",
      "pricing",
    ]),
  }),
  contact: (themeId) => ({
    eyebrow: "Get in touch",
    headline: "Start the conversation",
    subtitle:
      "Share your goals — our team responds with clear next steps and a tailored plan.",
    componentIds: bodyComponentsByRole(themeId, [
      "contact",
      "faq",
      "trust",
      "cta",
    ]),
  }),
  blog: (themeId) => ({
    eyebrow: "Journal",
    headline: "Insights, updates, and perspectives",
    subtitle:
      "Editorial stories that inform, inspire, and keep you ahead of what matters.",
    componentIds: bodyComponentsByRole(themeId, [
      "blog",
      "story",
      "timeline",
      "gallery",
    ]),
  }),
  pricing: (themeId) => ({
    eyebrow: "Plans",
    headline: "Transparent pricing, premium value",
    subtitle:
      "Choose the tier that fits your needs — every plan includes dedicated support.",
    componentIds: bodyComponentsByRole(themeId, [
      "pricing",
      "services",
      "faq",
      "contact",
      "trust",
      "process",
    ]),
  }),
  portfolio: (themeId) => ({
    eyebrow: "Selected work",
    headline: "Projects that define our craft",
    subtitle:
      "A curated portfolio of outcomes — each engagement built on strategy and execution.",
    componentIds: bodyComponentsByRole(themeId, [
      "portfolio",
      "cases",
      "gallery",
      "testimonials",
    ]),
  }),
  menu: (themeId) => ({
    eyebrow: "The menu",
    headline: "Seasonal plates, timeless technique",
    subtitle:
      "Chef-driven courses with local sourcing, wine pairings, and signature presentations.",
    componentIds: bodyComponentsByRole(themeId, [
      "gallery",
      "services",
      "story",
      "cta",
    ]),
  }),
  gallery: (themeId) => ({
    eyebrow: "Visual story",
    headline: "Moments captured in detail",
    subtitle:
      "An immersive gallery showcasing atmosphere, craft, and the experience we create.",
    componentIds: bodyComponentsByRole(themeId, [
      "gallery",
      "story",
      "testimonials",
      "cta",
    ]),
  }),
  team: (themeId) => ({
    eyebrow: "Our team",
    headline: "Experts you can trust",
    subtitle:
      "Meet the specialists behind every engagement — credentials, experience, and care.",
    componentIds: bodyComponentsByRole(themeId, [
      "story",
      "trust",
      "testimonials",
      "contact",
    ]),
  }),
  programs: (themeId) => ({
    eyebrow: "Programs",
    headline: "Learning paths built for growth",
    subtitle:
      "Structured curricula, expert faculty, and outcomes that advance your career.",
    componentIds: bodyComponentsByRole(themeId, [
      "features",
      "services",
      "pricing",
      "faq",
    ]),
  }),
  destinations: (themeId) => ({
    eyebrow: "Destinations",
    headline: "Journeys worth taking",
    subtitle:
      "Handpicked itineraries with local guides, premium stays, and seamless logistics.",
    componentIds: bodyComponentsByRole(themeId, [
      "gallery",
      "story",
      "services",
      "cta",
    ]),
  }),
  listings: (themeId) => ({
    eyebrow: "Properties",
    headline: "Homes that match how you live",
    subtitle:
      "Browse verified listings with neighborhood insight and agent guidance.",
    componentIds: bodyComponentsByRole(themeId, [
      "gallery",
      "services",
      "trust",
      "contact",
    ]),
  }),
  rooms: (themeId) => ({
    eyebrow: "Suites & rooms",
    headline: "Sanctuary in every detail",
    subtitle:
      "Thoughtfully appointed accommodations with premium linens, views, and service.",
    componentIds: bodyComponentsByRole(themeId, [
      "gallery",
      "story",
      "testimonials",
      "cta",
    ]),
  }),
  treatments: (themeId) => ({
    eyebrow: "Treatments",
    headline: "Rituals for renewal",
    subtitle:
      "Signature therapies blending science and serenity for visible, lasting results.",
    componentIds: bodyComponentsByRole(themeId, [
      "services",
      "gallery",
      "story",
      "cta",
    ]),
  }),
  cases: (themeId) => ({
    eyebrow: "Case studies",
    headline: "Results that speak for themselves",
    subtitle:
      "Deep dives into challenges solved, metrics moved, and partnerships sustained.",
    componentIds: bodyComponentsByRole(themeId, [
      "cases",
      "testimonials",
      "trust",
      "cta",
    ]),
  }),
  careers: (themeId) => ({
    eyebrow: "Careers",
    headline: "Join a team that ships excellence",
    subtitle:
      "Open roles, growth paths, and a culture built on craft, ownership, and impact.",
    componentIds: bodyComponentsByRole(themeId, [
      "story",
      "features",
      "faq",
      "contact",
    ]),
  }),
  faq: (themeId) => ({
    eyebrow: "FAQ",
    headline: "Answers, clearly stated",
    subtitle:
      "Common questions about process, pricing, timelines, and what to expect.",
    componentIds: bodyComponentsByRole(themeId, [
      "faq",
      "contact",
      "trust",
      "cta",
    ]),
  }),
  reservation: (themeId) => ({
    eyebrow: "Reservations",
    headline: "Reserve your experience",
    subtitle:
      "Book online in minutes — confirmations arrive instantly with all the details you need.",
    componentIds: bodyComponentsByRole(themeId, [
      "contact",
      "gallery",
      "story",
      "cta",
    ]),
  }),
  shop: (themeId) => ({
    eyebrow: "Shop",
    headline: "Curated collections, delivered",
    subtitle:
      "Editorial commerce with premium packaging, easy returns, and concierge support.",
    componentIds: bodyComponentsByRole(themeId, [
      "gallery",
      "features",
      "pricing",
      "cta",
    ]),
  }),
  default: (themeId) => ({
    eyebrow: "Explore",
    headline: "Discover more",
    subtitle:
      "Continue exploring — every page is designed to inform, inspire, and convert.",
    componentIds: bodyComponentsByRole(themeId, [
      "story",
      "features",
      "services",
      "cta",
    ]),
  }),
};

/** TI-specific copy overrides for inner page intros. */
const TI_PAGE_OVERRIDES: Partial<
  Record<string, Partial<Record<PageKey, Partial<InnerPageSectionRecipe>>>>
> = {
  "ti-restaurant-dining": {
    menu: {
      eyebrow: "Chef's table",
      headline: "A menu worth the reservation",
      subtitle:
        "Seasonal tasting menus, wine pairings, and signature plates prepared with precision.",
    },
    reservation: {
      eyebrow: "Reserve",
      headline: "Your table awaits",
      subtitle:
        "Book for dinner, private dining, or celebrations — we confirm within the hour.",
    },
  },
  "ti-ai-company-signal": {
    about: {
      eyebrow: "Mission",
      headline: "Intelligence that ships",
      subtitle:
        "We build production AI systems — from prototype to scale, with safety and observability built in.",
    },
    services: {
      eyebrow: "Platform",
      headline: "Deploy AI with confidence",
      subtitle:
        "Model orchestration, eval pipelines, and enterprise guardrails in one cohesive stack.",
    },
  },
  "ti-law-firm": {
    about: {
      eyebrow: "Counsel",
      headline: "Authority earned in every matter",
      subtitle:
        "A full-service practice with decades of precedent, discretion, and decisive advocacy.",
    },
    services: {
      eyebrow: "Practice areas",
      headline: "Strategic representation across complex matters",
      subtitle:
        "Litigation, corporate advisory, and regulatory counsel with senior partner attention.",
    },
  },
  "ti-medical-care": {
    contact: {
      eyebrow: "Appointments",
      headline: "Care when you need it",
      subtitle:
        "Same-week scheduling, telehealth options, and a clinical team focused on your wellbeing.",
    },
  },
  "ti-hotel-sanctuary": {
    rooms: {
      eyebrow: "Accommodations",
      headline: "Suites designed for sanctuary",
      subtitle:
        "Ocean views, bespoke amenities, and turndown service that anticipates every need.",
    },
  },
  "ti-luxury-brands-atelier": {
    products: {
      eyebrow: "Lookbook",
      headline: "Haute couture, season after season",
      subtitle:
        "Editorial collections with atelier craftsmanship and limited-run exclusivity.",
    },
  },
};

export function getIndustryInnerPageRecipe(
  templateIntelligenceId: string,
  pageSlug: string,
  pageName: string,
): InnerPageSectionRecipe | null {
  const arch = getThemePageArchitecture(templateIntelligenceId);
  if (!arch) return null;

  const pageKey = normalizePageKey(pageSlug, pageName);
  const base = PAGE_RECIPES[pageKey](arch.themeId);
  const overrides =
    TI_PAGE_OVERRIDES[templateIntelligenceId]?.[pageKey] ?? {};

  const componentIds =
    base.componentIds.length > 0
      ? base.componentIds.slice(0, 4)
      : fallbackBodyComponents(arch.themeId, 3);

  return {
    eyebrow: overrides.eyebrow ?? base.eyebrow,
    headline: overrides.headline ?? base.headline,
    subtitle: overrides.subtitle ?? base.subtitle,
    componentIds,
  };
}
