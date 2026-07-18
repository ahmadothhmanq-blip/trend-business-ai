/**
 * Auto Quality Engine extensions (Phase 8).
 */

import type { CoreQualityReport } from "@/lib/ai-core/layers/types";

export type CorePublishReadiness = {
  publishReady: boolean;
  score: number;
  blockers: string[];
  warnings: string[];
};

export type CoreAutoQualityReport = CoreQualityReport & {
  score: number;
  publishReady: boolean;
  seoReadinessScore?: number;
  performanceScore?: number;
  designConsistencyPassed?: boolean;
};
