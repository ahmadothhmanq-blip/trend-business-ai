/**
 * AI SEO Engine contracts (Phase 8).
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
};

export type CoreSeoPackage = {
  metadata: CoreSeoMetadata;
  openGraph: CoreOpenGraphData;
  keywords: string[];
  structuredData: CoreStructuredDataItem[];
  sitemap: CoreSitemapEntry[];
  readiness: CoreSeoReadiness;
  generatedAt: string;
};
