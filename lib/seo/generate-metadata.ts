/**
 * Dynamic metadata helper for future content-driven routes
 * (blog posts, programmatic landings, locale segments).
 * Prefer this over ad-hoc Metadata objects so all pages stay DRY.
 */
import type { Metadata } from "next";
import { SeoService } from "@/lib/seo/engine";
import type { PageMetadataOptions } from "@/lib/seo/metadata";
import { getPublishedBlogPosts } from "@/lib/seo/content/blog";
import { getPublishedProgrammaticPages } from "@/lib/seo/programmatic";
import { MARKETING_PRODUCTS } from "@/lib/constants/marketing-content";
import { getServerLocale } from "@/lib/i18n/server";
import {
  getLocalizedBlogPost,
  getLocalizedProgrammaticPage,
} from "@/lib/seo/localized-content";

export async function generateSeoMetadata(
  options: PageMetadataOptions,
): Promise<Metadata> {
  return SeoService.createMetadata(options);
}

export async function generateProductSeoMetadata(slug: string): Promise<Metadata | null> {
  const product = MARKETING_PRODUCTS.find((item) => item.slug === slug);
  if (!product) return null;
  return SeoService.createMetadata({
    title: product.title,
    description: product.description,
    path: `/products/${product.slug}`,
    type: "product",
    image: product.image,
    imageAlt: product.imageAlt,
  });
}

export async function generateBlogPostSeoMetadata(slug: string): Promise<Metadata | null> {
  const post = getPublishedBlogPosts().find((item) => item.slug === slug);
  if (!post) return null;
  const locale = await getServerLocale();
  const localized = getLocalizedBlogPost(locale, post);
  return SeoService.createMetadata({
    title: localized.title,
    description: localized.description,
    path: post.path,
    type: "article",
    image: post.image,
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    locale,
  });
}

export async function generateProgrammaticSeoMetadata(id: string): Promise<Metadata | null> {
  const page = getPublishedProgrammaticPages().find((item) => item.id === id);
  if (!page) return null;
  const locale = await getServerLocale();
  const localized = getLocalizedProgrammaticPage(locale, page);
  return SeoService.createMetadata({
    title: localized.title,
    description: localized.description,
    path: page.path,
    type: "website",
    locale,
  });
}
