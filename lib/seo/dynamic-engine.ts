/**
 * Dynamic SEO Engine — title, description, canonical, robots, social tags.
 * Fully typed production helpers used by metadata factories and analyzers.
 */
import type { Metadata } from "next";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
} from "@/lib/seo/site";
import { buildHreflangAlternates } from "@/lib/seo/i18n";

export type RobotsDirectiveInput = {
  index?: boolean;
  follow?: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
  noimageindex?: boolean;
  maxSnippet?: number;
  maxImagePreview?: "none" | "standard" | "large";
  maxVideoPreview?: number;
};

export type DynamicTitleInput = {
  primary: string;
  brand?: string;
  suffix?: string;
  maxLength?: number;
};

export type DynamicDescriptionInput = {
  summary: string;
  keywords?: string[];
  maxLength?: number;
};

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

function clampSentence(value: string, max: number): string {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) return cleaned;
  const sliced = cleaned.slice(0, max - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${(lastSpace > 40 ? sliced.slice(0, lastSpace) : sliced).trim()}…`;
}

/** Generate a search-optimized document title. */
export function generateDynamicTitle({
  primary,
  brand = SITE_NAME,
  suffix,
  maxLength = TITLE_MAX,
}: DynamicTitleInput): string {
  const base = suffix ? `${primary} — ${suffix}` : primary;
  const withBrand =
    brand && !base.toLowerCase().includes(brand.toLowerCase())
      ? `${base} | ${brand}`
      : base;
  return clampSentence(withBrand, maxLength);
}

/** Generate a unique meta description with optional keyword reinforcement. */
export function generateDynamicDescription({
  summary,
  keywords = [],
  maxLength = DESCRIPTION_MAX,
}: DynamicDescriptionInput): string {
  let text = summary.trim();
  if (keywords.length) {
    const missing = keywords
      .map((k) => k.trim())
      .filter((k) => k && !text.toLowerCase().includes(k.toLowerCase()))
      .slice(0, 2);
    if (missing.length) {
      text = `${text} ${missing.join(" · ")}`;
    }
  }
  if (!text) return DEFAULT_DESCRIPTION;
  return clampSentence(text, maxLength);
}

/** Absolute canonical URL for a path. */
export function generateCanonicalUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return absoluteUrl(normalized);
}

/** Build Next.js robots metadata from typed directives. */
export function generateRobotsDirectives(
  input: RobotsDirectiveInput = {},
): NonNullable<Metadata["robots"]> {
  const index = input.index ?? true;
  const follow = input.follow ?? true;

  return {
    index,
    follow,
    nocache: input.noarchive,
    nosnippet: input.nosnippet,
    noimageindex: input.noimageindex,
    googleBot: {
      index,
      follow,
      "max-snippet": input.maxSnippet ?? -1,
      "max-image-preview": input.maxImagePreview ?? "large",
      "max-video-preview": input.maxVideoPreview ?? -1,
    },
  };
}

export type DynamicOpenGraphInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article" | "profile";
  locale?: string;
  publishedTime?: string;
  modifiedTime?: string;
};

/** Open Graph + Twitter card payload for Metadata. */
export function generateSocialMetadata(input: DynamicOpenGraphInput): Pick<
  Metadata,
  "openGraph" | "twitter"
> {
  const url = generateCanonicalUrl(input.path);
  const image = absoluteUrl(input.image ?? "/opengraph-image");

  return {
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: SITE_NAME,
      locale: input.locale ?? "en_US",
      type: input.type ?? "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: input.imageAlt ?? input.title,
        },
      ],
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}

/** Compose a full Metadata object from dynamic SEO primitives. */
export function composeDynamicMetadata(input: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  robots?: RobotsDirectiveInput;
  enableHreflang?: boolean;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  const title = generateDynamicTitle({ primary: input.title });
  const description = generateDynamicDescription({
    summary: input.description,
    keywords: input.keywords,
  });
  const path = input.path.startsWith("/") ? input.path : `/${input.path}`;
  const social = generateSocialMetadata({
    title,
    description,
    path,
    image: input.image,
    imageAlt: input.imageAlt,
    type: input.type,
    publishedTime: input.publishedTime,
    modifiedTime: input.modifiedTime,
  });

  return {
    title,
    description,
    keywords: input.keywords,
    alternates: {
      canonical: path,
      ...(input.enableHreflang !== false
        ? { languages: buildHreflangAlternates(path) }
        : {}),
    },
    ...social,
    robots: generateRobotsDirectives(input.robots ?? { index: true, follow: true }),
  };
}

export const DynamicSeoEngine = {
  generateTitle: generateDynamicTitle,
  generateDescription: generateDynamicDescription,
  generateCanonical: generateCanonicalUrl,
  generateRobots: generateRobotsDirectives,
  generateSocial: generateSocialMetadata,
  compose: composeDynamicMetadata,
} as const;
