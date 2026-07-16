/**
 * Industry catalog for programmatic SEO landings.
 * Only `published` entries enter sitemaps and public routes.
 */

export type IndustryDef = {
  slug: string;
  name: string;
  title: string;
  description: string;
  intent: string;
  relatedProductSlugs: string[];
  status: "draft" | "published";
};

const INDUSTRIES: IndustryDef[] = [
  {
    slug: "saas",
    name: "SaaS",
    title: "AI Business Tools for SaaS Companies",
    description:
      "Plan positioning, websites, content systems and go-to-market workflows for SaaS products with Trend Business AI.",
    intent: "saas ai business planning",
    relatedProductSlugs: ["website-builder", "marketing-ai", "business-intelligence"],
    status: "published",
  },
  {
    slug: "ecommerce",
    name: "Ecommerce",
    title: "AI Growth Stack for Ecommerce Brands",
    description:
      "Generate store messaging, landing pages, creative assets and market analysis tailored to ecommerce operators.",
    intent: "ecommerce ai marketing and planning",
    relatedProductSlugs: ["landing-page-builder", "image-generator", "content-studio"],
    status: "published",
  },
  {
    slug: "agencies",
    name: "Agencies",
    title: "AI Delivery Suite for Digital Agencies",
    description:
      "Speed up client branding, websites, content calendars and strategy decks with agency-ready AI workflows.",
    intent: "agency ai production workflows",
    relatedProductSlugs: ["logo-maker", "brand-studio", "website-builder"],
    status: "published",
  },
  {
    slug: "startups",
    name: "Startups",
    title: "AI Planning Workspace for Startups",
    description:
      "Validate ideas, analyze markets, build launch sites and package investor-ready narratives in one AI workspace.",
    intent: "startup planning with ai",
    relatedProductSlugs: ["feasibility-study", "website-builder", "business-intelligence"],
    status: "published",
  },
  {
    slug: "consultancies",
    name: "Consultancies",
    title: "AI Research & Strategy for Consultancies",
    description:
      "Produce structured market analyses, feasibility studies and client strategy deliverables faster with AI.",
    intent: "consultancy ai research",
    relatedProductSlugs: ["business-intelligence", "feasibility-study", "content-studio"],
    status: "draft",
  },
];

export function getIndustries(status?: IndustryDef["status"]) {
  return status ? INDUSTRIES.filter((item) => item.status === status) : INDUSTRIES;
}

export function getPublishedIndustries() {
  return getIndustries("published");
}

export function getIndustryBySlug(slug: string) {
  return INDUSTRIES.find((item) => item.slug === slug);
}

export function industryPath(slug: string) {
  return `/industries/${slug}`;
}
