/**
 * TBGE ↔ Website Builder integration types (Sprint 5).
 */

import type { TokenUsage } from "@/lib/ai/types";
import type { SiteComposition } from "@/lib/tbge/composer/types";
import type { TbgeIntegrationMetrics } from "@/lib/tbge/integration/metrics";
import type { GenerationSpec } from "@/lib/tbge/spec/types";
import type { TbgeRunTrace } from "@/lib/tbge/kernel/types";
import type { PerformanceProfilingReport } from "@/lib/ai-core/performance/website-profiler";
import type {
  GeneratedProjectFile,
  GeneratedWebsiteProject,
  WebsiteGenerationProgressEvent,
} from "@/lib/website/types";

export type WebsiteTbgeRouteMode = "legacy" | "tbge-primary" | "shadow";

export type WebsiteTbgeRoute = {
  mode: WebsiteTbgeRouteMode;
};

export type TbgeWebsiteGenerationResult = GeneratedWebsiteProject & {
  progressEvents: WebsiteGenerationProgressEvent[];
  usage: TokenUsage;
  generationTimeMs: number;
  provider: string;
  tbgeIntegration?: TbgeIntegrationMetrics;
  tbgeSpec?: GenerationSpec;
  tbgeComposition?: SiteComposition;
  tbgeTrace?: TbgeRunTrace;
};

export type LegacyWebsiteGenerationRunner = () => Promise<
  GeneratedWebsiteProject & {
    progressEvents: WebsiteGenerationProgressEvent[];
    usage: TokenUsage;
    generationTimeMs: number;
    provider: string;
    pipelinePerformanceReport?: PerformanceProfilingReport;
    pipelinePerformanceMarkdown?: string;
  }
>;

export type TbgeWebsiteGenerationOptions = {
  onProgress?: (event: string) => void;
  onFilesCheckpoint?: (
    files: GeneratedProjectFile[],
    meta: { message: string },
  ) => void | Promise<void>;
};
