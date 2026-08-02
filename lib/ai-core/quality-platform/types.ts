/**
 * Unified Quality Platform — canonical types (QE Phase 5).
 */

import type { AccessibilityReport } from "@/lib/ai-core/accessibility/validate";
import type { SemanticContentQualityReport } from "@/lib/ai-core/semantic-content-quality";
import type { UnifiedQualityScores } from "@/lib/ai-core/quality-authority";
import type { VisualDesignQualityReport } from "@/lib/ai-core/visual-design-quality";
import type { QualityReport } from "@/lib/website/types/layers";

export type UnifiedQualityIssueSource =
  | "structural"
  | "semantic"
  | "visual"
  | "accessibility"
  | "validation"
  | "publish";

export type UnifiedQualityIssue = {
  id: string;
  source: UnifiedQualityIssueSource;
  dimension: string;
  severity: "blocker" | "warning" | "info";
  message: string;
  repairHint?: string;
  filePath?: string;
};

export type UnifiedRepairQueueItem = {
  id: string;
  priority: "high" | "medium" | "low";
  source: UnifiedQualityIssueSource;
  title: string;
  instruction: string;
  dedupeKey: string;
};

export type UnifiedQualityTrace = {
  version: string;
  phase: "generation" | "publish";
  startedAt: string;
  durationMs: number;
  modules: {
    structural: boolean;
    semantic: boolean;
    visual: boolean;
    accessibility: boolean;
  };
  issueCounts: {
    total: number;
    blockers: number;
    warnings: number;
    dedupedRepairs: number;
  };
  scores: UnifiedQualityScores;
};

export type UnifiedQualityTelemetry = {
  pipelineLatencyMs: number;
  llmCalls: number;
  promptChars: number;
  repairQueueSize: number;
  repairDedupedCount: number;
  scoreStabilityHash: string;
};

export type UnifiedQualityReport = {
  passed: boolean;
  publishReady: boolean;
  summary: string;
  scores: UnifiedQualityScores;
  issues: UnifiedQualityIssue[];
  weakSections: string[];
  repairQueue: UnifiedRepairQueueItem[];
  repairInstruction: string;
  trace: UnifiedQualityTrace;
  telemetry: UnifiedQualityTelemetry;
  structural?: QualityReport;
  semantic?: SemanticContentQualityReport;
  visual?: VisualDesignQualityReport;
  accessibility?: AccessibilityReport;
};

export type UnifiedQualityDashboardModel = {
  overallScore: number;
  dimensions: Array<{
    id: string;
    label: string;
    score: number;
    status: "pass" | "warn" | "fail";
  }>;
  issueSummary: {
    blockers: number;
    warnings: number;
    topIssues: string[];
  };
  repairQueue: Array<{ id: string; title: string; priority: string }>;
  publishReady: boolean;
  lastUpdatedAt: string;
};

export type UnifiedPublishGateResult = {
  publishReady: boolean;
  blockers: string[];
  warnings: string[];
  opportunities: string[];
  scores: {
    overall: number | null;
    seo: number | null;
    conversion: number | null;
    performance: number | null;
    design: number | null;
    ux: number | null;
  };
  unifiedScores?: UnifiedQualityScores;
  qualityTrace?: UnifiedQualityTrace;
};
