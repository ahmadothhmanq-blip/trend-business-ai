/**
 * Website Generation Engine contracts (Phase 3).
 * DirectorWebsitePlan → domain aggregates. No HTML, React, CSS, or publish.
 */

import type {
  Navigation,
  Theme,
  WebsiteComponent,
  WebsitePage,
  WebsitePlan,
  WebsiteProject,
  WebsiteSection,
  WebsiteSectionType,
  WebsiteSeo,
} from "@/lib/ai-core/website-builder/domain/contracts";
import type { DirectorPageSectionType, DirectorWebsitePlan } from "@/lib/ai-core/website-builder/director/contracts";

export const STANDARD_WEBSITE_SECTIONS = [
  "hero",
  "features",
  "services",
  "about",
  "testimonials",
  "pricing",
  "faq",
  "contact",
  "cta",
  "gallery",
  "team",
  "blog",
  "footer",
] as const;

export type StandardWebsiteSection = (typeof STANDARD_WEBSITE_SECTIONS)[number];

export const DIRECTOR_TO_DOMAIN_SECTION: Record<DirectorPageSectionType, WebsiteSectionType> = {
  hero: "hero",
  features: "features",
  cta: "cta",
  pricing: "pricing",
  testimonials: "testimonials",
  faq: "faq",
  contact: "contact",
  gallery: "gallery",
  stats: "features",
  logos: "gallery",
  content: "about",
  footer: "footer",
  about: "about",
  services: "services",
  products: "features",
  menu: "features",
  team: "team",
  process: "services",
  booking: "contact",
  location: "contact",
  listings: "gallery",
  "blog-index": "blog",
};

export type WebsiteGeneratedStructure = {
  plan: WebsitePlan;
  pages: WebsitePage[];
  sections: WebsiteSection[];
  components: WebsiteComponent[];
  navigation: Navigation;
  theme: Theme;
  seo: WebsiteSeo;
  project: WebsiteProject;
};

export type WebsiteGenerationInput = {
  project: WebsiteProject;
  directorPlan: DirectorWebsitePlan;
};

export type WebsiteGenerationStatus = "ready" | "failed" | "reused";

export type WebsiteGenerationResult = {
  status: WebsiteGenerationStatus;
  structure: WebsiteGeneratedStructure | null;
  reused: boolean;
  attempts: number;
  errorCode?: string;
  errorMessage?: string;
};

export type WebsiteGenerationStore = {
  get(key: string): WebsiteGeneratedStructure | undefined;
  set(key: string, structure: WebsiteGeneratedStructure): void;
};

export type WebsiteGenerationContext = {
  project: WebsiteProject;
  directorPlan: DirectorWebsitePlan;
  createId: () => string;
  now: () => string;
};

export type WebsiteStructureBuilder = {
  build(context: WebsiteGenerationContext): WebsiteGeneratedStructure;
};
