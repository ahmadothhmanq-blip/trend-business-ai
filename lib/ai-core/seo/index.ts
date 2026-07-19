/**
 * AI SEO Engine (Phase 8 + SEO Performance Engine).
 */

export type {
  CoreOpenGraphData,
  CoreSeoMetadata,
  CoreSeoPackage,
  CoreSeoReadiness,
  CoreSitemapEntry,
  CoreStructuredDataItem,
  CoreTwitterCardData,
} from "@/lib/ai-core/seo/types";

export {
  buildSeoPackageFromStrategy,
  seoPackageToSerializable,
  type BuildSeoPackageInput,
} from "@/lib/ai-core/seo/build";

export {
  checkSeoReadiness,
  withSeoReadiness,
} from "@/lib/ai-core/seo/check";

export { injectSeoArtifacts } from "@/lib/ai-core/seo/inject";
