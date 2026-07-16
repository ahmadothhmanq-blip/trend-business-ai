/**
 * Programmatic SEO foundation — reusable page definitions for scalable landings.
 *
 * Rules:
 * - Every page must have unique intent, title, and description
 * - status: "draft" until editorial quality gates pass
 * - Sitemaps only include published definitions
 */

export type ProgrammaticCluster =
  | "use-cases"
  | "comparisons"
  | "services"
  | "industries"
  | "countries";

export type ProgrammaticPageDef = {
  id: string;
  /** Stable concrete path, e.g. /use-cases/startup-website */
  path: string;
  title: string;
  description: string;
  intent: string;
  cluster: ProgrammaticCluster;
  relatedProductSlugs?: string[];
  status: "draft" | "published";
  body?: string[];
};

const PROGRAMMATIC_DEFS: ProgrammaticPageDef[] = [
  {
    id: "use-case-startup-website",
    path: "/use-cases/startup-website",
    title: "AI Website Builder for Startups",
    description:
      "Plan and generate startup website structure, messaging and launch direction with Trend Business AI — from positioning to page architecture.",
    intent: "startup website creation",
    cluster: "use-cases",
    relatedProductSlugs: ["website-builder", "landing-page-builder"],
    status: "published",
    body: [
      "Startups need clarity fast: who you serve, what you sell, and how the site converts visitors into trials or demos.",
      "Use Trend Business AI to draft information architecture, homepage messaging, pricing page outlines and launch checklists in one workspace.",
      "Pair website generation with feasibility and market analysis so your narrative matches real demand signals.",
    ],
  },
  {
    id: "use-case-agency-branding",
    path: "/use-cases/agency-branding",
    title: "AI Brand Studio for Agencies",
    description:
      "Produce logos, brand systems and client-ready identity concepts faster with AI brand workflows built for agency delivery timelines.",
    intent: "agency branding workflows",
    cluster: "use-cases",
    relatedProductSlugs: ["logo-maker", "brand-studio"],
    status: "published",
    body: [
      "Agencies juggle multiple brand systems at once. Trend Business AI helps teams move from brief to direction without starting from a blank canvas.",
      "Generate logo concepts, palette systems and verbal identity drafts, then refine with your creative leadership.",
      "Connect brand outputs to website and content workflows so every deliverable stays on-message.",
    ],
  },
  {
    id: "use-case-content-engine",
    path: "/use-cases/content-engine",
    title: "AI Content Engine for Growth Teams",
    description:
      "Build a repeatable content system for blogs, social and campaigns with AI drafting, calendars and channel-ready packaging.",
    intent: "content operations with ai",
    cluster: "use-cases",
    relatedProductSlugs: ["content-studio", "social-media-manager", "marketing-ai"],
    status: "published",
    body: [
      "Growth teams need consistent publishing without sacrificing quality or brand voice.",
      "Use Content Studio and Marketing AI to plan themes, draft assets and schedule distribution across channels.",
      "Internal linking across product, blog and resource pages helps compound organic discovery over time.",
    ],
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
    status: "published",
    body: [
      "Fragmented AI tools create context loss: one chat for copy, another for design, another for strategy.",
      "Trend Business AI consolidates planning, creation and analysis so teams keep a single source of truth.",
      "Choose a suite when you need connected workflows, shared history and consistent brand execution.",
    ],
  },
  {
    id: "service-seo-growth",
    path: "/services/seo-growth",
    title: "SEO Growth System for AI-Powered Brands",
    description:
      "Technical SEO foundations, structured data, content clusters and internal linking designed for sustainable organic growth.",
    intent: "seo growth service overview",
    cluster: "services",
    relatedProductSlugs: ["content-studio", "marketing-ai", "website-builder"],
    status: "published",
    body: [
      "Organic growth compounds when technical SEO, content quality and internal linking work together.",
      "Trend Business AI ships metadata, sitemaps, JSON-LD and programmatic foundations as part of the product surface.",
      "Use the SEO Health Dashboard to monitor coverage, then expand published clusters deliberately.",
    ],
  },
  {
    id: "service-go-to-market",
    path: "/services/go-to-market",
    title: "AI Go-To-Market Planning Service",
    description:
      "Align positioning, messaging, landing pages and launch content with an AI-assisted go-to-market workspace.",
    intent: "go to market planning",
    cluster: "services",
    relatedProductSlugs: ["landing-page-builder", "marketing-ai", "feasibility-study"],
    status: "draft",
  },
];

export function getProgrammaticPageDefs(cluster?: ProgrammaticCluster) {
  return cluster
    ? PROGRAMMATIC_DEFS.filter((page) => page.cluster === cluster)
    : PROGRAMMATIC_DEFS;
}

export function getPublishedProgrammaticPages(cluster?: ProgrammaticCluster) {
  return getProgrammaticPageDefs(cluster).filter((page) => page.status === "published");
}

const CLUSTER_PATH_PREFIX: Record<ProgrammaticCluster, string> = {
  "use-cases": "/use-cases/",
  comparisons: "/compare/",
  services: "/services/",
  industries: "/industries/",
  countries: "/countries/",
};

export function getProgrammaticPageBySlug(cluster: ProgrammaticCluster, slug: string) {
  const prefix = CLUSTER_PATH_PREFIX[cluster];
  return getProgrammaticPageDefs(cluster).find(
    (page) => page.path === `${prefix}${slug}` || page.path.endsWith(`/${slug}`),
  );
}

export function getProgrammaticPageByPath(path: string) {
  return PROGRAMMATIC_DEFS.find((page) => page.path === path);
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
  const intents = PROGRAMMATIC_DEFS.filter((p) => p.id !== page.id).map((p) => p.intent);
  if (intents.includes(page.intent)) {
    errors.push("Intent must be unique across the programmatic catalog.");
  }
  return errors;
}
