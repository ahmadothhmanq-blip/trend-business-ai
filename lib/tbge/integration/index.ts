/**
 * TBGE ↔ Website Builder integration public API (Sprint 5).
 */

export {
  resolveWebsiteTbgeRoute,
  shouldRouteWebsiteToTbgePrimary,
  shouldRunTbgeShadowMode,
} from "@/lib/tbge/integration/router";
export {
  mapWebsiteInputToTbgeBrief,
  mapWebsiteProfileToTbge,
  mapWebsiteModeToTbge,
} from "@/lib/tbge/integration/brief-mapper";
export { createPlannerLlmClientFromProvider } from "@/lib/tbge/integration/planner-llm-client";
export {
  mapTbgeSpecToWebsiteProject,
  mapTbgeFilesToWebsiteFiles,
} from "@/lib/tbge/integration/result-mapper";
export {
  buildTbgeMetrics,
  scoreOutputQuality,
  compareFilePaths,
  type TbgeIntegrationMetrics,
  type ShadowComparisonMetrics,
} from "@/lib/tbge/integration/metrics";
export { runTbgeWebsiteGeneration } from "@/lib/tbge/integration/run-website-generation";
export {
  runWebsiteGenerationWithShadowMode,
  type ShadowModeResult,
} from "@/lib/tbge/integration/shadow-mode";
export type {
  WebsiteTbgeRoute,
  WebsiteTbgeRouteMode,
  TbgeWebsiteGenerationResult,
  LegacyWebsiteGenerationRunner,
} from "@/lib/tbge/integration/types";
export type { TbgeWebsiteGenerationDeps } from "@/lib/tbge/integration/run-website-generation";
