import {
  AI_PRODUCT_CATEGORIES,
  MARKETING_PRODUCTS,
  type MarketingProductSlug,
} from "@/lib/constants/marketing-content";
import { getPublishedBlogPosts } from "@/lib/seo/content/blog";
import { getTemplateHubItems } from "@/lib/seo/content/templates";
import { getPublishedIndustries, industryPath } from "@/lib/seo/industries";
import { KNOWLEDGE_HUBS } from "@/lib/seo/knowledge";
import { getPublishedProgrammaticPages } from "@/lib/seo/programmatic";

export type RelatedLink = {
  title: string;
  description: string;
  href: string;
  kind: "tool" | "service" | "template" | "blog" | "resource";
};

function productLink(slug: MarketingProductSlug): RelatedLink {
  const product = MARKETING_PRODUCTS.find((item) => item.slug === slug)!;
  return {
    title: product.title,
    description: product.description,
    href: `/products/${product.slug}`,
    kind: "tool",
  };
}

/** Related tools within the same category, plus cross-category highlights. */
export function getRelatedTools(slug: MarketingProductSlug, limit = 4): RelatedLink[] {
  const product = MARKETING_PRODUCTS.find((item) => item.slug === slug);
  if (!product) return [];

  const sameCategory = MARKETING_PRODUCTS.filter(
    (item) => item.categoryId === product.categoryId && item.slug !== slug,
  ).map((item) => productLink(item.slug));

  const cross = MARKETING_PRODUCTS.filter(
    (item) => item.categoryId !== product.categoryId,
  )
    .slice(0, 2)
    .map((item) => productLink(item.slug));

  return [...sameCategory, ...cross].slice(0, limit);
}

export function getRelatedServices(categoryId: string, limit = 3): RelatedLink[] {
  return AI_PRODUCT_CATEGORIES.filter((category) => category.id !== categoryId)
    .slice(0, limit)
    .map((category) => ({
      title: `${category.title} AI Products`,
      description: category.description,
      href: category.href,
      kind: "service" as const,
    }));
}

export function getRelatedTemplates(productSlug?: MarketingProductSlug, limit = 3): RelatedLink[] {
  const templates = getTemplateHubItems();
  const filtered = productSlug
    ? templates.filter((template) => template.relatedProductSlugs?.includes(productSlug))
    : templates;

  return (filtered.length ? filtered : templates).slice(0, limit).map((template) => ({
    title: template.title,
    description: template.description,
    href: template.path,
    kind: "template" as const,
  }));
}

export function getRelatedBlogArticles(limit = 3): RelatedLink[] {
  const posts = getPublishedBlogPosts().slice(0, limit);
  if (posts.length) {
    return posts.map((post) => ({
      title: post.title,
      description: post.description,
      href: post.path,
      kind: "blog" as const,
    }));
  }

  return [
    {
      title: "Trend Business AI Blog",
      description: "Product updates, growth playbooks and AI business workflows.",
      href: "/blog",
      kind: "blog",
    },
  ];
}

export function getRelatedBusinessResources(limit = 4): RelatedLink[] {
  return [
    ...KNOWLEDGE_HUBS.map((hub) => ({
      title: hub.title,
      description: hub.description,
      href: hub.path,
      kind: "resource" as const,
    })),
    {
      title: "Pricing",
      description: "Plans for founders, operators and growing teams.",
      href: "/pricing",
      kind: "resource" as const,
    },
    {
      title: "FAQ",
      description: "Answers about products, privacy, beta access and exports.",
      href: "/faq",
      kind: "resource" as const,
    },
  ].slice(0, limit);
}

/** Cross-link industry and market programmatic pages for topical clusters. */
export function getRelatedProgrammaticLinks(limit = 4): RelatedLink[] {
  const pages = [
    ...getPublishedProgrammaticPages().map((page) => ({
      title: page.title,
      description: page.description,
      href: page.path,
      kind: "resource" as const,
    })),
    ...getPublishedIndustries().map((industry) => ({
      title: industry.title,
      description: industry.description,
      href: industryPath(industry.slug),
      kind: "resource" as const,
    })),
  ];

  return pages.slice(0, limit);
}

/** Full internal linking pack for a product landing page. */
export function getProductInternalLinks(slug: MarketingProductSlug) {
  const product = MARKETING_PRODUCTS.find((item) => item.slug === slug);
  return {
    tools: getRelatedTools(slug),
    services: product ? getRelatedServices(product.categoryId) : [],
    templates: getRelatedTemplates(slug),
    articles: getRelatedBlogArticles(),
    resources: getRelatedBusinessResources(),
    programmatic: getRelatedProgrammaticLinks(),
  };
}
