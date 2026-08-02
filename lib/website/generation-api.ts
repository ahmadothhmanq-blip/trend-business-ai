/**
 * API-layer facade for Website Builder generation.
 *
 * HTTP routes should import generation errors and optional observability hooks
 * from this module instead of deep `lib/ai-core/*` paths.
 */

export { ArchitectureValidationFailure } from "@/lib/ai-core/architecture-validation";
export { runWithWebsiteProfiler } from "@/lib/ai-core/performance/profiler-context";
export { WebsitePipelineProfiler } from "@/lib/ai-core/performance/website-profiler";
export {
  E2EWebsiteProfiler,
  formatE2EMarkdownReport,
} from "@/lib/ai-core/performance/e2e-profiler";
export { runWithE2EProfiler } from "@/lib/ai-core/performance/e2e-profiler-context";
