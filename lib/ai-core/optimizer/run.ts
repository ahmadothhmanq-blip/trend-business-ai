/**
 * AI Website Optimizer orchestration.
 * Generated website → audit → suggestions → optional apply → scores.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import type {
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreProductStrategy,
  CoreQualityReport,
} from "@/lib/ai-core/layers/types";
import type { CorePerformanceReport } from "@/lib/ai-core/performance/types";
import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import { runHeuristicWebsiteAudit } from "@/lib/ai-core/optimizer/audit";
import { analyzeWebsiteWithDeepSeek } from "@/lib/ai-core/optimizer/analyze";
import {
  applyOptimizerFixes,
  buildOptimizerImproveInstruction,
} from "@/lib/ai-core/optimizer/apply";
import { persistOptimizerArtifacts } from "@/lib/ai-core/optimizer/persist";
import {
  computeWebsiteQualityScore,
  isPublishReadyFromScores,
} from "@/lib/ai-core/optimizer/score";
import type {
  OptimizationImprovement,
  RunWebsiteOptimizerResult,
  WebsiteOptimizationReport,
} from "@/lib/ai-core/optimizer/types";

export type RunWebsiteOptimizerParams = {
  files: GeneratedProjectFile[];
  strategy?: CoreProductStrategy;
  designSystem?: CoreDesignSystem;
  profile?: CoreBusinessProfile;
  qualityReport?: CoreQualityReport;
  seoPackage?: CoreSeoPackage;
  performanceReport?: CorePerformanceReport;
  /** Apply DeepSeek file fixes (Improve with AI / optimize mode). */
  applyFixes?: boolean;
  userInstruction?: string;
  userId?: string;
  websiteGenerationId?: string;
  parentGenerationId?: string;
  aiRunId?: string;
  persist?: boolean;
  onProgress?: (message: string) => void;
};

function toImprovements(
  themes: string[],
  appliedFixes: string[],
): OptimizationImprovement[] {
  return themes.slice(0, 12).map((theme, index) => ({
    id: `imp-${index}`,
    category: theme.toLowerCase().includes("cta")
      ? "conversion"
      : theme.toLowerCase().includes("headline")
        ? "content"
        : theme.toLowerCase().includes("layout")
          ? "ux"
          : theme.toLowerCase().includes("brand")
            ? "brand"
            : theme.toLowerCase().includes("section")
              ? "sections"
              : "ux",
    title: theme.slice(0, 80),
    description: theme,
    applied: appliedFixes.some((fix) =>
      theme.toLowerCase().includes(fix.toLowerCase().replace(/^improved\s+/i, "")),
    ),
  }));
}

export function shouldApplyOptimizerFixes(input: {
  optimizeWithAi?: boolean;
  continueInstruction?: string;
  mode?: string;
}): boolean {
  if (input.optimizeWithAi) return true;
  const instruction = (input.continueInstruction ?? "").toLowerCase();
  if (instruction.includes("[optimize]")) return true;
  if (
    input.mode === "continue" &&
    /optimize|improve quality|fix (the )?website|conversion|audit/i.test(
      instruction,
    )
  ) {
    return true;
  }
  return false;
}

/**
 * Run Website Audit + scoring; optionally apply DeepSeek improvements.
 */
export async function runWebsiteOptimizer(
  params: RunWebsiteOptimizerParams,
): Promise<RunWebsiteOptimizerResult> {
  params.onProgress?.("Auditing website quality…");

  const heuristic = runHeuristicWebsiteAudit({
    files: params.files,
    strategy: params.strategy,
    designSystem: params.designSystem,
    profile: params.profile,
    qualityReport: params.qualityReport,
    seoPackage: params.seoPackage,
    performanceReport: params.performanceReport,
  });

  params.onProgress?.("Analyzing pages with AI…");
  const { audit: analyzed, improveThemes, summary } =
    await analyzeWebsiteWithDeepSeek({
      heuristic,
      files: params.files,
      strategy: params.strategy,
      designSystem: params.designSystem,
      profile: params.profile,
      userInstruction: params.userInstruction,
    });

  // Recompute scores after AI-merged issues
  const scores = computeWebsiteQualityScore({
    issues: analyzed.issues,
    qualityReport: params.qualityReport,
    seoPackage: params.seoPackage,
    performanceReport: params.performanceReport,
  });
  const audit = { ...analyzed, scores };

  let files = params.files;
  let appliedFixes: string[] = [];
  let filesChanged = false;

  if (params.applyFixes) {
    params.onProgress?.("Applying AI improvements…");
    const applied = await applyOptimizerFixes({
      files,
      audit,
      improveThemes,
      userInstruction: params.userInstruction,
      onProgress: params.onProgress,
    });
    files = applied.files;
    appliedFixes = applied.appliedFixes;
    filesChanged = applied.filesChanged;

    // Re-audit lightly after fixes for updated scores
    if (filesChanged) {
      const post = runHeuristicWebsiteAudit({
        files,
        strategy: params.strategy,
        designSystem: params.designSystem,
        profile: params.profile,
        qualityReport: params.qualityReport,
        seoPackage: params.seoPackage,
        performanceReport: params.performanceReport,
      });
      audit.scores = computeWebsiteQualityScore({
        issues: post.issues,
        qualityReport: params.qualityReport,
        seoPackage: params.seoPackage,
        performanceReport: params.performanceReport,
      });
    }
  }

  const improveInstruction = buildOptimizerImproveInstruction(
    audit,
    improveThemes,
    params.userInstruction,
  );

  const report: WebsiteOptimizationReport = {
    summary,
    scores: audit.scores,
    audit,
    improvements: toImprovements(improveThemes, appliedFixes),
    appliedFixes,
    improveInstruction,
    publishReady: isPublishReadyFromScores(audit.scores),
  };

  let auditId: string | undefined;
  let reportId: string | undefined;

  if (params.persist !== false && params.userId) {
    const persisted = await persistOptimizerArtifacts({
      userId: params.userId,
      websiteGenerationId: params.websiteGenerationId,
      parentGenerationId: params.parentGenerationId,
      aiRunId: params.aiRunId,
      report,
      action: params.applyFixes ? "optimize" : "audit",
      instruction: params.userInstruction ?? improveInstruction,
      beforeScore: heuristic.scores.overall,
    });
    auditId = persisted.auditId;
    reportId = persisted.reportId;
  }

  return { report, filesChanged, files, auditId, reportId };
}
