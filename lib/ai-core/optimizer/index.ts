/**
 * AI Website Optimizer Engine.
 */

export type {
  AuditCategory,
  AuditIssueSeverity,
  OptimizationImprovement,
  RunWebsiteOptimizerResult,
  WebsiteAuditIssue,
  WebsiteAuditResult,
  WebsiteOptimizationReport,
  WebsiteQualityScore,
} from "@/lib/ai-core/optimizer/types";

export {
  runHeuristicWebsiteAudit,
  type AuditFile,
} from "@/lib/ai-core/optimizer/audit";

export { analyzeWebsiteWithDeepSeek } from "@/lib/ai-core/optimizer/analyze";

export {
  applyOptimizerFixes,
  buildOptimizerImproveInstruction,
} from "@/lib/ai-core/optimizer/apply";

export {
  computeWebsiteQualityScore,
  isPublishReadyFromScores,
} from "@/lib/ai-core/optimizer/score";

export {
  persistOptimizerArtifacts,
  type PersistOptimizerParams,
  type PersistOptimizerResult,
} from "@/lib/ai-core/optimizer/persist";

export {
  runWebsiteOptimizer,
  shouldApplyOptimizerFixes,
  type RunWebsiteOptimizerParams,
} from "@/lib/ai-core/optimizer/run";
