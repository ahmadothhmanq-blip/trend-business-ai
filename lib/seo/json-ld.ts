import {
  SITE_NAME,
  SITE_ORGANIZATION,
  absoluteUrl,
  getSiteUrl,
} from "@/lib/seo/site";

export type JsonLd = Record<string, unknown>;

function withContext(node: JsonLd): JsonLd {
  return {
    "@context": "https://schema.org",
    ...node,
  };
}

export function organizationJsonLd(): JsonLd {
  return withContext({
    "@type": "Organization",
    name: SITE_ORGANIZATION.name,
    legalName: SITE_ORGANIZATION.legalName,
    url: getSiteUrl(),
    logo: absoluteUrl(SITE_ORGANIZATION.logoPath),
    description: SITE_ORGANIZATION.description,
    email: SITE_ORGANIZATION.email,
    ...(SITE_ORGANIZATION.sameAs.length ? { sameAs: [...SITE_ORGANIZATION.sameAs] } : {}),
  });
}

export function websiteJsonLd(): JsonLd {
  return withContext({
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: SITE_ORGANIZATION.description,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: absoluteUrl(SITE_ORGANIZATION.logoPath),
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/docs")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  });
}

export function softwareApplicationJsonLd(input?: {
  name?: string;
  description?: string;
  url?: string;
  applicationCategory?: string;
  offersPrice?: string;
}): JsonLd {
  return withContext({
    "@type": "SoftwareApplication",
    name: input?.name ?? SITE_NAME,
    applicationCategory: input?.applicationCategory ?? "BusinessApplication",
    operatingSystem: "Web",
    url: input?.url ?? getSiteUrl(),
    description: input?.description ?? SITE_ORGANIZATION.description,
    offers: {
      "@type": "Offer",
      price: input?.offersPrice ?? "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  });
}

export function webPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "FAQPage" | "CollectionPage";
}): JsonLd {
  return withContext({
    "@type": input.type ?? "WebPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: getSiteUrl(),
    },
  });
}

export function collectionPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
  items: Array<{ name: string; path: string; description?: string }>;
}): JsonLd {
  return withContext({
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: input.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: absoluteUrl(item.path),
        ...(item.description ? { description: item.description } : {}),
      })),
    },
  });
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
): JsonLd {
  return withContext({
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  });
}

export function faqPageJsonLd(
  faqs: Array<{ question: string; answer: string }>,
): JsonLd {
  return withContext({
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  });
}

export function articleJsonLd(input: {
  headline: string;
  description: string;
  path: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
}): JsonLd {
  return withContext({
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    url: absoluteUrl(input.path),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(SITE_ORGANIZATION.logoPath),
      },
    },
    ...(input.image
      ? {
          image: absoluteUrl(input.image),
        }
      : {}),
  });
}

export function productJsonLd(input: {
  name: string;
  description: string;
  path: string;
  image?: string;
  category?: string;
}): JsonLd {
  return withContext({
    "@type": "Product",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    category: input.category,
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(input.path),
      priceCurrency: "USD",
      price: "0",
      availability: "https://schema.org/InStock",
    },
  });
}

export function howToJsonLd(input: {
  name: string;
  description: string;
  path: string;
  steps: Array<{ name: string; text: string }>;
}): JsonLd {
  return withContext({
    "@type": "HowTo",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    step: input.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  });
}

export function videoObjectJsonLd(input: {
  name: string;
  description: string;
  thumbnailPath: string;
  path: string;
  uploadDate?: string;
}): JsonLd {
  return withContext({
    "@type": "VideoObject",
    name: input.name,
    description: input.description,
    thumbnailUrl: absoluteUrl(input.thumbnailPath),
    uploadDate: input.uploadDate ?? new Date().toISOString(),
    contentUrl: absoluteUrl(input.path),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  });
}

/** Merge multiple nodes into a single @graph payload. */
export function graphJsonLd(...nodes: JsonLd[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.map((node) => {
      const rest = { ...node };
      delete rest["@context"];
      return rest;
    }),
  };
}
