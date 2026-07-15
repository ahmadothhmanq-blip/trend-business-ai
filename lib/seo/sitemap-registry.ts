import type { MetadataRoute } from "next";
import {
  AI_PRODUCT_CATEGORIES,
  MARKETING_PRODUCTS,
} from "@/lib/constants/marketing-content";
import { getKnowledgeEntries } from "@/lib/seo/knowledge";
import { getProgrammaticPageDefs } from "@/lib/seo/programmatic";
import {
  PUBLIC_ROUTES,
  absoluteUrl,
  type PublicRouteEntry,
} from "@/lib/seo/site";
import { getPublishedBlogPosts } from "@/lib/seo/content/blog";
import { getTemplateCatalog } from "@/lib/seo/content/templates";

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

  const programmatic = getProgrammaticPageDefs()
    .filter((page) => page.status === "published")
    .map((page) => ({
      url: absoluteUrl(page.path),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  return [...hubs, ...entries, ...programmatic];
}

/** Full combined sitemap used by /sitemap.xml */
export function buildFullSitemap(): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  const merged: MetadataRoute.Sitemap = [];

  for (const entry of [
    ...buildCoreSitemap(),
    ...buildToolsSitemap(),
    ...buildBlogSitemap(),
    ...buildTemplatesSitemap(),
    ...buildKnowledgeSitemap(),
  ]) {
    if (seen.has(entry.url)) continue;
    seen.add(entry.url);
    merged.push(entry);
  }

  return merged;
}

export const SPECIALIZED_SITEMAPS = [
  { id: "pages", path: "/sitemaps/pages.xml" },
  { id: "tools", path: "/sitemaps/tools.xml" },
  { id: "images", path: "/sitemaps/images.xml" },
  { id: "blog", path: "/sitemaps/blog.xml" },
  { id: "templates", path: "/sitemaps/templates.xml" },
  { id: "knowledge", path: "/sitemaps/knowledge.xml" },
] as const;
