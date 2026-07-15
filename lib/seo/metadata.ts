import type { Metadata } from "next";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_LOCALE,
  DEFAULT_TITLE,
  SITE_NAME,
  SUPPORTED_LOCALES,
  absoluteUrl,
  getSiteUrl,
  type SupportedLocaleCode,
} from "@/lib/seo/site";
import { buildHreflangAlternates } from "@/lib/seo/i18n";
import { getAnalyticsVerification } from "@/lib/seo/analytics";

export type PageSeoType =
  | "website"
  | "article"
  | "product"
  | "profile"
  | "collection";

export type PageMetadataOptions = {
  title?: string;
  description?: string;
  path: string;
  noIndex?: boolean;
  noFollow?: boolean;
  keywords?: string[];
  type?: PageSeoType;
  image?: string;
  imageAlt?: string;
  locale?: SupportedLocaleCode;
  /** When set, emits hreflang alternates for supported locales. */
  enableHreflang?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
};

function resolveOgType(type: PageSeoType): "website" | "article" | "profile" {
  if (type === "article") return "article";
  if (type === "profile") return "profile";
  return "website";
}

/**
 * Central reusable SEO metadata factory for every public page.
 */
export function createPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  noIndex = false,
  noFollow = false,
  keywords,
  type = "website",
  image,
  imageAlt,
  locale = "en",
  enableHreflang = true,
  publishedTime,
  modifiedTime,
}: PageMetadataOptions): Metadata {
  const resolvedTitle = title ?? DEFAULT_TITLE;
  const canonicalPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = absoluteUrl(canonicalPath);
  const ogImage = image ? absoluteUrl(image) : absoluteUrl("/opengraph-image");
  const ogLocale =
    SUPPORTED_LOCALES.find((item) => item.code === locale)?.ogLocale ?? DEFAULT_OG_LOCALE;

  const robots =
    noIndex || noFollow
      ? {
          index: !noIndex,
          follow: !noFollow,
          googleBot: {
            index: !noIndex,
            follow: !noFollow,
          },
        }
      : undefined;

  return {
    title: resolvedTitle,
    description,
    keywords: keywords?.length ? keywords : [...DEFAULT_KEYWORDS],
    alternates: {
      canonical: canonicalPath,
      ...(enableHreflang ? { languages: buildHreflangAlternates(canonicalPath) } : {}),
    },
    openGraph: {
      title: resolvedTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: ogLocale,
      type: resolveOgType(type),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: imageAlt ?? resolvedTitle,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [ogImage],
    },
    ...(robots ? { robots } : {}),
  };
}

export function rootMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const verification = getAnalyticsVerification();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: DEFAULT_TITLE,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    keywords: [...DEFAULT_KEYWORDS],
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    applicationName: SITE_NAME,
    category: "technology",
    alternates: {
      canonical: "/",
      languages: buildHreflangAlternates("/"),
    },
    openGraph: {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      url: siteUrl,
      siteName: SITE_NAME,
      locale: DEFAULT_OG_LOCALE,
      type: "website",
      images: [
        {
          url: absoluteUrl("/opengraph-image"),
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — AI business platform`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      images: [absoluteUrl("/opengraph-image")],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    ...(verification.google || verification.bing
      ? {
          verification: {
            ...(verification.google ? { google: verification.google } : {}),
            ...(verification.bing ? { other: { "msvalidate.01": verification.bing } } : {}),
          },
        }
      : {}),
  };
}
