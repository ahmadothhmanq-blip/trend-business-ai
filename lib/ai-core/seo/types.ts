/**
 * AI SEO Engine contracts (Phase 8 + SEO Performance Engine).
 */

export type CoreSeoMetadata = {
  title: string;
  description: string;
  keywords: string[];
  canonicalPath: string;
  robots: string;
};

export type CoreOpenGraphData = {
  title: string;
  description: string;
  type: "website" | "article" | "product";
  siteName: string;
  locale: string;
  imageAlt: string;
  /** Optional absolute or path hint for social share image. */
  imagePath?: string;
};

/** Twitter / X card metadata for social sharing. */
export type CoreTwitterCardData = {
  card: "summary" | "summary_large_image";
  title: string;
  description: string;
  imageAlt: string;
};

export type CoreStructuredDataItem = {
  type: string;
  jsonLd: Record<string, unknown>;
};

export type CoreSitemapEntry = {
  path: string;
  priority: number;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
};

export type CoreSeoReadiness = {
  passed: boolean;
  score: number;
  issues: string[];
  /** Internal SEO recommendations (headings, keywords, technical). */
  recommendations?: string[];
};

export type CoreSeoPackage = {
  metadata: CoreSeoMetadata;
  openGraph: CoreOpenGraphData;
  /** Social sharing (Twitter / X). Optional for backward-compatible packages. */
  twitter?: CoreTwitterCardData;
  keywords: string[];
  structuredData: CoreStructuredDataItem[];
  sitemap: CoreSitemapEntry[];
  readiness: CoreSeoReadiness;
  generatedAt: string;
};
