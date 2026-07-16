import type { MetadataRoute } from "next";
import { absoluteUrl, isProductionRuntime } from "@/lib/seo/site";
import { SPECIALIZED_SITEMAPS } from "@/lib/seo/sitemap-registry";

/**
 * Production: indexable, AI-crawler friendly, specialized sitemaps.
 * Non-production: disallow all indexing to protect staging/preview.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isProductionRuntime()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const aiBots = [
    "GPTBot",
    "ChatGPT-User",
    "Google-Extended",
    "anthropic-ai",
    "ClaudeBot",
    "PerplexityBot",
    "Bytespider",
    "CCBot",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/api/",
          "/login",
          "/signup",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/auth/",
        ],
      },
      ...aiBots.map((userAgent) => ({
        userAgent,
        allow: ["/", "/products/", "/docs", "/blog", "/learn", "/faq", "/pricing", "/features"],
        disallow: ["/dashboard/", "/api/", "/login", "/signup"],
      })),
    ],
    sitemap: [
      absoluteUrl("/sitemaps/index.xml"),
      absoluteUrl("/sitemap.xml"),
      ...SPECIALIZED_SITEMAPS.map((item) => absoluteUrl(item.path)),
    ],
    host: absoluteUrl("/"),
  };
}
