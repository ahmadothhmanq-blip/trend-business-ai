import type { MetadataRoute } from "next";
import {
  AI_PRODUCT_CATEGORIES,
  MARKETING_PRODUCTS,
} from "@/lib/constants/marketing-content";
import { getKnowledgeEntries } from "@/lib/seo/knowledge";
import { getPublishedProgrammaticPages } from "@/lib/seo/programmatic";
import {
  PUBLIC_ROUTES,
  absoluteUrl,
  type PublicRouteEntry,
} from "@/lib/seo/site";
import { getPublishedBlogPosts } from "@/lib/seo/content/blog";
import { getTemplateCatalog } from "@/lib/seo/content/templates";
import { getPublishedIndustries, industryPath } from "@/lib/seo/industries";
import { getPublishedCountries, countryPath } from "@/lib/seo/countries";
import type { SitemapIndexEntry } from "@/lib/seo/sitemap-xml";

function toSitemapEntry(
  route: PublicRouteEntry,
  lastModified = new Date(),
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    ...(route.images?.length
      ? {
          images: route.images.map((img) => absoluteUrl(img.loc)),
        }
      : {}),
  };
}

function enrichToolRoutes(): PublicRouteEntry[] {
  return PUBLIC_ROUTES.filter((route) => route.group === "tools").map((route) => {
    const product = MARKETING_PRODUCTS.find((p) => `/products/${p.slug}` === route.path);
    const category = AI_PRODUCT_CATEGORIES.find((c) => c.href === route.path);
    const image = product?.image ?? category?.image;
    const title = product?.title ?? category?.title;

    if (!image) return route;
    return {
      ...route,
      images: [{ loc: image, title }],
    };
  });
}

export function buildCoreSitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PUBLIC_ROUTES.filter((route) => route.group === "core" || route.group === "legal").map(
    (route) => toSitemapEntry(route, lastModified),
  );
}

export function buildToolsSitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return enrichToolRoutes().map((route) => toSitemapEntry(route, lastModified));
}

/** Service / category + published service cluster programmatic pages. */
export function buildServiceSitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const categories = AI_PRODUCT_CATEGORIES.map((category) => ({
    url: absoluteUrl(category.href),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const services = getPublishedProgrammaticPages("services").map((page) => ({
    url: absoluteUrl(page.path),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...categories, ...services];
}

export function buildBlogSitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const hub = PUBLIC_ROUTES.filter((route) => route.group === "blog").map((route) =>
    toSitemapEntry(route, lastModified),
  );

  const posts = getPublishedBlogPosts().map((post) => ({
    url: absoluteUrl(post.path),
    lastModified: new Date(post.updatedAt ?? post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }));

  return [...hub, ...posts];
}

export function buildTemplatesSitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const hub = PUBLIC_ROUTES.filter((route) => route.group === "templates").map((route) =>
    toSitemapEntry(route, lastModified),
  );

  const templates = getTemplateCatalog().map((template) => ({
    url: absoluteUrl(template.path),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
    images: template.image ? [absoluteUrl(template.image)] : undefined,
  }));

  return [...hub, ...templates];
}

export function buildImagesSitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const toolImages = enrichToolRoutes().filter((route) => route.images?.length);
  const categoryImages = AI_PRODUCT_CATEGORIES.map((category) => ({
    path: category.href,
    changeFrequency: "monthly" as const,
    priority: 0.7,
    images: [{ loc: category.image, title: category.title }],
  }));

  return [...toolImages, ...categoryImages].map((route) =>
    toSitemapEntry(route as PublicRouteEntry, lastModified),
  );
}

export function buildIndustrySitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return getPublishedIndustries().map((industry) => ({
    url: absoluteUrl(industryPath(industry.slug)),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));
}

export function buildCountrySitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return getPublishedCountries().map((country) => ({
    url: absoluteUrl(countryPath(country.slug)),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
}

export function buildKnowledgeSitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const hubs = PUBLIC_ROUTES.filter((route) => route.group === "knowledge").map((route) =>
    toSitemapEntry(route, lastModified),
  );

  const entries = getKnowledgeEntries()
    .filter((entry) => entry.status === "published")
    .map((entry) => ({
      url: absoluteUrl(entry.path),
      lastModified: new Date(entry.updatedAt ?? entry.publishedAt ?? Date.now()),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }));

  const programmatic = getPublishedProgrammaticPages()
    .filter((page) => page.cluster === "use-cases" || page.cluster === "comparisons")
    .map((page) => ({
      url: absoluteUrl(page.path),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    }));

  return [...hubs, ...entries, ...programmatic];
}

/** Full combined sitemap used by /sitemap.xml fallback / health checks */
export function buildFullSitemap(): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  const merged: MetadataRoute.Sitemap = [];

  for (const entry of [
    ...buildCoreSitemap(),
    ...buildToolsSitemap(),
    ...buildServiceSitemap(),
    ...buildBlogSitemap(),
    ...buildTemplatesSitemap(),
    ...buildKnowledgeSitemap(),
    ...buildIndustrySitemap(),
    ...buildCountrySitemap(),
  ]) {
    if (seen.has(entry.url)) continue;
    seen.add(entry.url);
    merged.push(entry);
  }

  return merged;
}

export const SPECIALIZED_SITEMAPS = [
  { id: "pages", path: "/sitemaps/pages.xml", builder: "core" },
  { id: "tools", path: "/sitemaps/tools.xml", builder: "tools" },
  { id: "services", path: "/sitemaps/services.xml", builder: "services" },
  { id: "images", path: "/sitemaps/images.xml", builder: "images" },
  { id: "blog", path: "/sitemaps/blog.xml", builder: "blog" },
  { id: "templates", path: "/sitemaps/templates.xml", builder: "templates" },
  { id: "knowledge", path: "/sitemaps/knowledge.xml", builder: "knowledge" },
  { id: "industries", path: "/sitemaps/industries.xml", builder: "industries" },
  { id: "countries", path: "/sitemaps/countries.xml", builder: "countries" },
] as const;

export function buildSitemapIndexEntries(lastModified = new Date()): SitemapIndexEntry[] {
  return SPECIALIZED_SITEMAPS.map((item) => ({
    loc: absoluteUrl(item.path),
    lastModified,
  }));
}
