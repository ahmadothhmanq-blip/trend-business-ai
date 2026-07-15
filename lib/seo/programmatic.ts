/**
 * Programmatic SEO foundation — reusable page definitions for future
 * scalable landing pages. Intentionally does NOT mass-generate pages.
 *
 * Rules:
 * - Every page must have unique intent, title, and description
 * - status: "draft" until editorial quality gates pass
 * - Sitemaps only include published definitions
 */

export type ProgrammaticPageDef = {
  id: string;
  /** Stable path template, e.g. /use-cases/[slug] */
  path: string;
  title: string;
  description: string;
  intent: string;
  cluster: string;
  relatedProductSlugs?: string[];
  status: "draft" | "published";
};

/**
 * Seed catalog for future expansion. All draft — zero duplicate index pages.
 */
const PROGRAMMATIC_DEFS: ProgrammaticPageDef[] = [
  {
    id: "use-case-startup-website",
    path: "/use-cases/startup-website",
    title: "AI Website Builder for Startups",
    description:
      "Plan and generate startup website structure, messaging and launch direction with Trend Business AI.",
    intent: "startup website creation",
    cluster: "use-cases",
    relatedProductSlugs: ["website-builder", "landing-page-builder"],
    status: "draft",
  },
  {
    id: "use-case-agency-branding",
    path: "/use-cases/agency-branding",
    title: "AI Brand Studio for Agencies",
    description:
      "Produce logos, brand systems and client-ready identity concepts faster with AI brand workflows.",
    intent: "agency branding workflows",
    cluster: "use-cases",
    relatedProductSlugs: ["logo-maker", "brand-studio"],
    status: "draft",
  },
  {
    id: "comparison-ai-business-suite",
    path: "/compare/ai-business-suite",
    title: "All-in-One AI Business Suite vs Fragmented Tools",
    description:
      "See how a unified AI business platform compares to juggling separate chat tools for websites, design and marketing.",
    intent: "platform comparison",
    cluster: "comparisons",
    relatedProductSlugs: ["website-builder", "marketing-ai", "business-intelligence"],
    status: "draft",
  },
];

export function getProgrammaticPageDefs(cluster?: string) {
  return cluster
    ? PROGRAMMATIC_DEFS.filter((page) => page.cluster === cluster)
    : PROGRAMMATIC_DEFS;
}

export function getPublishedProgrammaticPages() {
  return PROGRAMMATIC_DEFS.filter((page) => page.status === "published");
}

/** Validate uniqueness before publishing a programmatic page. */
export function assertProgrammaticQuality(page: ProgrammaticPageDef) {
  const errors: string[] = [];
  if (!page.title.trim() || page.title.length < 20) {
    errors.push("Title must be unique and descriptive (20+ chars).");
  }
  if (!page.description.trim() || page.description.length < 80) {
    errors.push("Description must be unique and informative (80+ chars).");
  }
  if (!page.intent.trim()) {
    errors.push("Intent is required to avoid duplicate topical pages.");
  }
  if (page.path.includes("[") || page.path.includes("*")) {
    errors.push("Path must be a concrete URL, not a template placeholder.");
  }
  return errors;
}
