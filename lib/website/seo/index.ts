/**
 * Website Builder SEO facade — single import point organized by lifecycle phase.
 *
 * See docs/WEBSITE_BUILDER_VALIDATION_LADDER.md for validation rungs.
 * See docs/WEBSITE_BUILDER_SEO_MODULES.md for module responsibilities.
 */

/** Generation path — SAIE agent during adapter runSeo. */
export {
  runSeoAeoIntelligenceEngine,
  runSeoAeoIntelligenceFromBrief,
  getSeoAeoIntelligenceTraceFromBrief,
  getSeoAeoSpecificationFromBrief,
} from "@/lib/ai-core/seo-aeo-intelligence";

/** Core SEO package — strategy → metadata / sitemap / structured data. */
export {
  buildSeoPackageFromStrategy,
  checkSeoReadiness,
  withSeoReadiness,
  injectSeoArtifacts,
} from "@/lib/ai-core/seo";

/** Post-generation finalize — performance + SEO quality pass. */
export { runSeoPerformanceEngine } from "@/lib/ai-core/seo-performance";

/** Dashboard / post-publish — analysis, agent, optimizer. */
export { runSeoAgent } from "@/lib/ai-core/seo-agent";
export { runSeoAnalysis } from "@/lib/ai-core/seo-analysis";
export { runSeoOptimizer } from "@/lib/ai-core/seo-optimizer";
