/**
 * Canonical Website Builder orchestration entry point.
 *
 * All API routes and platform services should import from this module.
 *
 * Pipeline:
 *   generateWebsite()
 *     → lib/website/orchestrator.ts
 *     → layerRunner.run(createWebsiteBuilderAdapter())
 *     → plugins/website/* (generation engine invoked by adapter layers)
 */

export { generateWebsite } from "@/lib/website/orchestrator";

export type {
  GeneratedProjectFile,
  GeneratedWebsiteProject,
  WebsiteGenerationInput,
  WebsiteGenerationProgressEvent,
} from "@/lib/website/orchestrator";
