import { loadMessages } from "@/lib/i18n/load-messages";
import { getNestedMessage } from "@/lib/i18n/messages";
import type { SupportedLocale } from "@/lib/i18n/config";
import type { BlogPostMeta } from "@/lib/seo/content/blog";
import type { CountryDef } from "@/lib/seo/countries";
import type { IndustryDef } from "@/lib/seo/industries";
import type { ProgrammaticPageDef } from "@/lib/seo/programmatic";

function seoString(
  locale: SupportedLocale,
  key: string,
  fallback: string,
): string {
  const messages = loadMessages(locale);
  const value = getNestedMessage(messages, key);
  return typeof value === "string" && value.trim() ? value : fallback;
}

function seoStringArray(
  locale: SupportedLocale,
  keyPrefix: string,
  fallback: string[],
): string[] {
  if (!fallback.length) return fallback;
  const messages = loadMessages(locale);
  const translated: string[] = [];
  let hasAny = false;

  for (let i = 0; i < fallback.length; i++) {
    const value = getNestedMessage(messages, `${keyPrefix}.body.${i}`);
    if (typeof value === "string" && value.trim()) {
      translated.push(value);
      hasAny = true;
    } else {
      translated.push(fallback[i]!);
    }
  }

  return hasAny ? translated : fallback;
}

export function getLocalizedBlogPost(
  locale: SupportedLocale,
  post: BlogPostMeta,
): BlogPostMeta {
  const prefix = `seoContent.blog.${post.slug}`;
  return {
    ...post,
    title: seoString(locale, `${prefix}.title`, post.title),
    description: seoString(locale, `${prefix}.description`, post.description),
    body: seoStringArray(locale, prefix, post.body),
  };
}

export function getLocalizedCountry(
  locale: SupportedLocale,
  country: CountryDef,
): CountryDef {
  const prefix = `seoContent.countries.${country.slug}`;
  return {
    ...country,
    name: seoString(locale, `${prefix}.name`, country.name),
    title: seoString(locale, `${prefix}.title`, country.title),
    description: seoString(locale, `${prefix}.description`, country.description),
  };
}

export function getLocalizedIndustry(
  locale: SupportedLocale,
  industry: IndustryDef,
): IndustryDef {
  const prefix = `seoContent.industries.${industry.slug}`;
  return {
    ...industry,
    name: seoString(locale, `${prefix}.name`, industry.name),
    title: seoString(locale, `${prefix}.title`, industry.title),
    description: seoString(locale, `${prefix}.description`, industry.description),
  };
}

export function getLocalizedProgrammaticPage(
  locale: SupportedLocale,
  page: ProgrammaticPageDef,
): ProgrammaticPageDef {
  const prefix = `seoContent.programmatic.${page.id}`;
  const body = page.body ?? [page.description];
  return {
    ...page,
    title: seoString(locale, `${prefix}.title`, page.title),
    description: seoString(locale, `${prefix}.description`, page.description),
    body: seoStringArray(locale, prefix, body),
  };
}
