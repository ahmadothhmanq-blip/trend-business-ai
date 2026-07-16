/**
 * Breadcrumb Engine — path → UI crumbs + JSON-LD ready items.
 */
import { AI_PRODUCT_CATEGORIES, MARKETING_PRODUCTS } from "@/lib/constants/marketing-content";
import { getPublishedBlogPosts } from "@/lib/seo/content/blog";
import { getIndustryBySlug } from "@/lib/seo/industries";
import { getCountryBySlug } from "@/lib/seo/countries";
import { getProgrammaticPageDefs } from "@/lib/seo/programmatic";

export type BreadcrumbCrumb = {
  name: string;
  path: string;
};

const STATIC_LABELS: Record<string, string> = {
  "": "Home",
  products: "Products",
  blog: "Blog",
  templates: "Templates",
  docs: "Docs",
  learn: "Learn",
  resources: "Resources",
  features: "Features",
  pricing: "Pricing",
  about: "About",
  contact: "Contact",
  faq: "FAQ",
  changelog: "Changelog",
  privacy: "Privacy",
  terms: "Terms",
  "use-cases": "Use Cases",
  industries: "Industries",
  countries: "Markets",
  compare: "Compare",
  create: "Create",
  design: "Design",
  content: "Content",
  business: "Business",
};

function humanize(segment: string): string {
  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function resolveSegmentLabel(segment: string, fullPath: string): string {
  if (STATIC_LABELS[segment]) return STATIC_LABELS[segment];

  const product = MARKETING_PRODUCTS.find((p) => p.slug === segment);
  if (product) return product.title;

  const category = AI_PRODUCT_CATEGORIES.find((c) => c.href === fullPath);
  if (category) return category.title;

  const post = getPublishedBlogPosts().find((p) => p.slug === segment);
  if (post) return post.title;

  const industry = getIndustryBySlug(segment);
  if (industry) return industry.name;

  const country = getCountryBySlug(segment);
  if (country) return country.name;

  const programmatic = getProgrammaticPageDefs().find((p) => p.path === fullPath);
  if (programmatic) return programmatic.title;

  return humanize(segment);
}

/**
 * Build breadcrumb trail from a URL path.
 * Always starts with Home.
 */
export function buildBreadcrumbs(path: string): BreadcrumbCrumb[] {
  const normalized = path.split("?")[0]?.split("#")[0] ?? "/";
  if (normalized === "/" || normalized === "") {
    return [{ name: "Home", path: "/" }];
  }

  const segments = normalized.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  const crumbs: BreadcrumbCrumb[] = [{ name: "Home", path: "/" }];

  let cumulative = "";
  for (const segment of segments) {
    cumulative += `/${segment}`;
    crumbs.push({
      name: resolveSegmentLabel(segment, cumulative),
      path: cumulative,
    });
  }

  return crumbs;
}

/** Convenience: crumbs without trailing current page href for UI. */
export function breadcrumbsForUi(path: string): Array<{ name: string; href?: string }> {
  const crumbs = buildBreadcrumbs(path);
  return crumbs.map((crumb, index) => ({
    name: crumb.name,
    href: index === crumbs.length - 1 ? undefined : crumb.path,
  }));
}

export const BreadcrumbEngine = {
  build: buildBreadcrumbs,
  forUi: breadcrumbsForUi,
} as const;
